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
  | { type: "reset" }
  | { type: "close" };

function experienceReducer(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  if (event.type === "select_student") {
    return { ...state, panel: { kind: "student", studentId: event.studentId } };
  }
  if (event.type === "open_note") {
    return { ...state, panel: { kind: "note" } };
  }
  if (event.type === "edit_note") {
    return { ...state, noteText: event.value };
  }
  if (event.type === "use_sample") {
    return { ...state, noteText: event.value };
  }
  if (event.type === "reveal_candidate") {
    return { ...state, candidateStatus: "revealed", panel: { kind: "candidate" } };
  }
  if (event.type === "open_seatmate") {
    return { ...state, panel: { kind: "seatmate" } };
  }
  if (event.type === "ask_seatmate") {
    return { ...state, panel: { kind: "conversation" } };
  }
  if (event.type === "back_to_candidate") {
    return { ...state, panel: { kind: "candidate" } };
  }
  if (event.type === "reset") {
    return { candidateStatus: "hidden", panel: { kind: "overview" }, noteText: "" };
  }
  return {
    ...state,
    panel: state.candidateStatus === "revealed" ? { kind: "candidate" } : { kind: "overview" },
  };
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
      if (studentId) {
        studentButtonRefs.current.get(studentId)?.focus();
      }
    });
  }, []);

  const candidateVisible = state.candidateStatus === "revealed";

  return (
    <main className={styles.experienceShell}>
      <header className={styles.classroomHeader}>
        <div className={styles.brandBlock}>
          <span className={styles.brandMark}>知遇 · 一席</span>
          <span className={styles.headerDivider} />
          <span className={styles.roomNumber}>Classroom 01</span>
        </div>
        <div className={styles.headerQuestion}>
          <p>本期问题</p>
          <h1>{classroom.question.title}</h1>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.modeBadge}>{demoScenario.disclosure}</span>
          <span>{classroom.students.length} 位学生 · {classroom.clusters.length} 个观点簇</span>
        </div>
      </header>

      <div className={styles.classroomWorkspace}>
        <section className={styles.stage} aria-labelledby="stage-heading">
          <div className={styles.stageCanvas}>
            <div className={styles.stageOverlay}>
              <p className={styles.stageKicker}>观点形成的座位</p>
              <h2 id="stage-heading">一间由论证组成的教室</h2>
              <span>近，表示论证更相似</span>
            </div>
            <ForceGraphAdapter
              classroom={classroom}
              selectedStudentId={selectedStudentId}
              candidateVisible={candidateVisible}
              candidatePosition={demoScenario.candidate}
              seatmateStudentId={demoScenario.seatmate.studentId}
              onSelectStudent={(studentId) => selectStudent(studentId)}
            />
            <div className={styles.doorMarker} aria-hidden="true">
              <span>入口</span>
            </div>
          </div>
          <div className={styles.stageCaption}>
            <span>空间距离呈现论证相似性</span>
            <span>颜色不表示正误、强弱或支持率</span>
            {candidateVisible ? <strong>琥珀色空位只表示你的个人视角加入</strong> : null}
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
            <h2 id="roster-title">按观点簇浏览学生</h2>
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
                        if (element) {
                          studentButtonRefs.current.set(student.id, element);
                        } else {
                          studentButtonRefs.current.delete(student.id);
                        }
                      }}
                      type="button"
                      className={
                        selectedStudentId === student.id
                          ? styles.rosterButtonSelected
                          : styles.rosterButton
                      }
                      onClick={() => selectStudent(student.id, true)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectStudent(student.id, true);
                        }
                      }}
                    >
                      <span>
                        学生 {studentSeatNumber(classroom, student.id)} ·{" "}
                        {source.author.displayName}
                      </span>
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
        本页使用人工构造的演示数据，仅用于验证教室体验，不代表真实知乎样本。
      </footer>
    </main>
  );
}
