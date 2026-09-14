import { z } from "zod";
import type { Classroom } from "./classroom.ts";

const short = z.string().min(1).max(300);
const evidenceIds = z.array(z.string().regex(/^ev_[a-z0-9_-]+$/)).min(1).max(12);
export const seatmateDraftSchema = z.object({
  studentId: z.string().regex(/^stu_[a-z0-9_-]+$/),
  rationale: short,
  commonGround: short,
  difference: short,
  challenge: short,
  sampleAnswer: short,
});
export const learningQuestionDraftSchema = z.object({ seatmate: seatmateDraftSchema, evidenceIds });
export const learningCompletionDraftSchema = z.object({
  classNote: z.object({ before: short, heard: z.array(short).min(1).max(5), changed: short, after: z.string().min(1).max(600), afterHighlights: z.array(short).max(5) }),
  mySeat: z.object({ viewpoint: short, reasons: short, addedCondition: short, delta: short }),
  zhihuDraft: z.object({ title: short, outline: z.array(z.object({ label: short, text: short })).min(3).max(5), note: short }),
  evidenceIds,
});
const identity = {
  schemaVersion: z.literal("1.0.0-rc.2"),
  questionId: z.string().regex(/^q_[a-z0-9_-]+$/),
  classroomRevision: z.string().min(1),
};
const requestBase = { ...identity, noteText: z.string().min(50).max(8000), idempotencyKey: z.string().min(8).max(128) };
export const learningTurnRequestSchema = z.discriminatedUnion("stage", [
  z.object({ ...requestBase, stage: z.literal("prepare") }),
  z.object({ ...requestBase, stage: z.literal("complete"), answerText: z.string().min(10).max(4000), challengeToken: z.string().min(10).max(20_000) }),
]);
export const learningChallengePayloadSchema = z.object({
  ...identity, noteHash: z.string().regex(/^[a-f0-9]{64}$/), expiresAt: z.number().int().positive(), question: learningQuestionDraftSchema,
});
export const learningTurnResultSchema = z.discriminatedUnion("stage", [
  learningQuestionDraftSchema.extend({ ...identity, stage: z.literal("prepared"), challengeToken: z.string().min(10).max(20_000) }),
  learningCompletionDraftSchema.extend({ ...identity, stage: z.literal("completed"), id: z.string().regex(/^learning_[a-z0-9_-]+$/) }),
]);
export type LearningTurnRequest = z.infer<typeof learningTurnRequestSchema>;
export type LearningTurnResult = z.infer<typeof learningTurnResultSchema>;
export type LearningQuestionDraft = z.infer<typeof learningQuestionDraftSchema>;
export type LearningCompletionDraft = z.infer<typeof learningCompletionDraftSchema>;
export type LearningChallengePayload = z.infer<typeof learningChallengePayloadSchema>;

export function validateLearningReferences(draft: LearningQuestionDraft | LearningCompletionDraft, classroom: Classroom): string[] {
  const issues: string[] = [];
  const valid = new Set(classroom.evidence.filter((e) => e.kind === "source_excerpt").map((e) => e.id));
  if (draft.evidenceIds.some((id) => !valid.has(id))) issues.push("Learning evidence outside current classroom");
  if (new Set(draft.evidenceIds).size !== draft.evidenceIds.length) issues.push("Duplicate learning evidence");
  if ("seatmate" in draft) {
    const student = classroom.students.find((s) => s.id === draft.seatmate.studentId);
    if (!student) issues.push("Seatmate outside current classroom");
    else if (!classroom.evidence.some((e) => e.kind === "source_excerpt" && e.sourceContentId === student.sourceContentId && draft.evidenceIds.includes(e.id))) issues.push("Seatmate requires their source evidence");
  } else if (draft.classNote.afterHighlights.some((highlight) => !draft.classNote.after.includes(highlight))) issues.push("Highlight must occur in after note");
  return issues;
}
