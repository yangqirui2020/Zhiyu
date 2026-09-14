import "server-only";
import { createHash } from "node:crypto";
import { candidateSeatRequestSchema, type CandidateSeatRequest, type ApiSuccess } from "../../contracts/api.ts";
import { analysisResultSchema, validateAnalysisRelations, type AnalysisResult } from "../../domain/schemas/index.ts";
import { candidateSampleSchema } from "../../domain/schemas/candidate-generation.ts";
import { loadSnapshotBundle } from "../providers/snapshot/snapshot-bundle.ts";
import { LiveCandidateAnalyzer } from "../providers/live/live-candidate-analyzer.ts";
import { hashNote } from "../pipelines/candidate-seat/analyze.ts";
import { AppError } from "../errors/app-error.ts";
import type { ExecutionContext } from "../ports/execution-context.ts";

const inFlight = new Map<string, { fingerprint: string; expiresAt: number; promise: Promise<ApiSuccess<AnalysisResult>> }>();

async function execute(request: CandidateSeatRequest, context: ExecutionContext): Promise<ApiSuccess<AnalysisResult>> {
  if (process.env.NODE_ENV !== "production" && process.env.DATA_MODE === "mock") {
    const { loadClassroom } = await import("./load-classroom.ts");
    const { PrecomputedSampleCandidateAnalyzer } = await import("../providers/fixture/precomputed-sample-candidate-analyzer.ts");
    const classroom = await loadClassroom(request.questionId, context);
    const data = await new PrecomputedSampleCandidateAnalyzer().analyze(request, classroom, context);
    return { ok: true, data, meta: { requestId: context.requestId, servedAt: new Date().toISOString(), mode: "mock", warnings: data.warnings } };
  }
  const { classroom, manifest, assets } = await loadSnapshotBundle(request.questionId);
  if (request.classroomRevision !== classroom.revision) throw new AppError("CLASSROOM_REVISION_MISMATCH", "课堂资料已更新，请重新打开教室后再试。", 409, false, "switch_question");
  const parsedSample = candidateSampleSchema.safeParse(assets["analysis/sample.json"]);
  const sample = parsedSample.success ? parsedSample.data : null;
  const exactSample = sample && sample.noteHash === hashNote(request.noteText)
    && sample.noteText === request.noteText && sample.result.classroomRevision === classroom.revision
    && validateAnalysisRelations(sample.result, request.noteText).length === 0;
  const sampleResult = (fallbackReason?: string): ApiSuccess<AnalysisResult> => ({
    ok: true, data: sample!.result,
    meta: { requestId: context.requestId, servedAt: new Date().toISOString(), mode: "sample", snapshotId: manifest.snapshotId, capturedAt: manifest.capturedAt, warnings: ["这是与当前示例观点精确匹配的预计算结果。", ...sample!.result.warnings], ...(fallbackReason ? { fallbackFrom: "live" as const, fallbackReason } : {}) },
  });
  if (exactSample && request.sampleId === sample!.sampleId) return sampleResult();
  try {
    const data = analysisResultSchema.parse(await new LiveCandidateAnalyzer().analyze(request, classroom, context));
    return { ok: true, data, meta: { requestId: context.requestId, servedAt: new Date().toISOString(), mode: "live", warnings: data.warnings } };
  } catch (error) {
    if (exactSample && !context.signal.aborted && error instanceof AppError && ["PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "PROVIDER_RATE_LIMITED", "STRUCTURED_OUTPUT_INVALID"].includes(error.code)) return sampleResult(error.message);
    throw error;
  }
}

export async function analyzeCandidateSeat(input: CandidateSeatRequest, context: ExecutionContext): Promise<ApiSuccess<AnalysisResult>> {
  const request = candidateSeatRequestSchema.parse(input);
  if (request.noteText.trim().length < 50) throw new AppError("INVALID_INPUT", "请写下至少 50 个字符的观点与理由。", 400, false, "edit_input");
  context.signal.throwIfAborted();
  for (const [key, entry] of inFlight) if (entry.expiresAt < Date.now()) inFlight.delete(key);
  const fingerprint = createHash("sha256").update(JSON.stringify(request)).digest("hex");
  const existing = inFlight.get(request.idempotencyKey);
  if (existing && existing.fingerprint !== fingerprint) throw new AppError("INVALID_INPUT", "同一请求标识不能提交不同内容，请重新提交。", 400, false, "retry");
  if (!existing && inFlight.size >= 64) throw new AppError("PROVIDER_RATE_LIMITED", "当前请求较多，请稍后重试。", 429, true, "retry");
  let entry = existing;
  if (!entry) {
    const promise = execute(request, context);
    entry = { fingerprint, expiresAt: Date.now() + 30_000, promise };
    inFlight.set(request.idempotencyKey, entry);
    const ownEntry = entry;
    void promise.catch(() => { if (inFlight.get(request.idempotencyKey) === ownEntry) inFlight.delete(request.idempotencyKey); });
    setTimeout(() => { if (inFlight.get(request.idempotencyKey) === ownEntry) inFlight.delete(request.idempotencyKey); }, 30_000).unref();
  }
  const result = structuredClone(await entry.promise);
  return { ...result, meta: { ...result.meta, requestId: context.requestId, servedAt: new Date().toISOString() } };
}
