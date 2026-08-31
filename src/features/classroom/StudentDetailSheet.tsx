"use client";

import { useEffect, useRef } from "react";

import type { Classroom } from "@/domain/schemas";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import styles from "./classroom.module.css";

type StudentDetailSheetProps = {
  classroom: Classroom;
  studentId: string;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function StudentDetailSheet({
  classroom,
  studentId,
  onClose,
}: StudentDetailSheetProps) {
  const sheetRef = useRef<HTMLElement>(null);
  const details = getStudentDetails(classroom, studentId);

  useEffect(() => {
    const sheet = sheetRef.current;

    if (!sheet) {
      return;
    }

    if (window.matchMedia("(max-width: 720px)").matches) {
      document.getElementById("stage-heading")?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }

    const firstFocusable = sheet.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !sheet) {
        return;
      }

      const focusable = Array.from(
        sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, studentId]);

  if (!details) {
    return null;
  }

  const { student, source, argument, cluster, evidence } = details;

  return (
    <aside
      ref={sheetRef}
      className={styles.detailSheet}
      role="dialog"
      aria-modal="false"
      aria-labelledby="student-sheet-title"
    >
      <div className={styles.sheetHandle} aria-hidden="true" />
      <header className={styles.sheetHeader}>
        <div>
          <p className={styles.sheetEyebrow}>
            学生 {studentSeatNumber(classroom, student.id)}
          </p>
          <h2 id="student-sheet-title">{source.author.displayName}</h2>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭学生详情"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div className={styles.sheetScroll}>
        <section className={styles.sheetSection}>
          <span className={styles.clusterPill}>
            {cluster?.label ?? "独立观点"}
          </span>
          <h3>这位学生的核心观点</h3>
          <p className={styles.conclusion}>{argument.conclusion}</p>
          <ul className={styles.reasonList}>
            {argument.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        {cluster ? (
          <section className={styles.sheetSection}>
            <p className={styles.sectionKicker}>为什么坐在这里</p>
            <h3>{cluster.label}</h3>
            <p>{cluster.summary}</p>
            <ul className={styles.plainList}>
              {cluster.commonReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <p className={styles.boundaryNote}>
              观点簇只表示当前演示论证的相似性，不表示正确性、支持率或社会共识。
            </p>
          </section>
        ) : null}

        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>来源</p>
          <h3>{source.title}</h3>
          <dl className={styles.sourceMeta}>
            <div>
              <dt>作者</dt>
              <dd>
                {source.author.displayName}
                {source.author.badge ? ` · ${source.author.badge}` : ""}
              </dd>
            </div>
            <div>
              <dt>内容类型</dt>
              <dd>{source.contentType === "answer" ? "回答" : "文章"}</dd>
            </div>
            <div>
              <dt>
                {classroom.provenance.mode === "mock"
                  ? "演示数据时间"
                  : "采集时间"}
              </dt>
              <dd>
                {new Intl.DateTimeFormat("zh-CN", {
                  dateStyle: "medium",
                }).format(new Date(source.capturedAt))}
              </dd>
            </div>
          </dl>
          {classroom.provenance.mode === "mock" ? (
            <p className={styles.mockSourceNote}>
              Mock 数据没有可核验的真实原文链接；正式 Snapshot 将在这里提供来源回溯。
            </p>
          ) : (
            <a
              className={styles.sourceLink}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              打开知乎来源
              <span aria-hidden="true"> ↗</span>
            </a>
          )}
        </section>

        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>证据</p>
          <h3>搜索摘要片段</h3>
          {evidence.map((item) => (
            <blockquote key={item.id} className={styles.evidenceQuote}>
              <p>{item.text}</p>
              <footer>已通过 {item.id} 回溯至这条来源的搜索摘要</footer>
            </blockquote>
          ))}
        </section>
      </div>
    </aside>
  );
}
