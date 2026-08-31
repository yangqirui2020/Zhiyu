import Link from "next/link";

import styles from "./home.module.css";

const classroomHref = "/classroom/q_learn_programming";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="主导航">
        <span className={styles.wordmark}>知遇 · 一席</span>
        <span className={styles.phase}>Vertical Slice 01</span>
      </nav>

      <section className={styles.hero} aria-labelledby="home-title">
        <p className={styles.eyebrow}>一题，一间观点教室</p>
        <h1 id="home-title">
          走进一个问题，
          <br />
          看看观点坐在哪里。
        </h1>
        <p className={styles.lede}>
          回答不再排成一条信息流。它们化作教室里的学生，论证相近的人自然坐到了一起。
        </p>

        <div className={styles.actions}>
          <Link className={styles.primaryAction} href={classroomHref}>
            进入预设教室
            <span aria-hidden="true">→</span>
          </Link>
          <span className={styles.disclosure}>当前为人工构造的 Mock 演示数据</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>40 位学生</span>
        <span>5 个观点簇</span>
        <span>每条证据均可回溯</span>
      </footer>
    </main>
  );
}
