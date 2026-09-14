"use client";

import { useState, type ReactNode } from "react";
import type { Classroom } from "@/domain/schemas";
import { LearningEvidence } from "./LearningEvidence";
import { DownloadClassNote } from "./DownloadClassNote";

import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import { noteSectionStatus, type SessionPhase, type LearningRequestState } from "./session-machine";
import styles from "./classroom.module.css";

type ClassroomNotePanelProps = {
  scenario: DemoScenarioV3;
  phase: SessionPhase;
  answerText: string;
  originalNote: string;
  classroom: Classroom;
  learning: LearningRequestState;
  onOpenMySeat: () => void;
  onBack: () => void;
};

/** 把 after 文本中相对 before 的新增判断高亮为 <mark> */
function renderWithHighlights(text: string, highlights: string[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    let earliestIndex = -1;
    let earliestHit = "";
    for (const hit of highlights) {
      const index = rest.indexOf(hit);
      if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
        earliestIndex = index;
        earliestHit = hit;
      }
    }
    if (earliestIndex === -1) {
      nodes.push(rest);
      break;
    }
    if (earliestIndex > 0) nodes.push(rest.slice(0, earliestIndex));
    nodes.push(<mark key={key++}>{earliestHit}</mark>);
    rest = rest.slice(earliestIndex + earliestHit.length);
  }

  return nodes;
}

/**
 * 课堂笔记：记录「我的认知发生了什么变化」。
 * 不是全班 AI Summary——只收录用户真正经历过的内容，四段随相位渐进生长。
 */
export function ClassroomNotePanel({
  scenario,
  phase,
  answerText,
  originalNote,
  classroom,
  learning,
  onOpenMySeat,
  onBack,
}: ClassroomNotePanelProps) {
  const note = scenario.classNote;
  const real = classroom.schemaVersion === "1.0.0-rc.2";
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const sections = noteSectionStatus(phase);
  const canOpenMySeat = phase === "responded";

  const progressItems = [
    { key: "before", label: "上课前，我认为", state: sections.before },
    { key: "heard", label: "参考材料里的说法", state: sections.heard },
    { key: "changed", label: "我对追问的回应", state: sections.changed },
    { key: "after", label: "AI 整理后的表达", state: sections.after },
  ];

  return (
    <aside className={`${styles.contextRail} ${styles.noteRail}`} aria-labelledby="classnote-title">
      <header className={styles.railHeader}>
        <p className={styles.sheetEyebrow}>课堂笔记 · AI 整理草稿，供你核对</p>
        <h2 id="classnote-title">记录我的观点与回应</h2>
      </header>

      <div className={styles.railBody} data-lesson-content>
        {learning.status === "completed" ? <DownloadClassNote classroom={classroom} scenario={scenario} originalNote={originalNote} answerText={answerText} /> : null}
        {learning.status === "completed" ? <p className={styles.sampleResultDisclosure}>{learning.meta.mode === "live" ? "本阶段由 AI 根据你的实际回应整理。" : "本阶段为与示例观点和回应精确匹配的预计算结果。"} 请核对，不准确处应以你的原意为准。</p> : null}
        <ol className={styles.noteProgress} aria-label="课堂进度">
          {progressItems.map((item, index) => (
            <li
              key={item.key}
              className={item.state === "ready" ? styles.noteProgressDone : styles.noteProgressLocked}
            >
              <span aria-hidden="true">{item.state === "ready" ? "✓" : `0${index + 1}`}</span>
              {item.label}
            </li>
          ))}
        </ol>

        <section className={styles.noteSection}>
          <h3><span>①</span>上课前，我认为</h3>
          {sections.before === "ready" ? (
            <p className={styles.noteBefore}>{real ? originalNote : note.before}</p>
          ) : (
            <p className={styles.noteLocked}>等你表达自己的观点后记录</p>
          )}
        </section>

        <section className={styles.noteSection}>
          <h3><span>②</span>参考材料里的说法</h3>
          {sections.heard === "ready" ? (
            <ul className={styles.noteHeardList}>
              {note.heard.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.noteLocked}>听过课代表圆桌后记录</p>
          )}
        </section>

        <section className={styles.noteSection}>
          <h3><span>③</span>我对追问的回应</h3>
          {sections.changed === "ready" ? (
            <>
              <p className={styles.noteChanged}>{note.changed}</p>
              {!real && answerText.trim() ? (
                <div className={styles.noteMyAnswer}>
                  <span>我对同桌追问的回应</span>
                  <p>{answerText}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.noteLocked}>和同桌发生一次碰撞后记录</p>
          )}
        </section>

        <section className={styles.noteSection}>
          <h3><span>④</span>AI 整理后的表达</h3>
          {sections.after === "ready" ? (
            <p className={styles.noteAfter}>
              {renderWithHighlights(note.after, note.afterHighlights)}
            </p>
          ) : (
            <p className={styles.noteLocked}>回应同桌之后生成</p>
          )}
        </section>

        {sections.after === "ready" ? (
          <section className={styles.noteDiff} aria-label="原始表达与整理草稿对照">
            <span className={styles.noteDiffTitle}>原始表达与整理草稿</span>
            <div className={styles.noteDiffGrid}>
              <div className={styles.noteDiffBefore}>
                <small>上课前</small>
                <p>{note.before}</p>
              </div>
              <i aria-hidden="true">→</i>
              <div className={styles.noteDiffAfter}>
                <small>AI 整理草稿</small>
                <p>{renderWithHighlights(note.after, note.afterHighlights)}</p>
              </div>
            </div>
            <p className={styles.noteDiffHint}>高亮仅标出回应中新增且在草稿中保留的原文字句，不代表学习成效。</p>
          </section>
        ) : null}
        {learning.status === "completed" ? <LearningEvidence classroom={classroom} evidenceIds={learning.result.evidenceIds} /> : null}
        <button type="button" className={styles.secondaryAction} onClick={async () => {
          try {
            await navigator.clipboard.writeText(["知遇·一席 — 观点与回应记录", classroom.question.title, "", "【原始观点】", originalNote, "", "【系统追问】", scenario.seatmate.challenge, "", "【我的回应】", answerText, "", "【AI 整理草稿，需核对】", note.after, "", "【原问题】", classroom.question.url].join("\n"));
            setCopyStatus("copied");
          } catch { setCopyStatus("error"); }
        }}>{copyStatus === "copied" ? "已复制笔记" : "复制课堂笔记"}</button>
        {copyStatus === "error" ? <p role="alert">复制未成功，请手动选择笔记内容复制。</p> : null}
      </div>

      <footer className={styles.railFooter}>
        {canOpenMySeat ? (
          <button type="button" className={styles.primaryAction} onClick={onOpenMySeat}>
            提炼成《我的一席》
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" className={styles.secondaryAction} onClick={onBack}>
            返回课堂
          </button>
        )}
      </footer>
    </aside>
  );
}
