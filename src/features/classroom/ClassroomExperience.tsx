"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";

import type { Classroom } from "@/domain/schemas";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import { ForceGraphAdapter } from "./ForceGraphAdapter";
import { StudentDetailSheet } from "./StudentDetailSheet";
import styles from "./classroom.module.css";

type SelectionState =
  | { kind: "none" }
  | { kind: "student"; studentId: string };

type SelectionEvent =
  | { type: "select_student"; studentId: string }
  | { type: "close" };

function selectionReducer(
  state: SelectionState,
  event: SelectionEvent,
): SelectionState {
  if (event.type === "select_student") {
    return { kind: "student", studentId: event.studentId };
  }

  if (state.kind === "none") {
    return state;
  }

  return { kind: "none" };
}

type ClassroomExperienceProps = {
  classroom: Classroom;
};

export function ClassroomExperience({ classroom }: ClassroomExperienceProps) {
  const [selection, dispatch] = useReducer(selectionReducer, { kind: "none" });
  const studentButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreStudentIdRef = useRef<string | null>(null);

  const selectedStudentId =
    selection.kind === "student" ? selection.studentId : null;

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
    dispatch({ type: "select_student", studentId });
  }, []);

  const closeSheet = useCallback(() => {
    const studentId = restoreStudentIdRef.current;
    dispatch({ type: "close" });

    window.requestAnimationFrame(() => {
      if (studentId) {
        studentButtonRefs.current.get(studentId)?.focus();
      }
    });
  }, []);

  return (
    <main className={styles.experienceShell}>
      <header className={styles.classroomHeader}>
        <div className={styles.headerCopy}>
          <div className={styles.headerMeta}>
            <span className={styles.modeBadge}>开发模式 · Mock 数据</span>
            <span>
              {classroom.students.length} 位学生 · {classroom.clusters.length} 个观点簇
            </span>
          </div>
          <p className={styles.eyebrow}>知遇 · 一席 / 观点教室</p>
          <h1>{classroom.question.title}</h1>
          <p className={styles.meaningCopy}>
            一位学生代表一条演示来源；坐得更近，表示论证更相似。
          </p>
        </div>
        <div className={styles.classroomLegend} aria-label="观点簇图例">
          {classroom.clusters.map((cluster, index) => (
            <span key={cluster.id}>
              <i className={styles[`clusterColor${index + 1}`]} />
              {cluster.label}
            </span>
          ))}
        </div>
      </header>

      <div
        className={`${styles.classroomWorkspace} ${
          selectedStudentId ? styles.withSheet : ""
        }`}
      >
        <section className={styles.stage} aria-labelledby="stage-heading">
          <div className={styles.stageIntro}>
            <div>
              <p className={styles.stageKicker}>Classroom 01</p>
              <h2 id="stage-heading">走进这间观点教室</h2>
            </div>
            <p>点一位学生，看看他为什么坐在这里。</p>
          </div>

          <div className={styles.stageCanvas}>
            <ForceGraphAdapter
              classroom={classroom}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(studentId) => selectStudent(studentId)}
            />
            <div className={styles.doorMarker} aria-hidden="true">
              <span>入口</span>
            </div>
          </div>
          <p className={styles.stageCaption}>
            座位距离呈现论证相似性；颜色只帮助辨认分组，不代表正误、强弱或支持率。
          </p>
        </section>

        {selectedStudentId ? (
          <StudentDetailSheet
            classroom={classroom}
            studentId={selectedStudentId}
            onClose={closeSheet}
          />
        ) : null}
      </div>

      <section className={styles.accessibleRoster} aria-labelledby="roster-title">
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

      <footer className={styles.provenanceNote}>
        本页使用人工构造的演示数据，仅用于验证教室体验，不代表真实知乎样本。
      </footer>
    </main>
  );
}
