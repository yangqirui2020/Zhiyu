import Link from "next/link";
import { loadClassroom } from "@/server/use-cases/load-classroom";

import styles from "./home.module.css";

const classroomHref = "/classroom/q_learn_programming";

export default async function HomePage() {
  const classroom = await loadClassroom("q_learn_programming", { requestId: "page_home", signal: new AbortController().signal, deadlineAt: Number.POSITIVE_INFINITY, mode: "snapshot" });
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="主导航">
        <span className={styles.wordmark}>知遇 · 一席</span>
        <span className={styles.phase}>Demo V3 · Learning loop</span>
      </nav>

      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.eyebrow}>一题，一间观点教室</p>
        <h1 id="home-title">
          走进一个问题，
          <br />
          看看观点坐在哪里。
        </h1>
        <p className={styles.lede}>
          回答化作教室里的学生。先听不同小组交流，再写下你的观点，让同桌追问你一次，带着属于自己的说法入席。
        </p>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href={classroomHref}>
            走进 Classroom 101
            <span aria-hidden="true">→</span>
          </Link>
          <span className={styles.disclosure}>{classroom.provenance.mode === "mock" ? "开发模式 · 人工 Mock 数据" : "真实知乎回答摘要 · AI 整理的观点教室"}</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>{classroom.students.length} 位学生</span>
        <span>{classroom.clusters.length} 个观点组</span>
        <span>摘要与来源链接可查看</span>
      </footer>
    </main>
  );
}
