"use client";

import type { Classroom } from "@/domain/schemas";
import type { DemoSeatmateScenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v2";

import { getStudentDetails, studentSeatNumber } from "./classroom-selectors";
import {
  PixelStudentPortrait,
  PIXEL_CLUSTER_COLORS,
} from "./PixelStudentPortrait";
import styles from "./classroom.module.css";

export type ContextPanel =
  | { kind: "overview" }
  | { kind: "note" }
  | { kind: "candidate" }
  | { kind: "seatmate" }
  | { kind: "conversation" }
  | { kind: "campus"; roomNumber: string };

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
  onReturnToClassroom: () => void;
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
  onReturnToClassroom,
  onReset,
}: ClassroomContextRailProps) {
  const seatmate = getStudentDetails(classroom, scenario.seatmate.studentId);
  const sampleMatches = noteText.trim() === scenario.noteText;
  const seatmateClusterIndex = seatmate?.cluster
    ? classroom.clusters.findIndex((cluster) => cluster.id === seatmate.cluster?.id)
    : -1;
  const seatmateColor = PIXEL_CLUSTER_COLORS[
    Math.max(0, seatmateClusterIndex) % PIXEL_CLUSTER_COLORS.length
  ];

  if (panel.kind === "campus") {
    const room = scenario.campus.rooms.find((item) => item.number === panel.roomNumber);
    return (
      <aside className={styles.contextRail} aria-labelledby="campus-panel-title">
        <RailHeader
          id="campus-panel-title"
          eyebrow={`${scenario.campus.building} · ${scenario.campus.floor}`}
          title={`走廊上的 Classroom ${room?.number ?? panel.roomNumber}`}
        />
        <div className={styles.railBody}>
          <section className={styles.roomPreviewCard}>
            <span className={styles.roomPreviewNumber}>{room?.number ?? panel.roomNumber}</span>
            <div>
              <p>{room?.note ?? "走廊预告"}</p>
              <h3>{room?.title ?? "另一间认知教室"}</h3>
            </div>
          </section>
          <p className={styles.railLead}>
            这一轮只开放 Classroom 01。其他门牌用于建立认知校园的入口感，不会伪装成已经加载的数据或可用课堂。
          </p>
          <div className={styles.floorDirectory} aria-label="二层教室目录">
            {scenario.campus.rooms.map((item) => (
              <div key={item.number} className={item.status === "current" ? styles.floorRoomCurrent : styles.floorRoom}>
                <strong>{item.number}</strong>
                <span>{item.title}</span>
                <small>{item.note}</small>
              </div>
            ))}
          </div>
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.primaryAction} onClick={onReturnToClassroom}>
            返回 Classroom 01
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </aside>
    );
  }

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
        <RailHeader id="candidate-title" eyebrow="Candidate Seat · 空位已亮起" title={scenario.candidate.title} />
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
          {seatmate ? (
            <button type="button" className={styles.seatmateTeaser} onClick={onOpenSeatmate}>
              <PixelStudentPortrait
                seed={seatmate.student.displaySeed}
                color={seatmateColor}
                role="seatmate"
              />
              <span>
                <strong>看来你有同桌了</strong>
                <small>学生 {studentSeatNumber(classroom, seatmate.student.id)} 就坐在亮起空位旁边</small>
              </span>
              <i aria-hidden="true">→</i>
            </button>
          ) : null}
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
    const seatNumber = studentSeatNumber(classroom, seatmate.student.id);
    return (
      <aside className={styles.contextRail} aria-labelledby="seatmate-title">
        <RailHeader id="seatmate-title" eyebrow="你的同桌 · 邻座关系已成立" title={`坐在你旁边的学生 ${seatNumber}`} />
        <div className={styles.railBody}>
          <section className={styles.seatmateIdentityCard}>
            <PixelStudentPortrait
              seed={seatmate.student.displaySeed}
              color={seatmateColor}
              role="seatmate"
              label={`同桌学生 ${seatNumber}`}
            />
            <div>
              <div className={styles.identityMeta}>
                <span>学生 {seatNumber}</span>
                <span>{seatmate.cluster?.label ?? "独立观点"}</span>
              </div>
              <h3>{seatmate.source.author.displayName}</h3>
              <p>{seatmate.argument.conclusion}</p>
            </div>
          </section>

          <section className={styles.seatmateReason}>
            <span>为什么他是你的同桌</span>
            <p>{scenario.seatmate.rationale}</p>
          </section>

          {panel.kind === "seatmate" ? (
            <div className={styles.relationshipGrid}>
              <section>
                <span aria-hidden="true">＝</span>
                <div><strong>共同点</strong><p>{scenario.seatmate.commonGround}</p></div>
              </section>
              <section>
                <span aria-hidden="true">≠</span>
                <div><strong>差异点</strong><p>{scenario.seatmate.difference}</p></div>
              </section>
              <section>
                <span aria-hidden="true">?</span>
                <div><strong>值得讨论</strong><p>{scenario.seatmate.prompt}</p></div>
              </section>
            </div>
          ) : null}

          <section className={styles.interactionCard}>
            <div className={styles.interactionHeading}>
              <span>一轮互动</span>
              <small>预设对话 · 非实时 AI 回复</small>
            </div>
            <p className={styles.presetQuestion}>{scenario.seatmate.prompt}</p>
            {panel.kind === "conversation" ? (
              <div className={styles.seatmateReply} aria-live="polite">
                <div>
                  <PixelStudentPortrait seed={seatmate.student.displaySeed} color={seatmateColor} role="seatmate" />
                  <strong>同桌回答</strong>
                </div>
                <p>{scenario.seatmate.response}</p>
              </div>
            ) : (
              <button type="button" className={styles.presetAskButton} onClick={onAskSeatmate}>
                用这个问题问问同桌 <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.secondaryAction} onClick={onBackToCandidate}>
            回看我的一席
          </button>
          <button type="button" className={styles.textAction} onClick={onReset}>结束这次演示</button>
        </footer>
      </aside>
    );
  }

  return (
    <aside className={styles.contextRail} aria-labelledby="overview-panel-title">
      <RailHeader id="overview-panel-title" eyebrow="Classroom 01 · 正在上课" title="先认识这间像素教室" />
      <div className={styles.railBody}>
        <p className={styles.railLead}>
          每位像素学生代表一条演示来源。学生围桌而坐；位置越近，论证越相似。
        </p>
        <div className={styles.overviewStats}>
          <span><strong>{classroom.students.length}</strong> 位学生</span>
          <span><strong>{classroom.clusters.length}</strong> 个学习组</span>
        </div>
        <div className={styles.clusterIndex} aria-label="观点组">
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
          <p>点一位学生，看他的桌组、观点和证据。</p>
        </div>
        <div className={styles.nextStep}>
          <span>02</span>
          <p>带入示例笔记，让空位亮起并认识邻桌。</p>
        </div>
        <p className={styles.campusHint}>门外还有 Classroom 02–04；顶部走廊门牌可查看预告。</p>
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
