import type { ContributionCard } from "../../domain/schemas/contribution.ts";
import { contributionIdentity, contributionKinds } from "../../domain/schemas/contribution.ts";

export const publicClassroomUrl = (questionId: string) => `https://zhiyu-yixi.vercel.app/classroom/${encodeURIComponent(questionId)}#experience`;
export function invitationText(questionId: string, title: string, invitation: string): string {
  return ["知遇·一席，想听到你的一次经历。", title, "", invitation, "不用写长文章，也不需要一个全新的观点。来讲一次尝试，留下一张自己的贡献卡。", "", publicClassroomUrl(questionId)].join("\n");
}
export function contributionMarkdown(card: ContributionCard, title: string): string {
  return ["# 知遇·一席｜我的贡献卡", title, "", `身份：${contributionIdentity(card.input)}`, `贡献方式：${contributionKinds[card.input.kind]}`, "仅在本次课堂展示；此文件由你主动下载，不代表已公开发布。", "",
    "## 发生了什么（原始输入）", card.input.event, "## 采取了什么办法（原始输入）", card.input.action, "## 结果与仍不确定的地方（原始输入）", card.input.outcome,
    ...(card.challenge ? ["## 系统追问", card.challenge, "## 我的实际回应", card.answer || "未填写"] : []),
    "## 我希望课堂多考虑的一点（本人确认）", card.wording.summary, "## 这段材料的适用边界（本人确认）", card.wording.boundary,
    ...(card.draftWording ? ["## AI 最初整理草稿（未经独立核验）", card.draftWording.summary, card.draftWording.boundary] : ["整理方式：本人整理；没有把人工填写称为 AI 生成。"]),
    "", `资料版本：${card.classroomRevision}`, `参考证据 ID：${card.evidenceIds.join("、") || "人工整理，未引用课堂来源"}`, `本人确认时间：${card.confirmedAt}`, "", publicClassroomUrl(card.questionId),
  ].join("\n\n");
}
