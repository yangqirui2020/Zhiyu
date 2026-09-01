"use client";

import type { Classroom } from "@/domain/schemas";
import type { DemoSeatmateScenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v2";

import { getStudentDetails, studentSeatNumber } from "./classroom-selectors";
import styles from "./classroom.module.css";

export type ContextPanel =
  | { kind: "overview" }
  | { kind: "note" }
  | { kind: "candidate" }
  | { kind: "seatmate" }
  | { kind: "conversation" };

type ClassroomContextRailProps = {
  classroom: Classroom;
  scenario: DemoSeatmateScenario;
  panel: ContextPanel;
  noteText: string;
  onOpenNote: () => void;
  onEditNote: (value: string) => void;
  onUseSample: () => void;
  onAnalyze: () => void;
  onOpenSeatmate: () => void;
  onAskSeatmate: () => void;
  onBackToCandidate: () => void;
  onReset: () => void;
};

export function ClassroomContextRail({
  classroom,
  scenario,
  panel,
  noteText,
  onOpenNote,
  onEditNote,
  onUseSample,
  onAnalyze,
  onOpenSeatmate,
  onAskSeatmate,
  onBackToCandidate,
  onReset,
}: ClassroomContextRailProps) {
  const seatmate = getStudentDetails(classroom, scenario.seatmate.studentId);
  const sampleMatches = noteText.trim() === scenario.noteText;

  if (panel.kind === "note") {
    return (
      <aside className={styles.contextRail} aria-labelledby="note-panel-title">
        <RailHeader id="note-panel-title" eyebrow="把知识带进来" title="先放下一段学习笔记" />
        <div className={styles.railBody}>
          <p className={styles.railLead}>
            Demo V2 只为一条示例笔记准备了稳定结果，不会把任意输入套进预计算座位。
          </p>
          <label className={styles.noteField}>
            <span>你的笔记</span>
            <textarea
              value={noteText}
              onChange={(event) => onEditNote(event.target.value)}
              placeholder="使用下方示例，体验 Candidate Seat → 同桌"
            />
          </label>
          <button type="button" className={styles.secondaryAction} onClick={onUseSample}>
            使用示例笔记
          </button>
          {!sampleMatches && noteText ? (
            <p className={styles.inlineNotice} role="status">
              当前 Mock 只支持这条示例笔记；恢复示例后可继续演示。
            </p>
          ) : null}
          <div className={styles.privacyNote}>
            <strong>演示边界</strong>
            <span>本页不发送第三方模型，也不持久化输入；结果来自本地确定性 Mock 场景。</span>
          </div>
        </div>
        <footer className={styles.railFooter}>
          <button
            type="button"
            className={styles.primaryAction}
            disabled={!sampleMatches}
            onClick={onAnalyze}
          >
            分析示例笔记
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </aside>
    );
  }

  if (panel.kind === "candidate") {
    return (
      <aside className={`${styles.contextRail} ${styles.candidateRail}`} aria-labelledby="candidate-title">
        <RailHeader id="candidate-title" eyebrow="Candidate Seat" title={scenario.candidate.title} />
        <div className={styles.railBody}>
          <p className={styles.candidateClaim}>{scenario.claimTitle}</p>
          <div className={styles.evidenceChecklist}>
            {scenario.candidate.evidence.map((item, index) => (
              <div key={item.label}>
                <span>{index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.coverageDisclosure}>{scenario.candidate.coverageDisclosure}</p>
          <div className={styles.seatmateTeaser}>
            <span className={styles.seatmateGlyph} aria-hidden="true">同</span>
            <div>
              <strong>看来你有同桌了</strong>
              <p>旁边这位学生和你的视角既相近，又有一个值得追问的差异。</p>
            </div>
          </div>
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.primaryAction} onClick={onOpenSeatmate}>
            看看我的同桌
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.textAction} onClick={onReset}>重新放入笔记</button>
        </footer>
      </aside>
    );
  }

  if ((panel.kind === "seatmate" || panel.kind === "conversation") && seatmate) {
    return (
      <aside className={styles.contextRail} aria-labelledby="seatmate-title">
        <RailHeader
          id="seatmate-title"
          eyebrow={`你的同桌 · 学生 ${studentSeatNumber(classroom, seatmate.student.id)}`}
          title={seatmate.argument.conclusion}
        />
        <div className={styles.railBody}>
          <section className={styles.seatmateReason}>
            <span>为什么值得聊</span>
            <p>{scenario.seatmate.rationale}</p>
          </section>
          <dl className={styles.compareList}>
            <div>
              <dt>你们的共同点</dt>
              <dd>{scenario.seatmate.commonGround}</dd>
            </div>
            <div>
              <dt>值得追问的差异</dt>
              <dd>{scenario.seatmate.difference}</dd>
            </div>
          </dl>
          {panel.kind === "conversation" ? (
            <div className={styles.conversation} aria-live="polite">
              <p className={styles.userBubble}>{scenario.seatmate.prompt}</p>
              <div className={styles.seatmateBubble}>
                <span>同桌</span>
                <p>{scenario.seatmate.response}</p>
              </div>
              <p className={styles.mockConversationNote}>预设对话 · 非实时 AI 回复</p>
            </div>
          ) : null}
        </div>
        <footer className={styles.railFooter}>
          {panel.kind === "seatmate" ? (
            <button type="button" className={styles.primaryAction} onClick={onAskSeatmate}>
              问问同桌
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button type="button" className={styles.secondaryAction} onClick={onBackToCandidate}>
              回看我的一席
            </button>
          )}
          <button type="button" className={styles.textAction} onClick={onReset}>结束这次演示</button>
        </footer>
      </aside>
    );
  }

  return (
    <aside className={styles.contextRail} aria-labelledby="overview-panel-title">
      <RailHeader id="overview-panel-title" eyebrow="现在可以做什么" title="先认识这间教室" />
      <div className={styles.railBody}>
        <p className={styles.railLead}>
          每位学生代表一条演示来源。位置越近，论证越相似；颜色只帮助辨认分组。
        </p>
        <div className={styles.overviewStats}>
          <span><strong>{classroom.students.length}</strong> 位学生</span>
          <span><strong>{classroom.clusters.length}</strong> 个观点簇</span>
        </div>
        <div className={styles.clusterIndex} aria-label="观点簇">
          {classroom.clusters.map((cluster, index) => (
            <div key={cluster.id}>
              <i className={styles[`clusterColor${index + 1}`]} />
              <span>{cluster.label}</span>
              <small>{cluster.studentIds.length} 位</small>
            </div>
          ))}
        </div>
        <div className={styles.nextStep}>
          <span>01</span>
          <p>点一位学生，看看他为什么坐在这里。</p>
        </div>
        <div className={styles.nextStep}>
          <span>02</span>
          <p>再把示例笔记放进教室，看看你的空位和同桌。</p>
        </div>
      </div>
      <footer className={styles.railFooter}>
        <button type="button" className={styles.primaryAction} onClick={onOpenNote}>
          把我的笔记带进来
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </aside>
  );
}

function RailHeader({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <header className={styles.railHeader}>
      <p className={styles.sheetEyebrow}>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}
