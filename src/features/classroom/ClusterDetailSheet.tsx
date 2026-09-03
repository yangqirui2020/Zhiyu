"use client";

import { useEffect, useRef } from "react";

import type { Classroom } from "@/domain/schemas";

import styles from "./classroom.module.css";

type ClusterDetailSheetProps = {
  classroom: Classroom;
  clusterId: string;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function ClusterDetailSheet({
  classroom,
  clusterId,
  onClose,
}: ClusterDetailSheetProps) {
  const sheetRef = useRef<HTMLElement>(null);
  const cluster = classroom.clusters.find((item) => item.id === clusterId);
  const representative = classroom.representatives.find(
    (item) => item.clusterId === clusterId,
  );

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    sheet.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusable = Array.from(
        sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;
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
  }, [clusterId, onClose]);

  if (!cluster || !representative) return null;

  const representativeSources = representative.representativeSourceIds.flatMap(
    (sourceId) => {
      const source = classroom.sources.find((item) => item.id === sourceId);
      return source ? [source] : [];
    },
  );

  return (
    <aside
      ref={sheetRef}
      className={`${styles.detailSheet} ${styles.clusterDetailSheet}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cluster-sheet-title"
    >
      <div className={styles.sheetHandle} aria-hidden="true" />
      <header className={styles.sheetHeader}>
        <div>
          <p className={styles.sheetEyebrow}>观点组 · Cluster Inspector</p>
          <h2 id="cluster-sheet-title">{cluster.label}</h2>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="关闭观点组详情"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div className={styles.sheetScroll}>
        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>{cluster.studentIds.length} 位学生 · AI 归纳标签</p>
          <h3>这一组为什么坐在一起</h3>
          <p className={styles.conclusion}>{cluster.summary}</p>
          <ul className={styles.reasonList}>
            {representative.commonReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>边界与不确定性</p>
          <h3>这个分组不能说明什么</h3>
          <ul className={styles.plainList}>
            {cluster.limits.map((limit) => <li key={limit}>{limit}</li>)}
          </ul>
          <p className={styles.boundaryNote}>{representative.disclosure}</p>
        </section>

        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>代表来源</p>
          <h3>本组摘要从哪里来</h3>
          <ul className={styles.clusterSourceList}>
            {representativeSources.map((source) => (
              <li key={source.id}>
                <strong>{source.title}</strong>
                <span>{source.excerpt}</span>
                <small>{source.id} · Mock 搜索摘要</small>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.sheetSection}>
          <p className={styles.sectionKicker}>课代表示例</p>
          <h3>可回答与应拒答的范围</h3>
          {representative.exampleResponses.map((response) => (
            <div className={styles.representativeExample} key={response.promptKey}>
              <strong>{response.promptKey === "cross_cluster" ? "跨组比较" : "超出范围"}</strong>
              <p>{response.text}</p>
              <small>证据：{response.evidenceIds.join("、")}</small>
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}
