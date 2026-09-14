import assert from "node:assert/strict";
import { it } from "node:test";
import type { z } from "zod";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { prepareLearning, completeLearning } from "../../src/server/pipelines/learning/generate.ts";
import { invitationFor } from "../../data/contributions/invitations.ts";
import { experienceNote } from "../../src/domain/schemas/contribution.ts";
import type { StructuredOutputProvider } from "../../src/server/ports/structured-output-provider.ts";
const { classroom, assets } = await readSnapshotBundle();
const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
const context = () => ({ requestId: "req_contribution_test", signal: new AbortController().signal, deadlineAt: Date.now() + 10_000, mode: "live" as const });
const systems: string[] = [];
const provider: StructuredOutputProvider = { async generate<T extends z.ZodType>(request: { schema: T; schemaName: string; system: string; prompt: string }) {
  systems.push(request.system);
  assert.ok(JSON.parse(request.prompt).noteText);
  return { data: request.schema.parse(request.schemaName === "LearningQuestion" ? sample.question : sample.completion), metadata: { provider: "deepseek", modelId: "stub", generatedAt: new Date().toISOString(), inputTokens: 1, outputTokens: 1 } };
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
