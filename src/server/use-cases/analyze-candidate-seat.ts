import { candidateSeatRequestSchema, type CandidateSeatRequest } from "@/contracts";
import { analysisResultSchema, type AnalysisResult } from "@/domain/schemas";
import { PrecomputedSampleCandidateAnalyzer } from "@/server/providers/fixture/precomputed-sample-candidate-analyzer";
import type { ExecutionContext } from "@/server/ports/execution-context";

const analyzer = new PrecomputedSampleCandidateAnalyzer();
const inFlight = new Map<string, Promise<AnalysisResult>>();

export async function analyzeCandidateSeat(
  input: CandidateSeatRequest,
  context: ExecutionContext,
): Promise<AnalysisResult> {
  const request = candidateSeatRequestSchema.parse(input);
  const existing = inFlight.get(request.idempotencyKey);
  if (existing) return existing;

  const promise = import("./load-classroom.ts")
    .then(({ loadClassroom }) => loadClassroom(request.questionId, context))
    .then((classroom) => analyzer.analyze(request, classroom, context))
    .then((result) => analysisResultSchema.parse(result));
  inFlight.set(request.idempotencyKey, promise);
  void promise.then(
    () => scheduleDelete(request.idempotencyKey),
    () => scheduleDelete(request.idempotencyKey),
  );
  return promise;
}

function scheduleDelete(idempotencyKey: string) {
  setTimeout(() => inFlight.delete(idempotencyKey), 30_000).unref?.();
}
