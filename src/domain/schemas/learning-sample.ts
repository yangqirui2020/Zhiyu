import { z } from "zod";
import { learningQuestionDraftSchema, learningCompletionDraftSchema } from "./learning.ts";

export const learningSampleSchema = z.object({
  questionId: z.string().min(1), classroomRevision: z.string().min(1),
  noteText: z.string().min(50).max(8000), noteHash: z.string().regex(/^[a-f0-9]{64}$/),
  answerText: z.string().min(10).max(4000), replyHash: z.string().regex(/^[a-f0-9]{64}$/),
  question: learningQuestionDraftSchema, completion: learningCompletionDraftSchema,
  generatedAt: z.iso.datetime(), modelId: z.string().min(1), promptVersion: z.literal("learning-v1"),
});
