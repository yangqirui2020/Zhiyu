"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { classroomCatalog, classroomHref, findClassroom } from "../../../data/classrooms/catalog";

import { analysisApiSuccessSchema, apiFailureSchema, learningApiSuccessSchema } from "@/contracts";
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
  preparedLearning,
  seatClaimed as phaseIsSeated,
  sessionReducer,
  type SessionPhase,
} from "./session-machine";
import styles from "./classroom.module.css";

const ROUNDTABLE_LINE_MS = 2600;
const ROUNDTABLE_WRAP_MS = 900;

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

export function ClassroomExperience({ classroom, demoScenario: baseScenario }: ClassroomExperienceProps) {
  const router = useRouter();
  const room = findClassroom(classroom.question.id)!;
  const legacyFixture = classroom.schemaVersion === "1.0.0-rc.1";
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const studentButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreStudentIdRef = useRef<string | null>(null);
  const restoreClusterIdRef = useRef<string | null>(null);
  const candidateAbortRef = useRef<AbortController | null>(null);
  const learningAbortRef = useRef<AbortController | null>(null);
  const prepared = preparedLearning(session.learning);
  const demoScenario = useMemo(() => ({
    ...baseScenario,
    ...(prepared ? { seatmate: prepared.seatmate } : {}),
    ...(session.learning.status === "completed" ? {
      classNote: session.learning.result.classNote,
      mySeat: session.learning.result.mySeat,
      zhihuDraft: session.learning.result.zhihuDraft,
      evidenceIds: session.learning.result.evidenceIds,
    } : {}),
  }), [baseScenario, prepared, session.learning]);
  const matchedStudentId = legacyFixture ? demoScenario.seatmate.studentId : prepared?.seatmate.studentId ?? null;

  const { phase } = session;
  const selectedStudentId =
    session.panel.kind === "student" ? session.panel.studentId : null;
  const hasCandidate = phaseHasCandidate(phase);
  const isSeated = phaseIsSeated(phase);
  const headcount = classroom.students.length + (isSeated ? 1 : 0);

  useEffect(() => {
    const panel = workspaceRef.current?.querySelector("aside");
    const content = panel?.querySelector<HTMLElement>("[data-lesson-content]");
    if (content) content.scrollTop = 0;
    if (phase !== "exploring" && phase !== "roundtable" && window.matchMedia("(max-width: 720px)").matches) panel?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [phase, session.panel.kind]);

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
    selectedStudentId ?? (hasCandidate ? matchedStudentId : null);
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
      if (legacyFixture && phase === "candidate" && studentId === demoScenario.seatmate.studentId) {
        dispatch({ type: "open_seatmate" });
        return;
      }
      dispatch({ type: "select_student", studentId });
    },
    [legacyFixture, demoScenario.seatmate.studentId, phase],
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
            sampleId: sampleMatches ? room.sampleId : undefined,
            idempotencyKey: requestId,
          }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const failure = apiFailureSchema.safeParse(body);
          throw new Error(failure.success ? failure.data.error.message : "服务暂时没有返回可用结果，请重试。");
        }
        const parsed = analysisApiSuccessSchema.safeParse(body);
        if (!parsed.success) throw new Error("分析结果未通过校验，请重试。");
        const success = parsed.data;
        dispatch({ type: "resolve_opinion", requestId, result: success.data, meta: success.meta });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        dispatch({
          type: "reject_opinion",
          requestId,
          message: error instanceof DOMException && error.name === "TimeoutError" ? "分析用时较长，请保留输入后重试。" : error instanceof Error ? error.message : "分析没有完成，请重试。",
        });
      } finally {
        if (candidateAbortRef.current === controller) candidateAbortRef.current = null;
      }
    },
    [classroom.question.id, classroom.revision, classroom.schemaVersion, demoScenario.noteText, room.sampleId],
  );

  const submitLearning = useCallback(async (stage: "prepare" | "complete") => {
    if (stage === "prepare" && session.phase !== "candidate") return;
    if (stage === "complete" && session.phase !== "challenge") return;
    if (legacyFixture) {
      if (stage === "prepare") dispatch({ type: "open_seatmate" });
      else dispatch({ type: "submit_answer", sampleMatches: session.answerText.trim() === demoScenario.seatmate.sampleAnswer.trim() });
      return;
    }
    if (session.candidate.status !== "resolved" || (stage === "complete" && !prepared)) return;
    learningAbortRef.current?.abort();
    const controller = new AbortController();
    learningAbortRef.current = controller;
    const requestId = `req_learning_${crypto.randomUUID().replaceAll("-", "")}`;
    dispatch({ type: "start_learning", stage, requestId });
    try {
      const response = await fetch("/api/v1/learning-turn", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemaVersion: classroom.schemaVersion, questionId: classroom.question.id, classroomRevision: classroom.revision, noteText: session.candidate.submittedText, idempotencyKey: requestId, stage,
          ...(stage === "complete" ? { answerText: session.answerText, challengeToken: prepared!.challengeToken } : {}),
        }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) { const parsed = apiFailureSchema.safeParse(body); throw new Error(parsed.success ? parsed.data.error.message : "服务暂时没有返回可用结果，请重试。"); }
      const parsed = learningApiSuccessSchema.safeParse(body);
      if (!parsed.success) throw new Error("学习结果未通过校验，请重试。");
      dispatch({ type: "resolve_learning", requestId, result: parsed.data.data, meta: parsed.data.meta });
    } catch (error) {
      if (controller.signal.aborted) return;
      dispatch({ type: "reject_learning", requestId, message: error instanceof DOMException && error.name === "TimeoutError" ? "处理用时较长，输入已保留，请重试。" : error instanceof Error ? error.message : "学习结果生成失败，请重试。" });
    } finally { if (learningAbortRef.current === controller) learningAbortRef.current = null; }
  }, [legacyFixture, classroom.schemaVersion, classroom.question.id, classroom.revision, session.phase, session.candidate, session.answerText, prepared, demoScenario.seatmate.sampleAnswer]);

  useEffect(() => () => { candidateAbortRef.current?.abort(); learningAbortRef.current?.abort(); }, []);

  const resetSession = useCallback(() => {
    candidateAbortRef.current?.abort();
    candidateAbortRef.current = null;
    learningAbortRef.current?.abort();
    learningAbortRef.current = null;
    dispatch({ type: "reset" });
  }, []);

  const showNotePanel =
    session.panel.kind === "note" ||
    (session.panel.kind === "default" && phase === "responded");

  return (
    <main className={styles.experienceShell}>
      <header className={styles.classroomHeader}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brandMark}>知遇 · 一席</Link>
          <span className={styles.pixelEdition}>PIXEL CLASSROOM</span>
        </div>

        <div className={styles.campusIdentity}>
          <span>{demoScenario.campus.building}</span>
          <strong>{demoScenario.campus.floor} · 走廊</strong>
        </div>

        <nav className={styles.roomStrip} aria-label="认知校园教室入口">
          {demoScenario.campus.rooms.map((room) => (
            <Link
              key={room.number}
              href={classroomHref(classroomCatalog.find(item => item.number === room.number)!.questionId)}
              className={room.status === "current" ? styles.roomTabCurrent : styles.roomTab}
              aria-current={room.status === "current" ? "page" : undefined}
              title={`${room.title} · ${room.note}`}
            >
              <b>{room.number}</b>
              <span>{room.status === "current" ? "本班" : room.note}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.headerMeta}>
          <span className={styles.modeBadge}>{classroom.provenance.mode === "mock" ? "合成演示 · 非真实知乎回答" : "真实知乎摘要 · 数据快照"}</span>
          <span>{headcount} 人 · {classroom.clusters.length} 组</span>
        </div>
      </header>

      <ol className={styles.lessonJourney} aria-label="本节课的学习进度">
        {[{ label: "看观点", phase: "exploring" }, { label: "写想法", phase: "reflection" }, { label: "同桌追问", phase: "candidate" }, { label: "留下一席", phase: "responded" }].map((step, index, steps) => {
          const reached = atLeast(phase, step.phase as SessionPhase);
          const current = reached && (index === steps.length - 1 || !atLeast(phase, steps[index + 1].phase as SessionPhase));
          return <li key={step.label} className={current ? styles.journeyCurrent : reached ? styles.journeyDone : undefined} aria-current={current ? "step" : undefined}><b>{reached && !current ? "✓" : `0${index + 1}`}</b>{step.label}</li>;
        })}
        <li className={styles.journeyResult}>带走课堂笔记，继续下一题</li>
      </ol>

      <div ref={workspaceRef} className={styles.classroomWorkspace}>
        <section className={styles.stage} aria-labelledby="stage-heading">
          <div className={styles.stageCanvas} data-expanded={atLeast(phase, "reflection")}>
            <div className={styles.sceneTopWall} aria-hidden="true" />
            <span className={styles.roomPlaque} aria-hidden="true">教室 {room.number}</span>

            <section className={styles.blackboardPanel} aria-label="课堂黑板信息中枢">
              <div className={styles.blackboardTopline}>
                <span>CLASSROOM {room.number} · 本期问题</span>
                <span>{headcount} 位学生 / {classroom.clusters.length} 个学习小组</span>
              </div>
              <h1 id="stage-heading">{classroom.question.title}</h1>
              {phase === "roundtable" ? (
                <p>课代表圆桌进行中——各组正在互相听对方说话</p>
              ) : (
                <p>
                  {focusedGroupLabel
                    ? `当前聚焦：${focusedGroupLabel} · 同组共享相近的论证路径`
                    : "课堂规则：按论证路径分组；组内座次与颜色不表示排名"}
                </p>
              )}
              {atLeast(phase, "reflection") ? (
                <div className={styles.blackboardOutcome}>
                  <div>
                    <span>样本共同点</span>
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
              seatmateStudentId={matchedStudentId ?? ""}
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
              <span><i aria-hidden="true">↔</i> 同组 = 相近论证</span>
              <span><i aria-hidden="true">▦</i> 桌组 = 观点路径</span>
              <span><i aria-hidden="true">≠</i> 颜色不分正误</span>
            </div>

            <div className={styles.doorMarker} aria-hidden="true">
              <i />
              <strong>通往走廊</strong>
              <span>1F →</span>
            </div>

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
            classroom={classroom}
            learning={session.learning}
            originalNote={session.candidate.status === "resolved" ? session.candidate.submittedText : session.opinionText}
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
            onOpenSeatmate={() => void submitLearning("prepare")}
            onStartChallenge={() => dispatch({ type: "start_challenge" })}
            onEditAnswer={(value) => dispatch({ type: "edit_answer", value })}
            onUseSampleAnswer={() =>
              dispatch({ type: "use_sample_answer", value: demoScenario.seatmate.sampleAnswer })
            }
            onSubmitAnswer={() => void submitLearning("complete")}
            onSelectCluster={selectCluster}
            onOpenNote={() => dispatch({ type: "open_note" })}
            onClaimSeat={() => dispatch({ type: "claim_seat" })}
            onOpenCampusRoom={(roomNumber, isCurrent) =>
              isCurrent ? dispatch({ type: "close_panel" }) : router.push(classroomHref(classroomCatalog.find(item => item.number === roomNumber)!.questionId))
            }
            onReset={resetSession}
          />
        )}
      </div>

      <details className={styles.accessibleRoster}>
        <summary>打开 Canvas 等价文字视图（{classroom.students.length} 位学生）</summary>
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
        {classroom.provenance.mode === "mock" ? `本班 ${classroom.sources.length} 条材料全部为合成演示，无真实知乎作者或回答。` : `本班使用 ${classroom.sources.length} 条真实知乎回答摘要，由 AI 整理观点。来源采集于 ${new Date(classroom.provenance.capturedAt!).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}，不代表知乎全站。`} 三间教室均已开放；切换教室会开始新的一课，请先下载需要保留的笔记。
      </footer>
    </main>
  );
}
