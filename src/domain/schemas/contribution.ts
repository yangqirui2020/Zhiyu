import { z } from "zod";

export const contributionKindSchema = z.enum(["experience", "condition", "question", "counterexample"]);
export const experienceInputSchema = z.object({
  kind: contributionKindSchema,
  origin: z.enum(["self_report", "example"]),
  event: z.string().max(800).refine(value => value.trim().length >= 12),
  action: z.string().max(800).refine(value => value.trim().length >= 10),
  outcome: z.string().max(800).refine(value => value.trim().length >= 5),
});
export const contributionWordingSchema = z.object({
  summary: z.string().trim().min(5).max(160),
  boundary: z.string().trim().min(6).max(300),
});
export const contributionCardSchema = z.object({
  id: z.string().regex(/^contribution_[a-z0-9_-]+$/),
  questionId: z.string().regex(/^q_[a-z0-9_-]+$/),
  classroomRevision: z.string().min(1),
  input: experienceInputSchema,
  answer: z.string().max(4000),
  challenge: z.string().max(300),
  wording: contributionWordingSchema,
  draftWording: contributionWordingSchema.nullable(),
  preparation: z.enum(["ai", "manual"]),
  evidenceIds: z.array(z.string().regex(/^ev_[a-z0-9_-]+$/)).max(12),
  confirmedAt: z.iso.datetime(),
});
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type ContributionWording = z.infer<typeof contributionWordingSchema>;
export type ContributionCard = z.infer<typeof contributionCardSchema>;
export type ContributionKind = z.infer<typeof contributionKindSchema>;

export const contributionKinds: Record<ContributionKind, string> = {
  experience: "补充亲历", condition: "补全条件", question: "提出疑问", counterexample: "提供反例",
};
export const contributionIdentity = (input: ExperienceInput) => input.origin === "example" ? "示例经历 · 虚构" : "用户自述 · 未独立核验";
export function experienceNote(input: ExperienceInput): string {
  const value = experienceInputSchema.parse(input);
  return ["【经验入席】", contributionIdentity(value), `贡献方式：${contributionKinds[value.kind]}`, "【发生了什么】", value.event, "【采取了什么办法】", value.action, "【结果与仍不确定的地方】", value.outcome].join("\n");
}
