"use client";

import type { ReactNode } from "react";

import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import { noteSectionStatus, type SessionPhase } from "./session-machine";
import styles from "./classroom.module.css";

type ClassroomNotePanelProps = {
  scenario: DemoScenarioV3;
  phase: SessionPhase;
  answerText: string;
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
  onOpenMySeat,
  onBack,
}: ClassroomNotePanelProps) {
  const note = scenario.classNote;
  const sections = noteSectionStatus(phase);
  const canOpenMySeat = phase === "responded";

  const progressItems = [
    { key: "before", label: "上课前，我认为", state: sections.before },
    { key: "heard", label: "这节课，我听到了", state: sections.heard },
    { key: "changed", label: "最让我重新思考的是", state: sections.changed },
    { key: "after", label: "下课时，我现在认为", state: sections.after },
  ];

  return (
    <aside className={`${styles.contextRail} ${styles.noteRail}`} aria-labelledby="classnote-title">
      <header className={styles.railHeader}>
        <p className={styles.sheetEyebrow}>课堂笔记 · 不是 AI Summary</p>
        <h2 id="classnote-title">这节课，我的认知发生了什么变化</h2>
      </header>

      <div className={styles.railBody}>
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
            <p className={styles.noteBefore}>{note.before}</p>
          ) : (
            <p className={styles.noteLocked}>等你表达自己的观点后记录</p>
          )}
        </section>

        <section className={styles.noteSection}>
          <h3><span>②</span>这节课，我听到了</h3>
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
          <h3><span>③</span>最让我重新思考的是</h3>
          {sections.changed === "ready" ? (
            <>
              <p className={styles.noteChanged}>{note.changed}</p>
              {answerText.trim() ? (
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
          <h3><span>④</span>下课时，我现在认为</h3>
          {sections.after === "ready" ? (
            <p className={styles.noteAfter}>
              {renderWithHighlights(note.after, note.afterHighlights)}
            </p>
          ) : (
            <p className={styles.noteLocked}>回应同桌之后生成</p>
          )}
        </section>

        {sections.after === "ready" ? (
          <section className={styles.noteDiff} aria-label="认知变化对照">
            <span className={styles.noteDiffTitle}>这节课到底改变了什么</span>
            <div className={styles.noteDiffGrid}>
              <div className={styles.noteDiffBefore}>
                <small>上课前</small>
                <p>{note.before}</p>
              </div>
              <i aria-hidden="true">→</i>
              <div className={styles.noteDiffAfter}>
                <small>下课时</small>
                <p>{renderWithHighlights(note.after, note.afterHighlights)}</p>
              </div>
            </div>
            <p className={styles.noteDiffHint}>高亮部分 = 这堂课为你新增的判断条件</p>
          </section>
        ) : null}
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
