import assert from "node:assert/strict";
import { it } from "node:test";
import type { z } from "zod";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { prepareLearning, completeLearning } from "../../src/server/pipelines/learning/generate.ts";
import { invitationFor } from "../../data/contributions/invitations.ts";
import { experienceNote } from "../../src/domain/schemas/contribution.ts";
import type { StructuredOutputProvider } from "../../src/server/ports/structured-output-provider.ts";
import { AppError } from "../../src/server/errors/app-error.ts";
const { classroom, assets } = await readSnapshotBundle();
const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
const context = () => ({ requestId: "req_contribution_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
const systems: string[] = [];
const provider: StructuredOutputProvider = { async generate<T extends z.ZodType>(request: { schema: T; schemaName: string; system: string; prompt: string }) {
  systems.push(request.system);
  const noteText = JSON.parse(request.prompt).noteText;
  assert.ok(noteText);
  const question = noteText.startsWith("【经验入席】") ? { ...sample.question, seatmate: { ...sample.question.seatmate, challenge: "你用哪一个具体步骤检查这次结果是否可重复？" } } : sample.question;
  return { data: request.schema.parse(request.schemaName === "LearningQuestion" ? question : sample.completion), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
} };
it("uses one grounded question and bounded experience instructions in both AI stages", async () => {
  const note = experienceNote(invitationFor(classroom.question.id).example);
  const answer = "这只是虚构测试回应，保留尚未换环境验证的条件。";
  const q = await prepareLearning(note, classroom, provider, context());
  const result = await completeLearning(note, answer, q.data, classroom, provider, context());
  assert.equal(systems.length, 2);
  for (const system of systems) { assert.match(system, /均未独立核验/); assert.match(system, /一个细节/); assert.match(system, /不要求观点新颖/); assert.match(system, /不把单次经历升级为普遍规律/); }
  assert.equal(result.data.classNote.changed, answer);
  assert.ok(q.data.evidenceIds.every(id => classroom.evidence.some(e => e.id === id)));
});
it("preserves the original learning behavior for ordinary notes", async () => {
  systems.length = 0;
  await prepareLearning(sample.noteText, classroom, provider, context());
  assert.ok(!systems[0].includes("当前是经验入席"));
  assert.match(systems[0], /仅生成一次具体追问/);
});
it("repairs an internal analysis paragraph into one direct user question", async () => {
  let calls = 0;
  const repair: StructuredOutputProvider = { async generate<T extends z.ZodType>(request: { schema: T }) {
    calls++;
    const challenge = calls === 1 ? "用户提到结果成功，但未说明怎么测试。" : "你准备用哪一个检查步骤确认结果不是碰巧成功？";
    return { data: request.schema.parse({ ...sample.question, seatmate: { ...sample.question.seatmate, challenge } }), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
  } };
  const result = await prepareLearning(experienceNote(invitationFor(classroom.question.id).example), classroom, repair, context());
  assert.equal(calls, 2); assert.match(result.data.seatmate.challenge, /^你.*？$/);
});
it("rejects repeated non-questions and multiple questions within the existing retry budget", async () => {
  let calls = 0;
  const invalid: StructuredOutputProvider = { async generate<T extends z.ZodType>(request: { schema: T }) {
    calls++;
    return { data: request.schema.parse({ ...sample.question, seatmate: { ...sample.question.seatmate, challenge: "你测试了吗？你还准备怎么做？" } }), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
  } };
  await assert.rejects(prepareLearning(experienceNote(invitationFor(classroom.question.id).example), classroom, invalid, context()), error => error instanceof AppError && error.code === "STRUCTURED_OUTPUT_INVALID");
  assert.equal(calls, 2);
});
