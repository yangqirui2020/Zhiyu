"use client";
import { useState } from "react";
import type { Classroom } from "@/domain/schemas";
import type { ClassroomNarrative } from "@/domain/schemas/narrative";
import styles from "./classroom.module.css";

export function DownloadClassNote({ classroom, scenario, originalNote, answerText }: { classroom: Classroom; scenario: Pick<ClassroomNarrative, "seatmate" | "classNote" | "mySeat" | "zhihuDraft"> & { evidenceIds?: string[] }; originalNote: string; answerText: string }) {
  const [downloaded, setDownloaded] = useState(false);
  return <button className={styles.secondaryAction} type="button" onClick={() => {
    const synthetic = classroom.provenance.mode === "mock";
    const content = [`# ${classroom.question.title}`, "", synthetic ? "来源：合成演示，非真实知乎回答。" : `来源：真实知乎回答摘要快照，采集于 ${classroom.provenance.capturedAt}。`, `范围：${classroom.sources.length} 条材料、${classroom.clusters.length} 个观点组。`, "AI 整理草稿，请核对；笔记只在你点击下载后保存到本机。", "", "## 我的初始观点", originalNote, "", "## 同桌追问（系统生成）", scenario.seatmate.challenge, "", "## 我的回应", answerText, "", "## 整理后的表达", scenario.classNote.after, "", "## 三条提纲", ...scenario.zhihuDraft.outline.map(item => `- ${item.label}：${item.text}`), "", "## 本次参考材料", ...(scenario.evidenceIds ?? []).flatMap(id => { const e = classroom.evidence.find(item => item.id === id); if (!e || e.kind !== "source_excerpt") return []; const source = classroom.sources.find(s => s.id === e.sourceContentId); return [`- ${id}：${e.text}${!synthetic && source ? `\n  来源：${source.url}` : "（合成材料）"}`]; }), "", synthetic ? `相关问题搜索：${classroom.question.url}` : `知乎原问题：${classroom.question.url}`].join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `知遇一席-${classroom.question.id}.md`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }}>{downloaded ? "再次下载课堂笔记" : "下载课堂笔记"}<span aria-hidden="true"> ↓</span></button>;
}
