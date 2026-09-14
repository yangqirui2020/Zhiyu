import { z } from "zod";

export const classroomCatalogEntrySchema = z.object({
  number: z.string().regex(/^10[1-3]$/),
  questionId: z.string().regex(/^q_[a-z0-9_-]+$/),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  mode: z.enum(["snapshot", "mock"]),
  nextQuestionId: z.string().regex(/^q_[a-z0-9_-]+$/),
  connection: z.string().min(1),
  sampleId: z.string().regex(/^sample_[a-z0-9_-]+$/),
});
export const classroomCatalogSchema = z.array(classroomCatalogEntrySchema).length(3).superRefine((rooms, ctx) => {
  if (new Set(rooms.map(r => r.questionId)).size !== rooms.length || new Set(rooms.map(r => r.number)).size !== rooms.length) ctx.addIssue({ code: "custom", message: "Duplicate classroom identity" });
  for (const room of rooms) if (!rooms.some(r => r.questionId === room.nextQuestionId && r.questionId !== room.questionId)) ctx.addIssue({ code: "custom", message: "Next classroom must exist and differ" });
});
export type ClassroomCatalogEntry = z.infer<typeof classroomCatalogEntrySchema>;
