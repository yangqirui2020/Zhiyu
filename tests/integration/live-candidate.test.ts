import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { z } from "zod";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { analyzeAgainstClassroom, hashNote, noteEvidenceFor } from "../../src/server/pipelines/candidate-seat/analyze.ts";
import { candidateGenerationSchema } from "../../src/domain/schemas/candidate-generation.ts";
import { validateAnalysisRelations } from "../../src/domain/schemas/candidate.ts";
import type { StructuredOutputProvider } from "../../src/server/ports/structured-output-provider.ts";
import { AppError } from "../../src/server/errors/app-error.ts";

const { classroom } = await readSnapshotBundle();
const note = "学习编程前，我会做一个两周的小项目，记录求助成本和卡住的位置，再通过实验选择继续学习还是调整路线。这些记录比只按语言的流行度选择更适合我的目标。";
const request = { schemaVersion: classroom.schemaVersion, questionId: classroom.question.id, classroomRevision: classroom.revision, noteText: note, idempotencyKey: "test_candidate_001" };
const context = () => ({ requestId: "req_test_candidate", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
const noteId = noteEvidenceFor(note)[0].id;
const sourceId = classroom.evidence.find((e) => e.kind === "source_excerpt")!.id;
const draft = { claimText: "先通过两周实验选择学习路线。", noteEvidenceIds: [noteId], relevance: { value: "related", evidenceIds: [noteId], explanation: "回应如何开始学习。" }, noteSupport: { value: "supported", evidenceIds: [noteId], explanation: "笔记提供了具体的记录方法。" }, coverage: { value: "limited", evidenceIds: [sourceId], explanation: "当前摘要中实验退出条件覆盖较少。" }, outline: null };
function provider(data: unknown): StructuredOutputProvider {
  return { async generate<T extends z.ZodType>(input: { schema: T; prompt: string }) {
    const sent = JSON.parse(input.prompt);
    assert.equal(sent.sources.length, classroom.evidence.filter((e) => e.kind === "source_excerpt").length);
    return { data: input.schema.parse(data), metadata: { provider: "deepseek", modelId: "stub-test", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
  } };
}
describe("live Candidate grounding", () => {
  it("resolves citations from the actual input and complete classroom sources", async () => {
    const result = await analyzeAgainstClassroom(request, classroom, provider(draft), context());
    assert.equal(result.status, "success");
    assert.equal(result.candidateSeats.length, 1);
    assert.deepEqual(validateAnalysisRelations(result, note), []);
    assert.equal(result.evidence.find((e) => e.id === noteId)?.text, note);
  });
  for (const [dimension, value] of [["relevance", "unrelated"], ["noteSupport", "insufficient"], ["coverage", "covered"], ["coverage", "partial"], ["coverage", "uncertain"]] as const) {
    it(`does not create a seat for ${dimension}=${value}`, async () => {
      const data = { ...draft, [dimension]: { ...draft[dimension], value } };
      const result = await analyzeAgainstClassroom(request, classroom, provider(data), context());
      assert.equal(result.status, value === "uncertain" ? "partial" : "no_candidate");
      assert.equal(result.candidateSeats.length, 0);
    });
  }
  it("rejects unknown evidence and source/note substitution", async () => {
    for (const data of [ { ...draft, coverage: { ...draft.coverage, evidenceIds: ["ev_invented"] } }, { ...draft, coverage: { ...draft.coverage, evidenceIds: [noteId] } }, { ...draft, noteSupport: { ...draft.noteSupport, evidenceIds: [sourceId] } } ]) {
      candidateGenerationSchema.parse(data);
      await assert.rejects(analyzeAgainstClassroom(request, classroom, provider(data), context()), (e) => e instanceof AppError && e.code === "STRUCTURED_OUTPUT_INVALID");
    }
  });
  it("refuses stale revisions before a model call", async () => {
    await assert.rejects(analyzeAgainstClassroom({ ...request, classroomRevision: "stale" }, classroom, provider(draft), context()), (e) => e instanceof AppError && e.code === "CLASSROOM_REVISION_MISMATCH");
  });
  it("preserves exact Unicode ranges and never splits surrogate pairs", () => {
    const text = "x".repeat(499) + "🙂" + "\r\ne\u0301" + "文".repeat(501);
    const chunks = noteEvidenceFor(text);
    assert.equal(chunks.map((e) => e.text).join(""), text);
    for (const chunk of chunks) {
      assert.equal(chunk.kind, "note_excerpt");
      if (chunk.kind === "note_excerpt") assert.equal(text.slice(chunk.start, chunk.end), chunk.text);
      assert.equal(chunk.text.isWellFormed(), true);
    }
    assert.equal(hashNote(" é\r\n "), hashNote("e\u0301\n"));
  });
});
