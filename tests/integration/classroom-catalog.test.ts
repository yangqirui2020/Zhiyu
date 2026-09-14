import assert from "node:assert/strict";
import { it } from "node:test";
import { classroomCatalog } from "../../data/classrooms/catalog.ts";
import { classroomSchema, sourceContentSchema } from "../../src/domain/schemas/classroom.ts";
import { loadClassroomBundle } from "../../src/server/providers/catalog/classroom-bundle.ts";
import { candidateSampleSchema } from "../../src/domain/schemas/candidate-generation.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { analyzeCandidateSeat } from "../../src/server/use-cases/analyze-candidate-seat.ts";
import { runLearningTurn } from "../../src/server/use-cases/run-learning-turn.ts";
import { AppError } from "../../src/server/errors/app-error.ts";

const context = () => ({ requestId: "req_catalog_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
const fails = (code: string) => (error: unknown) => error instanceof AppError && error.code === code;

it("opens three isolated classrooms with truthful source identities and different lessons", async () => {
  const bundles = await Promise.all(classroomCatalog.map(room => loadClassroomBundle(room.questionId)));
  assert.deepEqual(bundles.map(bundle => bundle.classroom.students.length), [12, 24, 24]);
  assert.equal(new Set(bundles.flatMap(bundle => bundle.classroom.sources.map(s => s.id))).size, 60);
  assert.equal(new Set(bundles.map(bundle => bundle.narrative.noteText)).size, 3);
  for (const bundle of bundles.slice(1)) {
    assert.equal(bundle.manifest, null);
    assert.equal(bundle.classroom.provenance.mode, "mock");
    assert.equal(new Set(bundle.classroom.sources.map(s => s.excerpt)).size, 24);
    assert.ok(bundle.classroom.sources.every(s => s.provider === "synthetic" && s.textKind === "synthetic_excerpt"));
    assert.equal(classroomSchema.safeParse({ ...bundle.classroom, provenance: { ...bundle.classroom.provenance, mode: "snapshot" } }).success, false);
    assert.equal(sourceContentSchema.safeParse({ ...bundle.classroom.sources[0], provider: "zhihu" }).success, false);
  }
  bundles[1].classroom.students.pop();
  assert.equal((await loadClassroomBundle(classroomCatalog[1].questionId)).classroom.students.length, 24);
  await assert.rejects(loadClassroomBundle("q_missing"), fails("QUESTION_NOT_FOUND"));
});

it("completes each classroom's exact sample through candidate, signed challenge and personal note", async () => {
  process.env.LEARNING_SESSION_SECRET = "catalog-test-only-signing-key-000000000000";
  for (const room of classroomCatalog) {
    const bundle = await loadClassroomBundle(room.questionId);
    const candidate = candidateSampleSchema.parse(bundle.assets["analysis/sample.json"]);
    const sample = learningSampleSchema.parse(bundle.assets["learning/sample.json"]);
    const base = { schemaVersion: "1.0.0-rc.2" as const, questionId: room.questionId, classroomRevision: bundle.classroom.revision, noteText: sample.noteText };
    const result = await analyzeCandidateSeat({ ...base, sampleId: candidate.sampleId, idempotencyKey: `catalog_candidate_${room.number}` }, context());
    assert.equal(result.data.status, "success");
    assert.equal(result.meta.mode, room.mode === "snapshot" ? "sample" : "mock");
    const prepared = await runLearningTurn({ ...base, stage: "prepare", idempotencyKey: `catalog_prepare_${room.number}` }, context());
    assert.equal(prepared.data.stage, "prepared");
    if (prepared.data.stage !== "prepared") throw new Error("prepare required");
    const complete = await runLearningTurn({ ...base, stage: "complete", challengeToken: prepared.data.challengeToken, answerText: sample.answerText, idempotencyKey: `catalog_complete_${room.number}` }, context());
    assert.equal(complete.data.stage, "completed");
    if (complete.data.stage !== "completed") throw new Error("completion required");
    assert.equal(complete.data.classNote.before, sample.noteText);
    assert.equal(complete.data.classNote.changed, sample.answerText);
    assert.equal(complete.data.zhihuDraft.outline.length, 3);
    assert.ok(complete.data.evidenceIds.every(id => bundle.classroom.evidence.some(e => e.id === id)));
  }
});

it("never reuses a different classroom, note or answer when the live provider fails", async () => {
  process.env.STRUCTURED_OUTPUT_API_KEY = "";
  process.env.LEARNING_SESSION_SECRET = "catalog-test-only-signing-key-000000000000";
  const room = classroomCatalog[1];
  const bundle = await loadClassroomBundle(room.questionId);
  const sample = learningSampleSchema.parse(bundle.assets["learning/sample.json"]);
  const base = { schemaVersion: "1.0.0-rc.2" as const, questionId: room.questionId, classroomRevision: bundle.classroom.revision, noteText: sample.noteText };
  await assert.rejects(analyzeCandidateSeat({ ...base, noteText: sample.noteText + "补充一个不同的条件。", sampleId: room.sampleId, idempotencyKey: "catalog_different_note" }, context()), fails("PROVIDER_UNAVAILABLE"));
  await assert.rejects(analyzeCandidateSeat({ ...base, classroomRevision: "other_revision", sampleId: room.sampleId, idempotencyKey: "catalog_wrong_revision" }, context()), fails("CLASSROOM_REVISION_MISMATCH"));
  const prepared = await runLearningTurn({ ...base, stage: "prepare", idempotencyKey: "catalog_mismatch_prepare" }, context());
  if (prepared.data.stage !== "prepared") throw new Error("prepare required");
  await assert.rejects(runLearningTurn({ ...base, stage: "complete", answerText: "我暂时不确定这个条件，想要再讨论一下。", challengeToken: prepared.data.challengeToken, idempotencyKey: "catalog_different_answer" }, context()), fails("PROVIDER_UNAVAILABLE"));
  const other = await loadClassroomBundle(classroomCatalog[2].questionId);
  await assert.rejects(runLearningTurn({ ...base, questionId: other.classroom.question.id, classroomRevision: other.classroom.revision, stage: "complete", answerText: sample.answerText, challengeToken: prepared.data.challengeToken, idempotencyKey: "catalog_wrong_room_token" }, context()), fails("INVALID_INPUT"));
});
