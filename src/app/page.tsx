import Link from "next/link";
import { loadClassroom } from "@/server/use-cases/load-classroom";
import { classroomCatalog, classroomHref } from "../../data/classrooms/catalog";
import styles from "./home.module.css";

export default async function HomePage() {
  const rooms = await Promise.all(classroomCatalog.map(async room => ({ ...room, classroom: await loadClassroom(room.questionId, { requestId: "page_home", signal: new AbortController().signal, deadlineAt: Number.POSITIVE_INFINITY, mode: room.mode }) })));
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="主导航"><span className={styles.wordmark}>知遇 · 一席</span><span className={styles.phase}>认知校园 / 编程学习楼 · 1F</span></nav>
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>一道问题，一间观点教室</p>
        <h1 id="home-title">听见不同的想法，<br />留下自己的<span>一席。</span></h1>
        <p className={styles.lede}>从选语言，到做项目，再到与 AI 一起学习。听见不同的观点，也带来你的一次尝试：让经历成为黑板上的新材料，邀请下一位朋友接着聊。</p>
        <Link className={styles.primaryAction} href={classroomHref(rooms[0].questionId)}>从 101 开始这段旅程 <span aria-hidden="true">→</span></Link>
        <ol className={styles.journey} aria-label="每节课的学习过程"><li><b>01</b>看观点</li><li><b>02</b>写想法</li><li><b>03</b>同桌追问</li><li><b>04</b>带走笔记</li></ol>
        <p className={styles.disclosure}>101 使用真实知乎回答摘要；102、103 使用明确标注的合成材料。每间均可完整体验。</p>
      </div>
      <div className={styles.corridor}>
        <div className={styles.directoryHeading}><span>今日开放的教室</span><small>3 间 · 由浅入深</small></div>
        {rooms.map((room, index) => <div key={room.number}>
          <Link className={styles.room} href={classroomHref(room.questionId)}>
            <span className={styles.roomNumber}>{room.number}<small>CLASSROOM</small></span>
            <div className={styles.roomBody}><span className={styles.roomMode}>{room.classroom.provenance.mode === "mock" ? "合成演示 · 非真实知乎回答" : "真实知乎摘要 · 数据快照"}</span><h2>{room.title}</h2><p>{room.subtitle}</p><span className={styles.roomStats}>{room.classroom.students.length} 位学生 · {room.classroom.clusters.length} 个观点组 <b>走进教室 ↗</b></span></div>
          </Link>
          {index < 2 && <div className={styles.connection}><span aria-hidden="true">↓</span>{index === 0 ? "有了起点，然后怎样学？" : "有了工具，怎样自己想？"}</div>}
        </div>)}
      </div>
    </section>
    <footer className={styles.footer}><span>每个学生是一条观点材料，每张桌子是一种思考路径。</span><span>理解讨论 · 核对证据 · 亲自表达</span></footer>
  </main>;
}
