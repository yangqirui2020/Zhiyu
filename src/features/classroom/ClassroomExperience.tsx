"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";

import type { Classroom } from "@/domain/schemas";
import type { DemoSeatmateScenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v2";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import { ForceGraphAdapter } from "./ForceGraphAdapter";
import {
  ClassroomContextRail,
  type ContextPanel,
} from "./ClassroomContextRail";
import { StudentDetailSheet } from "./StudentDetailSheet";
import styles from "./classroom.module.css";

type ExperienceState = {
  candidateStatus: "hidden" | "revealed";
  panel: ContextPanel | { kind: "student"; studentId: string };
  noteText: string;
};

type ExperienceEvent =
  | { type: "select_student"; studentId: string }
  | { type: "open_note" }
  | { type: "edit_note"; value: string }
  | { type: "use_sample"; value: string }
  | { type: "reveal_candidate" }
  | { type: "open_seatmate" }
  | { type: "ask_seatmate" }
  | { type: "back_to_candidate" }
  | { type: "open_campus_room"; roomNumber: string; isCurrent: boolean }
  | { type: "return_to_classroom" }
  | { type: "reset" }
  | { type: "close" };

function defaultPanel(candidateStatus: ExperienceState["candidateStatus"]): ContextPanel {
  return candidateStatus === "revealed" ? { kind: "candidate" } : { kind: "overview" };
}

function experienceReducer(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  if (event.type === "select_student") {
    return { ...state, panel: { kind: "student", studentId: event.studentId } };
  }
  if (event.type === "open_note") return { ...state, panel: { kind: "note" } };
  if (event.type === "edit_note") return { ...state, noteText: event.value };
  if (event.type === "use_sample") return { ...state, noteText: event.value };
  if (event.type === "reveal_candidate") {
    return { ...state, candidateStatus: "revealed", panel: { kind: "candidate" } };
  }
  if (event.type === "open_seatmate") return { ...state, panel: { kind: "seatmate" } };
  if (event.type === "ask_seatmate") return { ...state, panel: { kind: "conversation" } };
  if (event.type === "back_to_candidate") return { ...state, panel: { kind: "candidate" } };
  if (event.type === "open_campus_room") {
    return {
      ...state,
      panel: event.isCurrent
        ? defaultPanel(state.candidateStatus)
        : { kind: "campus", roomNumber: event.roomNumber },
    };
  }
  if (event.type === "return_to_classroom" || event.type === "close") {
    return { ...state, panel: defaultPanel(state.candidateStatus) };
  }
  if (event.type === "reset") {
    return { candidateStatus: "hidden", panel: { kind: "overview" }, noteText: "" };
  }
  return state;
}

type ClassroomExperienceProps = {
  classroom: Classroom;
  demoScenario: DemoSeatmateScenario;
};

export function ClassroomExperience({ classroom, demoScenario }: ClassroomExperienceProps) {
  const [state, dispatch] = useReducer(experienceReducer, {
    candidateStatus: "hidden",
    panel: { kind: "overview" },
    noteText: "",
  });
  const studentButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreStudentIdRef = useRef<string | null>(null);

  const selectedStudentId =
    state.panel.kind === "student" ? state.panel.studentId : null;
  const candidateVisible = state.candidateStatus === "revealed";
  const focusedStudentId = selectedStudentId ?? (candidateVisible ? demoScenario.seatmate.studentId : null);
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

  const selectStudent = useCallback((studentId: string, restoreFocus = false) => {
    restoreStudentIdRef.current = restoreFocus ? studentId : null;
    if (
      state.candidateStatus === "revealed" &&
      studentId === demoScenario.seatmate.studentId
    ) {
      dispatch({ type: "open_seatmate" });
      return;
    }
    dispatch({ type: "select_student", studentId });
  }, [demoScenario.seatmate.studentId, state.candidateStatus]);

  const closeSheet = useCallback(() => {
    const studentId = restoreStudentIdRef.current;
    dispatch({ type: "close" });
    window.requestAnimationFrame(() => {
      if (studentId) studentButtonRefs.current.get(studentId)?.focus();
    });
  }, []);

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
              onClick={() => dispatch({
                type: "open_campus_room",
                roomNumber: room.number,
                isCurrent: room.status === "current",
              })}
              title={`${room.title} · ${room.note}`}
            >
              <b>{room.number}</b>
              <span>{room.status === "current" ? "本班" : room.note}</span>
            </button>
          ))}
        </nav>

        <div className={styles.headerMeta}>
          <span className={styles.modeBadge}>{demoScenario.disclosure}</span>
          <span>{classroom.students.length} 人 · {classroom.clusters.length} 组</span>
        </div>
      </header>

      <div className={styles.classroomWorkspace}>
        <section className={styles.stage} aria-labelledby="stage-heading">
          <div className={styles.stageCanvas}>
            <div className={styles.sceneTopWall} aria-hidden="true" />
            <span className={styles.roomPlaque} aria-hidden="true">教室 01</span>

            <section className={styles.blackboardPanel} aria-label="课堂黑板信息中枢">
              <div className={styles.blackboardTopline}>
                <span>CLASSROOM 01 · 本期问题</span>
                <span>{classroom.students.length} 位学生 / {classroom.clusters.length} 个学习小组</span>
              </div>
              <h1 id="stage-heading">{classroom.question.title}</h1>
              <p>
                {focusedGroupLabel
                  ? `当前聚焦：${focusedGroupLabel} · 相邻座位表示论证路径更接近`
                  : "课堂规则：座位越近，论证越相似；小组颜色不表示正误或支持率"}
              </p>
            </section>

            <ForceGraphAdapter
              classroom={classroom}
              selectedStudentId={selectedStudentId}
              candidateVisible={candidateVisible}
              candidatePosition={demoScenario.candidate}
              seatmateStudentId={demoScenario.seatmate.studentId}
              onSelectStudent={(studentId) => selectStudent(studentId)}
            />

            <div className={styles.classRuleDock}>
              <strong>课堂规则</strong>
              <span><i aria-hidden="true">↔</i> 距离 = 论证相似</span>
              <span><i aria-hidden="true">▦</i> 桌组 = 观点路径</span>
              <span><i aria-hidden="true">≠</i> 颜色不分正误</span>
            </div>

            <div className={styles.doorMarker} aria-hidden="true">
              <i />
              <strong>走廊入口</strong>
              <span>2F →</span>
            </div>

            {candidateVisible ? (
              <div className={styles.candidateStory} role="status">
                <span>01 空位亮起</span>
                <i aria-hidden="true">→</i>
                <span>02 邻桌关联</span>
                <i aria-hidden="true">→</i>
                <strong>03 同桌成立</strong>
              </div>
            ) : null}
          </div>
        </section>

        {state.panel.kind === "student" ? (
          <StudentDetailSheet
            classroom={classroom}
            studentId={state.panel.studentId}
            onClose={closeSheet}
          />
        ) : (
          <ClassroomContextRail
            classroom={classroom}
            scenario={demoScenario}
            panel={state.panel}
            noteText={state.noteText}
            onOpenNote={() => dispatch({ type: "open_note" })}
            onEditNote={(value) => dispatch({ type: "edit_note", value })}
            onUseSample={() => dispatch({ type: "use_sample", value: demoScenario.noteText })}
            onAnalyze={() => dispatch({ type: "reveal_candidate" })}
            onOpenSeatmate={() => dispatch({ type: "open_seatmate" })}
            onAskSeatmate={() => dispatch({ type: "ask_seatmate" })}
            onBackToCandidate={() => dispatch({ type: "back_to_candidate" })}
            onReturnToClassroom={() => dispatch({ type: "return_to_classroom" })}
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
        本页使用人工构造的演示数据，仅用于验证教室体验；02–04 为走廊预告，不代表已加载真实课堂。
      </footer>
    </main>
  );
}
