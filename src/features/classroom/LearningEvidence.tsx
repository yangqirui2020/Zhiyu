import type { Classroom } from "@/domain/schemas";
import styles from "./classroom.module.css";

export function LearningEvidence({ classroom, evidenceIds }: { classroom: Classroom; evidenceIds: string[] }) {
  const items = evidenceIds.flatMap((id) => {
    const evidence = classroom.evidence.find((e) => e.id === id);
    if (!evidence || evidence.kind !== "source_excerpt") return [];
    const source = classroom.sources.find((s) => s.id === evidence.sourceContentId);
    return source ? [{ evidence, source }] : [];
  });
  if (!items.length) return null;
  return <details className={styles.zhihuDraft}>
    <summary>核对参考摘要（{items.length} 条）</summary>
    <div className={styles.zhihuDraftBody}>
      {items.map(({ evidence, source }, i) => <section key={evidence.id}>
        <p><strong>{classroom.provenance.mode === "mock" ? "合成材料" : "知乎回答摘要"} {i + 1}</strong></p>
        <blockquote>{evidence.text}</blockquote>
        {classroom.provenance.mode === "mock" ? <small>合成演示，无真实知乎原回答。</small> : <a href={source.url} target="_blank" rel="noreferrer">查看知乎原回答 ↗</a>}
      </section>)}
    </div>
  </details>;
}
