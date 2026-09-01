"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import type { Classroom } from "@/domain/schemas";
import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import { ForceGraphAdapter } from "./ForceGraphAdapter";
import { ClassroomContextRail } from "./ClassroomContextRail";
import { ClassroomNotePanel } from "./ClassroomNotePanel";
import { RoundtableOverlay } from "./RoundtableOverlay";
import { StudentDetailSheet } from "./StudentDetailSheet";
import {
  candidateVisible as phaseHasCandidate,
  initialSessionState,
  seatClaimed as phaseIsSeated,
  sessionReducer,
  type SessionPhase,
} from "./session-machine";
import styles from "./classroom.module.css";

const ROUNDTABLE_LINE_MS = 2600;
const ROUNDTABLE_WRAP_MS = 900;

const STORY_STEPS: Array<{ phase: SessionPhase; label: string }> = [
  { phase: "candidate", label: "01 空位亮起" },
  { phase: "seatmate", label: "02 认识同桌" },
  { phase: "challenge", label: "03 一次追问" },
  { phase: "mySeat", label: "04 留下一席" },
];

const phaseRank: SessionPhase[] = [
  "exploring",
  "roundtable",
  "reflection",
  "candidate",
  "seatmate",
  "challenge",
  "responded",
  "mySeat",
  "seated",
];

function atLeast(phase: SessionPhase, target: SessionPhase): boolean {
  return phaseRank.indexOf(phase) >= phaseRank.indexOf(target);
}

type ClassroomExperienceProps = {
  classroom: Classroom;
  demoScenario: DemoScenarioV3;
};

