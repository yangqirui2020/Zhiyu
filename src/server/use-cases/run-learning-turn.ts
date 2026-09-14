import "server-only";
import { createHash } from "node:crypto";
import { learningTurnRequestSchema, learningTurnResultSchema, validateLearningReferences, type LearningTurnRequest, type LearningTurnResult } from "../../domain/schemas/learning.ts";
import { learningSampleSchema } from "../../domain/schemas/learning-sample.ts";
import type { ApiSuccess } from "../../contracts/api.ts";
import type { ExecutionContext } from "../ports/execution-context.ts";
import { loadClassroomBundle } from "../providers/catalog/classroom-bundle.ts";
import { LiveLearningTurnProvider } from "../providers/live/live-learning-turn-provider.ts";
import { signChallenge, verifyChallenge } from "../pipelines/learning/challenge-token.ts";
import { hashNote } from "../pipelines/candidate-seat/analyze.ts";
import { AppError } from "../errors/app-error.ts";

const requests = new Map<string, { fingerprint: string; promise: Promise<ApiSuccess<LearningTurnResult>> }>();
async function execute(request: LearningTurnRequest, context: ExecutionContext): Promise<ApiSuccess<LearningTurnResult>> {
  const { classroom, manifest, assets } = await loadClassroomBundle(request.questionId);
  if (request.classroomRevision !== classroom.revision) throw new AppError("CLASSROOM_REVISION_MISMATCH", "课堂资料已更新，请重新开始这节课。", 409, false, "switch_question");
  const payload = request.stage === "complete" ? verifyChallenge(request.challengeToken) : null;
  if (payload && (payload.questionId !== request.questionId || payload.classroomRevision !== request.classroomRevision || payload.noteHash !== hashNote(request.noteText))) throw new AppError("INVALID_INPUT", "追问与当前观点不匹配，请重新开始。", 400, false, "none");
  const parsed = learningSampleSchema.safeParse(assets["learning/sample.json"]);
  const sample = parsed.success ? parsed.data : null;
  const exactNote = sample && sample.questionId === request.questionId && sample.classroomRevision === classroom.revision && sample.noteHash === hashNote(request.noteText) && sample.noteText === request.noteText && !validateLearningReferences(sample.question, classroom).length && !validateLearningReferences(sample.completion, classroom).length;
  const exactCompletion = request.stage === "complete" && sample && sample.replyHash === hashNote(request.answerText) && sample.answerText === request.answerText && JSON.stringify(payload?.question) === JSON.stringify(sample.question);
  if (exactNote && (request.stage === "prepare" || exactCompletion)) {
    const identity = { schemaVersion: "1.0.0-rc.2" as const, questionId: request.questionId, classroomRevision: request.classroomRevision };
    const data = learningTurnResultSchema.parse(request.stage === "prepare" ? { ...identity, ...sample!.question, stage: "prepared", challengeToken: signChallenge({ ...identity, noteHash: sample!.noteHash, question: sample!.question, expiresAt: Date.now() + 3_600_000 }) } : { ...identity, ...sample!.completion, stage: "completed", id: `learning_sample_${sample!.replyHash.slice(0, 24)}` });
    return { ok: true, data, meta: { requestId: context.requestId, mode: manifest ? "sample" : "mock", servedAt: new Date().toISOString(), ...(manifest ? { snapshotId: manifest.snapshotId, capturedAt: manifest.capturedAt } : {}), warnings: [...classroom.provenance.warnings, "当前结果与示例观点、追问及本阶段输入精确匹配，是预计算示例。"] } };
  }
  const data = await new LiveLearningTurnProvider().run(request, context);
  return { ok: true, data, meta: { requestId: context.requestId, mode: "live", servedAt: new Date().toISOString(), warnings: [...classroom.provenance.warnings, "根据你的输入实时整理；AI 草稿请自行核对。"] } };
}
export async function runLearningTurn(input: LearningTurnRequest, context: ExecutionContext): Promise<ApiSuccess<LearningTurnResult>> {
  const request = learningTurnRequestSchema.parse(input);
  context.signal.throwIfAborted();
  if (request.noteText.trim().length < 50 || (request.stage === "complete" && request.answerText.trim().length < 10)) throw new AppError("INVALID_INPUT", "请补充观点或回应后再提交。", 400, false, "edit_input");
  const fingerprint = createHash("sha256").update(JSON.stringify(request)).digest("hex");
  let entry = requests.get(request.idempotencyKey);
  if (entry && entry.fingerprint !== fingerprint) throw new AppError("INVALID_INPUT", "同一请求标识不能提交不同内容，请重试。", 400, false, "retry");
  if (!entry) {
    if (requests.size >= 64) throw new AppError("PROVIDER_RATE_LIMITED", "当前请求较多，请稍后重试。", 429, true, "retry");
    entry = { fingerprint, promise: execute(request, context) }; requests.set(request.idempotencyKey, entry);
    const own = entry;
    void entry.promise.catch(() => { if (requests.get(request.idempotencyKey) === own) requests.delete(request.idempotencyKey); });
    setTimeout(() => { if (requests.get(request.idempotencyKey) === own) requests.delete(request.idempotencyKey); }, 30_000).unref();
  }
  const result = structuredClone(await entry.promise);
  return { ...result, meta: { ...result.meta, requestId: context.requestId, servedAt: new Date().toISOString() } };
}
