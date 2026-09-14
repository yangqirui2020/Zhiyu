import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { z } from "zod";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { signChallenge, verifyChallenge } from "../../src/server/pipelines/learning/challenge-token.ts";
import { prepareLearning, completeLearning } from "../../src/server/pipelines/learning/generate.ts";
import { runLearningTurn } from "../../src/server/use-cases/run-learning-turn.ts";
import { hashNote } from "../../src/server/pipelines/candidate-seat/analyze.ts";
import { AppError } from "../../src/server/errors/app-error.ts";
import type { StructuredOutputProvider } from "../../src/server/ports/structured-output-provider.ts";

const { classroom, assets } = await readSnapshotBundle();
const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
const identity = { schemaVersion: "1.0.0-rc.2" as const, questionId: classroom.question.id, classroomRevision: classroom.revision };
const signingKey = "test-key-only-never-a-real-secret-0001";
const context = () => ({ requestId: "req_learning_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
const code = (expected: string) => (e: unknown) => e instanceof AppError && e.code === expected;
function provider(data: unknown): StructuredOutputProvider {
  return { async generate<T extends z.ZodType>(request: { schema: T }) { return { data: request.schema.parse(data), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } }; } };
}

describe("signed learning turn", () => {
  it("rejects tampering, expiry and wrong signing keys", () => {
    const now = Date.now();
    const payload = { ...identity, noteHash: sample.noteHash, expiresAt: now + 60_000, question: sample.question };
    const token = signChallenge(payload, signingKey);
    assert.deepEqual(verifyChallenge(token, signingKey, now), payload);
    for (const invalid of [token.replace(/^./, token[0] === "a" ? "b" : "a"), token + ".extra", "bad.token"]) assert.throws(() => verifyChallenge(invalid, signingKey, now), code("INVALID_INPUT"));
    assert.throws(() => verifyChallenge(token, signingKey + "wrong", now), code("INVALID_INPUT"));
    assert.throws(() => verifyChallenge(token, signingKey, now + 60_000), code("INVALID_INPUT"));
  });

  it("grounds the selected peer and refuses invented source evidence", async () => {
    const result = await prepareLearning(sample.noteText, classroom, provider(sample.question), context());
    assert.equal(result.data.seatmate.studentId, sample.question.seatmate.studentId);
    await assert.rejects(prepareLearning(sample.noteText, classroom, provider({ ...sample.question, evidenceIds: ["ev_invented"] }), context()), code("STRUCTURED_OUTPUT_INVALID"));
  });

  it("retries invalid model output once within the original deadline", async () => {
    let calls = 0;
    const repairing: StructuredOutputProvider = { async generate<T extends z.ZodType>(request: { schema: T; system: string }) {
      calls += 1;
      if (calls === 2) assert.match(request.system, /上次结果未通过/);
      return { data: request.schema.parse(calls === 1 ? { ...sample.question, evidenceIds: ["ev_invented"] } : sample.question), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
    } };
    await prepareLearning(sample.noteText, classroom, repairing, context());
    assert.equal(calls, 2);
    calls = 0;
    await assert.rejects(prepareLearning(sample.noteText, classroom, repairing, { ...context(), deadlineAt: Date.now() + 1000 }), code("STRUCTURED_OUTPUT_INVALID"));
    assert.equal(calls, 1);
  });

  it("preserves original expressions and removes unsupported change highlights", async () => {
    const answer = "我暂时保持原来的观点，还没有确定具体的调整条件。";
    const draft = structuredClone(sample.completion);
    draft.classNote.before = "模型编造的原始观点";
    draft.classNote.changed = "模型编造的认知改变";
    draft.classNote.after = "我已经完全改变了观点。";
    draft.classNote.afterHighlights = ["完全改变"];
    const { data } = await completeLearning(sample.noteText, answer, sample.question, classroom, provider(draft), context());
    assert.equal(data.classNote.before, sample.noteText);
    assert.equal(data.classNote.changed, answer);
    assert.deepEqual(data.classNote.afterHighlights, []);
  });

  it("rejects long-form answers disguised as an outline", async () => {
    const draft = structuredClone(sample.completion);
    draft.zhihuDraft.outline[0].text = "文".repeat(101);
    await assert.rejects(completeLearning(sample.noteText, sample.answerText, sample.question, classroom, provider(draft), context()), code("STRUCTURED_OUTPUT_INVALID"));
  });

  it("binds Sample results to the note, answer, signed question and revision", async () => {
    const priorSecret = process.env.LEARNING_SESSION_SECRET;
    const priorKey = process.env.STRUCTURED_OUTPUT_API_KEY;
    process.env.LEARNING_SESSION_SECRET = signingKey;
    process.env.STRUCTURED_OUTPUT_API_KEY = "";
    try {
      const request = { ...identity, stage: "prepare" as const, noteText: sample.noteText, idempotencyKey: "learning_sample_prepare" };
      const prepared = await runLearningTurn(request, context());
      assert.equal(prepared.meta.mode, "sample");
      if (prepared.data.stage !== "prepared") throw new Error("wrong stage");
      const complete = { ...request, stage: "complete" as const, answerText: sample.answerText, challengeToken: prepared.data.challengeToken, idempotencyKey: "learning_sample_complete" };
      assert.equal((await runLearningTurn(complete, context())).meta.mode, "sample");
      await assert.rejects(runLearningTurn({ ...complete, noteText: sample.noteText + "改变我的原始观点。", idempotencyKey: "learning_note_mismatch" }, context()), code("INVALID_INPUT"));
      await assert.rejects(runLearningTurn({ ...complete, answerText: sample.answerText + "我还没有确定。", idempotencyKey: "learning_answer_mismatch" }, context()), code("PROVIDER_UNAVAILABLE"));
      await assert.rejects(runLearningTurn({ ...complete, classroomRevision: "stale", idempotencyKey: "learning_revision_mismatch" }, context()), code("CLASSROOM_REVISION_MISMATCH"));
      await assert.rejects(runLearningTurn({ ...complete, answerText: "改成不同的回应，不能混用幂等标识。" }, context()), code("INVALID_INPUT"));
      assert.equal(verifyChallenge(prepared.data.challengeToken, signingKey).noteHash, hashNote(sample.noteText));
    } finally {
      if (priorSecret === undefined) delete process.env.LEARNING_SESSION_SECRET; else process.env.LEARNING_SESSION_SECRET = priorSecret;
      if (priorKey === undefined) delete process.env.STRUCTURED_OUTPUT_API_KEY; else process.env.STRUCTURED_OUTPUT_API_KEY = priorKey;
    }
  });
});