export function ClassroomExperience({ classroom, demoScenario }: ClassroomExperienceProps) {
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState);
  const studentButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreStudentIdRef = useRef<string | null>(null);

  const { phase } = session;
  const selectedStudentId =
    session.panel.kind === "student" ? session.panel.studentId : null;
  const hasCandidate = phaseHasCandidate(phase);
  const isSeated = phaseIsSeated(phase);
  const headcount = classroom.students.length + (isSeated ? 1 : 0);

  // ── 课代表圆桌计时：一轮结构化、可跳过 ─────────────────────
  useEffect(() => {
    if (phase !== "roundtable") return;
    const total = demoScenario.roundtable.speakers.length;
    if (session.roundtableStep >= total) {
      const timer = window.setTimeout(
        () => dispatch({ type: "roundtable_finish" }),
        ROUNDTABLE_WRAP_MS,
      );
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(
      () => dispatch({ type: "roundtable_advance" }),
      ROUNDTABLE_LINE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase, session.roundtableStep, demoScenario.roundtable.speakers.length]);

  const focusedStudentId =
    selectedStudentId ?? (hasCandidate ? demoScenario.seatmate.studentId : null);
  const focusedDetails = focusedStudentId
    ? getStudentDetails(classroom, focusedStudentId)
    : null;
  const focusedGroupLabel = focusedDetails?.cluster?.label;

  const studentsByCluster = useMemo(
    () =>
      classroom.clusters.map((cluster) => ({
        cluster,
        students: cluster.studentIds.flatMap((studentId) => {
          const details = getStudentDetails(classroom, studentId);
          return details ? [details] : [];
        }),
      })),
    [classroom],
  );

  const roundtableSpeakers = useMemo(
    () => demoScenario.roundtable.speakers.map((speaker) => speaker.studentId),
    [demoScenario],
  );
  const currentSpeakerId =
    phase === "roundtable" &&
    session.roundtableStep < demoScenario.roundtable.speakers.length
      ? demoScenario.roundtable.speakers[session.roundtableStep].studentId
      : null;

  const selectStudent = useCallback(
    (studentId: string, restoreFocus = false) => {
      restoreStudentIdRef.current = restoreFocus ? studentId : null;
      if (phase === "candidate" && studentId === demoScenario.seatmate.studentId) {
        dispatch({ type: "open_seatmate" });
        return;
      }
      dispatch({ type: "select_student", studentId });
    },
    [demoScenario.seatmate.studentId, phase],
  );

  const closeSheet = useCallback(() => {
    const studentId = restoreStudentIdRef.current;
    dispatch({ type: "close_panel" });
    window.requestAnimationFrame(() => {
      if (studentId) studentButtonRefs.current.get(studentId)?.focus();
    });
  }, []);

  const showNotePanel =
    session.panel.kind === "note" ||
    (session.panel.kind === "default" && phase === "responded");

  const activeStoryStep = isSeated
    ? STORY_STEPS.length
    : STORY_STEPS.findIndex((step) => !atLeast(phase, step.phase));

  return (
    <main className={styles.experienceShell}>
      <header className={styles.classroomHeader}>
        <div className={styles.brandBlock}>
          <span className={styles.brandMark}>知遇 · 一席</span>
          <span className={styles.pixelEdition}>PIXEL CLASSROOM</span>
        </div>

        <div className={styles.campusIdentity}>
          <span>{demoScenario.campus.building}</span>
          <strong>{demoScenario.campus.floor} · 走廊</strong>
        </div>

        <nav className={styles.roomStrip} aria-label="认知校园教室入口">
          {demoScenario.campus.rooms.map((room) => (
            <button
              key={room.number}
              type="button"
              className={room.status === "current" ? styles.roomTabCurrent : styles.roomTab}
              aria-current={room.status === "current" ? "page" : undefined}
              onClick={() =>
                dispatch({
                  type: "open_campus_room",
                  roomNumber: room.number,
                  isCurrent: room.status === "current",
                })
              }
              title={`${room.title} · ${room.note}`}
            >
              <b>{room.number}</b>
              <span>{room.status === "current" ? "本班" : room.note}</span>
            </button>
          ))}
        </nav>

        <div className={styles.headerMeta}>
          <span className={styles.modeBadge}>{demoScenario.disclosure}</span>
          <span>{headcount} 人 · {classroom.clusters.length} 组</span>
        </div>
      </header>

      <div className={styles.classroomWorkspace}>
        <section className={styles.stage} aria-labelledby="stage-heading">
          <div className={styles.stageCanvas}>
            <div className={styles.sceneTopWall} aria-hidden="true" />
            <span className={styles.roomPlaque} aria-hidden="true">教室 101</span>

            <section className={styles.blackboardPanel} aria-label="课堂黑板信息中枢">
              <div className={styles.blackboardTopline}>
                <span>CLASSROOM 101 · 本期问题</span>
                <span>{headcount} 位学生 / {classroom.clusters.length} 个学习小组</span>
              </div>
              <h1 id="stage-heading">{classroom.question.title}</h1>
              {phase === "roundtable" ? (
                <p>课代表圆桌进行中——各组正在互相听对方说话</p>
              ) : (
                <p>
                  {focusedGroupLabel
                    ? `当前聚焦：${focusedGroupLabel} · 相邻座位表示论证路径更接近`
                    : "课堂规则：座位越近，论证越相似；小组颜色不表示正误或支持率"}
                </p>
              )}
              {atLeast(phase, "reflection") ? (
                <div className={styles.blackboardOutcome}>
                  <div>
                    <span>全班共识</span>
                    <p>{demoScenario.blackboard.consensus}</p>
                  </div>
                  <div>
                    <span>核心争议</span>
                    <p>{demoScenario.blackboard.controversy}</p>
                  </div>
                  <div>
                    <span>尚未解决的问题</span>
                    <p>{demoScenario.blackboard.openQuestion}</p>
                  </div>
                </div>
              ) : null}
            </section>

            <ForceGraphAdapter
              classroom={classroom}
              selectedStudentId={selectedStudentId}
              candidateVisible={hasCandidate}
              candidatePosition={demoScenario.candidate}
              seatmateStudentId={demoScenario.seatmate.studentId}
              seatClaimed={isSeated}
              roundtable={{
                active: phase === "roundtable",
                speakerIds: roundtableSpeakers,
                currentSpeakerId,
              }}
              onSelectStudent={(studentId) => selectStudent(studentId)}
            />

            {phase === "roundtable" ? (
              <RoundtableOverlay
                classroom={classroom}
                scenario={demoScenario}
                currentStep={session.roundtableStep}
                onSkip={() => dispatch({ type: "roundtable_finish" })}
              />
            ) : null}

            <div className={styles.classRuleDock}>
              <strong>课堂规则</strong>
              <span><i aria-hidden="true">↔</i> 距离 = 论证相似</span>
              <span><i aria-hidden="true">▦</i> 桌组 = 观点路径</span>
              <span><i aria-hidden="true">≠</i> 颜色不分正误</span>
            </div>

            <div className={styles.doorMarker} aria-hidden="true">
              <i />
              <strong>走廊入口</strong>
              <span>1F →</span>
            </div>

            {hasCandidate ? (
              <div className={styles.candidateStory} role="status">
                {isSeated ? (
                  <strong>你已入席 · 学生 {studentSeatNumber(classroom, demoScenario.seatmate.studentId)} 向你招了招手</strong>
                ) : (
                  STORY_STEPS.map((step, index) => {
                    const reached = index < activeStoryStep || atLeast(phase, step.phase);
                    const current = index === activeStoryStep || (activeStoryStep === -1 && index === STORY_STEPS.length - 1);
                    return (
                      <span key={step.phase} className={current ? styles.storyCurrent : reached ? styles.storyReached : styles.storyPending}>
                        {index > 0 ? <i aria-hidden="true">→</i> : null}
                        {current ? <strong>{step.label}</strong> : step.label}
                      </span>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </section>

        {session.panel.kind === "student" ? (
          <StudentDetailSheet
            classroom={classroom}
            studentId={session.panel.studentId}
            onClose={closeSheet}
          />
        ) : showNotePanel ? (
          <ClassroomNotePanel
            scenario={demoScenario}
            phase={phase}
            answerText={session.answerText}
            onOpenMySeat={() => dispatch({ type: "open_my_seat" })}
            onBack={() => dispatch({ type: "close_panel" })}
          />
        ) : (
          <ClassroomContextRail
            classroom={classroom}
            scenario={demoScenario}
            state={session}
            onStartRoundtable={() => dispatch({ type: "start_roundtable" })}
            onEditOpinion={(value) => dispatch({ type: "edit_opinion", value })}
            onUseSampleOpinion={() =>
              dispatch({ type: "use_sample_opinion", value: demoScenario.noteText })
            }
            onSubmitOpinion={() => dispatch({ type: "submit_opinion" })}
            onOpenSeatmate={() => dispatch({ type: "open_seatmate" })}
            onStartChallenge={() => dispatch({ type: "start_challenge" })}
            onEditAnswer={(value) => dispatch({ type: "edit_answer", value })}
            onUseSampleAnswer={() =>
              dispatch({ type: "use_sample_answer", value: demoScenario.seatmate.sampleAnswer })
            }
            onSubmitAnswer={() => dispatch({ type: "submit_answer" })}
            onOpenNote={() => dispatch({ type: "open_note" })}
            onClaimSeat={() => dispatch({ type: "claim_seat" })}
            onOpenCampusRoom={(roomNumber, isCurrent) =>
              dispatch({ type: "open_campus_room", roomNumber, isCurrent })
            }
            onReset={() => dispatch({ type: "reset" })}
          />
        )}
      </div>

      <details className={styles.accessibleRoster}>
        <summary>打开 Canvas 等价文字视图（40 位学生）</summary>
        <section aria-labelledby="roster-title">
          <div className={styles.rosterIntro}>
            <div>
              <p className={styles.stageKicker}>等价文字视图</p>
              <h2 id="roster-title">按观点组浏览学生</h2>
            </div>
            <p>使用 Tab 键选择学生，按 Enter 或空格打开详情。</p>
          </div>

          <div className={styles.rosterGroups}>
            {studentsByCluster.map(({ cluster, students }, clusterIndex) => (
              <section key={cluster.id} className={styles.rosterGroup}>
                <h3>
                  <i className={styles[`clusterColor${clusterIndex + 1}`]} />
                  {cluster.label}
                </h3>
                <p>{students.length} 位学生</p>
                <ul>
                  {students.map(({ student, source, argument }) => (
                    <li key={student.id}>
                      <button
                        ref={(element) => {
                          if (element) studentButtonRefs.current.set(student.id, element);
                          else studentButtonRefs.current.delete(student.id);
                        }}
                        type="button"
                        className={selectedStudentId === student.id ? styles.rosterButtonSelected : styles.rosterButton}
                        onClick={() => selectStudent(student.id, true)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            selectStudent(student.id, true);
                          }
                        }}
                      >
                        <span>学生 {studentSeatNumber(classroom, student.id)} · {source.author.displayName}</span>
                        <small>{argument.conclusion}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </details>

      <footer className={styles.provenanceNote}>
        本页使用人工构造的演示数据，仅用于验证教室体验；102–103 为走廊预告与 Mock 入口，不代表已加载真实课堂。
      </footer>
    </main>
  );
}
