import assert from "node:assert/strict";
import { it } from "node:test";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { candidateSampleSchema } from "../../src/domain/schemas/candidate-generation.ts";
import { analyzeCandidateSeat } from "../../src/server/use-cases/analyze-candidate-seat.ts";
import { AppError } from "../../src/server/errors/app-error.ts";

it("only serves a precomputed result for an exact note, and rejects key reuse with changed content", async () => {
  const bundle = await readSnapshotBundle();
  const sample = candidateSampleSchema.parse(bundle.assets["analysis/sample.json"]);
  const request = { schemaVersion: bundle.classroom.schemaVersion, questionId: bundle.classroom.question.id, classroomRevision: bundle.classroom.revision, sampleId: sample.sampleId, noteText: sample.noteText, idempotencyKey: "exact_sample_test_001" };
  const context = () => ({ requestId: "req_sample_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
  const result = await analyzeCandidateSeat(request, context());
  assert.equal(result.meta.mode, "sample");
  assert.equal(result.meta.snapshotId, bundle.manifest.snapshotId);
  await assert.rejects(analyzeCandidateSeat({ ...request, noteText: request.noteText + "我补充一句。" }, context()), (e) => e instanceof AppError && e.code === "INVALID_INPUT");
  const oldKey = process.env.STRUCTURED_OUTPUT_API_KEY;
  process.env.STRUCTURED_OUTPUT_API_KEY = "";
  try {
    const fallback = await analyzeCandidateSeat({ ...request, sampleId: undefined, idempotencyKey: "exact_fallback_001" }, context());
    assert.equal(fallback.meta.mode, "sample");
    assert.equal(fallback.meta.fallbackFrom, "live");
    for (const [index, noteText] of [" " + request.noteText, request.noteText + "另外，我还需要考虑其他方法。"].entries()) {
      await assert.rejects(analyzeCandidateSeat({ ...request, noteText, idempotencyKey: `mismatch_sample_${index}` }, context()), (e) => e instanceof AppError && e.code === "PROVIDER_UNAVAILABLE");
    }
  } finally {
    if (oldKey === undefined) delete process.env.STRUCTURED_OUTPUT_API_KEY;
    else process.env.STRUCTURED_OUTPUT_API_KEY = oldKey;
  }
});
