import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mockClassroomFixture } from "../../data/fixtures/classrooms/learn-programming.ts";
import { sourceContentSchema } from "../../src/domain/schemas/classroom.ts";
import { embeddingResultSchema } from "../../src/domain/schemas/provider.ts";
import { learningTurnRequestSchema, learningQuestionDraftSchema, validateLearningReferences } from "../../src/domain/schemas/learning.ts";
import { snapshotManifestSchema, validateSnapshotClassroom } from "../../src/domain/schemas/snapshot.ts";

describe("real delivery contracts", () => {
  it("requires the new version to label official answer summaries", () => {
    const source = mockClassroomFixture.sources[0];
    assert.equal(sourceContentSchema.safeParse({ ...source, textKind: "answer_summary" }).success, false);
    assert.equal(sourceContentSchema.safeParse({ ...source, schemaVersion: "1.0.0-rc.2", textKind: "answer_summary" }).success, true);
  });

  it("rejects zero, non-finite and incorrectly sized embedding vectors", () => {
    const base = { modelId: "Xenova/bge-small-zh-v1.5", revision: "75c43b069aac4d136ba6bc1122f995fedcfd2781", dimensions: 512, normalized: true };
    assert.equal(embeddingResultSchema.safeParse({ ...base, vectors: [[1, ...Array(511).fill(0)]] }).success, true);
    for (const vector of [Array(512).fill(0), Array(384).fill(1), [NaN, ...Array(511).fill(0)]]) {
      assert.equal(embeddingResultSchema.safeParse({ ...base, vectors: [vector] }).success, false);
    }
  });

  it("requires a response and challenge token only for completion", () => {
    const prepare = { schemaVersion: "1.0.0-rc.2", stage: "prepare", questionId: "q_learn_programming", classroomRevision: "snapshot-v1", noteText: "观点".repeat(30), idempotencyKey: "req_learning_1" };
    assert.equal(learningTurnRequestSchema.safeParse(prepare).success, true);
    assert.equal(learningTurnRequestSchema.safeParse({ ...prepare, stage: "complete" }).success, false);
    assert.equal(learningTurnRequestSchema.safeParse({ ...prepare, stage: "complete", answerText: "补充条件".repeat(8), challengeToken: "test_token_value" }).success, true);
  });

  it("rejects invented evidence and a seatmate unconnected to that evidence", () => {
    const student = mockClassroomFixture.students[0];
    const evidence = mockClassroomFixture.evidence.find((e) => e.kind === "source_excerpt" && e.sourceContentId === student.sourceContentId)!;
    const draft = learningQuestionDraftSchema.parse({ seatmate: { studentId: student.id, rationale: "相关", commonGround: "相同点", difference: "不同点", challenge: "需要怎样的前提？", sampleAnswer: "先明确目标再决定路径。" }, evidenceIds: [evidence.id] });
    assert.deepEqual(validateLearningReferences(draft, mockClassroomFixture), []);
    assert.ok(validateLearningReferences({ ...draft, evidenceIds: ["ev_invented"] }, mockClassroomFixture).length > 0);
    assert.ok(validateLearningReferences({ ...draft, seatmate: { ...draft.seatmate, studentId: mockClassroomFixture.students[1].id } }, mockClassroomFixture).length > 0);
  });

  it("requires snapshot assets, provenance and an actual source count", () => {
    const checksum = "a".repeat(64);
    const manifest = {
      schemaVersion: "1.0.0-rc.2", snapshotId: "snap_test", questionId: "q_learn_programming", classroomRevision: "snapshot-v1",
      generatedAt: "2026-09-15T00:00:00Z", capturedAt: "2026-09-14T23:00:00Z", sourceProvider: "zhihu_question_answers", sourceCount: 15, fetchedCount: 15,
      queryHistory: [{ endpoint: "question_answers", questionUrl: "https://www.zhihu.com/question/123", offset: 0, limit: 20, capturedAt: "2026-09-14T23:00:00Z" }],
      pipelineVersion: "1", promptVersions: { argument: "1" }, modelVersions: { structured: "deepseek-flash" },
      embeddingModel: { id: "Xenova/bge-small-zh-v1.5", revision: "75c43b069aac4d136ba6bc1122f995fedcfd2781", dimensions: 512, pooling: "cls", normalized: true },
      clustering: { algorithm: "agglomerative", linkage: "ward", distance: "euclidean", clusterCount: 3, seed: 42 },
      checksums: { "sources.json": checksum, "classroom.json": checksum, "narrative.json": checksum }, exclusions: [],
    };
    const parsed = snapshotManifestSchema.parse(manifest);
    assert.ok(validateSnapshotClassroom(parsed, mockClassroomFixture).length > 0);
    assert.equal(snapshotManifestSchema.safeParse({ ...manifest, sourceCount: 7 }).success, false);
    assert.equal(snapshotManifestSchema.safeParse({ ...manifest, checksums: { ...manifest.checksums, "../secret.json": checksum } }).success, false);
  });
});
