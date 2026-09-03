"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { analysisApiSuccessSchema, apiFailureSchema } from "@/contracts";
import type { Classroom } from "@/domain/schemas";
import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import { ForceGraphAdapter } from "./ForceGraphAdapter";
import { ClassroomContextRail } from "./ClassroomContextRail";
import { ClassroomNotePanel } from "./ClassroomNotePanel";
import { ClusterDetailSheet } from "./ClusterDetailSheet";
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const studentButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreStudentIdRef = useRef<string | null>(null);
  const restoreClusterIdRef = useRef<string | null>(null);
  const candidateAbortRef = useRef<AbortController | null>(null);

  const { phase } = session;
  const selectedStudentId =
    session.panel.kind === "student" ? session.panel.studentId : null;
  const hasCandidate = phaseHasCandidate(phase);
  const isSeated = phaseIsSeated(phase);
  const headcount = classroom.students.length + (isSeated ? 1 : 0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);
    return () => media.removeEventListener("change", syncPreference);
  }, []);

  // ── 课代表圆桌计时：一轮结构化、可跳过 ─────────────────────
  useEffect(() => {
    if (phase !== "roundtable") return;
    if (prefersReducedMotion) {
      const frame = window.requestAnimationFrame(() =>
        dispatch({ type: "roundtable_finish" }),
      );
      return () => window.cancelAnimationFrame(frame);
    }
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
  }, [
    phase,
    prefersReducedMotion,
    session.roundtableStep,
    demoScenario.roundtable.speakers.length,
  ]);

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
    const clusterId = restoreClusterIdRef.current;
    dispatch({ type: "close_panel" });
    window.requestAnimationFrame(() => {
      if (studentId) studentButtonRefs.current.get(studentId)?.focus();
      if (clusterId) document.getElementById(`cluster-trigger-${clusterId}`)?.focus();
    });
  }, []);

  const selectCluster = useCallback((clusterId: string) => {
    restoreStudentIdRef.current = null;
    restoreClusterIdRef.current = clusterId;
    dispatch({ type: "select_cluster", clusterId });
  }, []);

  const submitOpinion = useCallback(
    async (noteText: string) => {
      candidateAbortRef.current?.abort();
      const controller = new AbortController();
      candidateAbortRef.current = controller;
      const requestId = `req_client_${crypto.randomUUID().replaceAll("-", "")}`;
      dispatch({ type: "submit_opinion", requestId });

      try {
        const sampleMatches = noteText.trim() === demoScenario.noteText.trim();
        const response = await fetch("/api/v1/candidate-seat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            schemaVersion: classroom.schemaVersion,
            questionId: classroom.question.id,
            classroomRevision: classroom.revision,
            noteText,
            sampleId: sampleMatches ? "sample_learn_programming_v1" : undefined,
            idempotencyKey: requestId,
          }),
          signal: controller.signal,
        });
        const body: unknown = await response.json();
        if (!response.ok) {
          const failure = apiFailureSchema.parse(body);
          throw new Error(failure.error.message);
        }
        const success = analysisApiSuccessSchema.parse(body);
        dispatch({ type: "resolve_opinion", requestId, result: success.data });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        dispatch({
          type: "reject_opinion",
          requestId,
          message: error instanceof Error ? error.message : "分析没有完成，请重试。",
        });
      } finally {
        if (candidateAbortRef.current === controller) candidateAbortRef.current = null;
      }
    },
    [classroom.question.id, classroom.revision, classroom.schemaVersion, demoScenario.noteText],
  );

  useEffect(() => () => candidateAbortRef.current?.abort(), []);

  const resetSession = useCallback(() => {
    candidateAbortRef.current?.abort();
    candidateAbortRef.current = null;
    dispatch({ type: "reset" });
  }, []);

  const showNotePanel =
    session.panel.kind === "note" ||
    (session.panel.kind === "default" && phase === "responded");

  const nextStoryStep = STORY_STEPS.findIndex(
    (step) => !atLeast(phase, step.phase),
  );
  const activeStoryStep = isSeated
    ? STORY_STEPS.length
    : nextStoryStep === -1
      ? STORY_STEPS.length - 1
      : Math.max(0, nextStoryStep - 1);

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
              blackboardExpanded={atLeast(phase, "reflection")}
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
              <strong>通往走廊</strong>
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
        ) : session.panel.kind === "cluster" ? (
          <ClusterDetailSheet
            classroom={classroom}
            clusterId={session.panel.clusterId}
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
            onSubmitOpinion={() => void submitOpinion(session.opinionText)}
            onRetryOpinion={() => {
              if (session.candidate.status !== "error") return;
              const submittedText = session.candidate.submittedText;
              void submitOpinion(submittedText);
            }}
            onOpenSeatmate={() => dispatch({ type: "open_seatmate" })}
            onStartChallenge={() => dispatch({ type: "start_challenge" })}
            onEditAnswer={(value) => dispatch({ type: "edit_answer", value })}
            onUseSampleAnswer={() =>
              dispatch({ type: "use_sample_answer", value: demoScenario.seatmate.sampleAnswer })
            }
            onSubmitAnswer={() =>
              dispatch({
                type: "submit_answer",
                sampleMatches:
                  session.answerText.trim() === demoScenario.seatmate.sampleAnswer.trim(),
              })
            }
            onSelectCluster={selectCluster}
            onOpenNote={() => dispatch({ type: "open_note" })}
            onClaimSeat={() => dispatch({ type: "claim_seat" })}
            onOpenCampusRoom={(roomNumber, isCurrent) =>
              dispatch({ type: "open_campus_room", roomNumber, isCurrent })
            }
            onReset={resetSession}
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
