const frozenItems = [
  "一道问题 = 一间教室的核心隐喻与 Golden Path",
  "Candidate Seat 只表示当前样本覆盖较少",
  "Next.js App Router + Zod + Provider boundary + Snapshot-first Demo",
];

export default function HomePage() {
  return (
    <main className="spec-shell">
      <p className="eyebrow">Specification-first repository</p>
      <h1>知遇·一席</h1>
      <p className="lede">每个问题都是一间教室，让你的知识找到它该坐的位置。</p>

      <section aria-labelledby="current-stage">
        <h2 id="current-stage">当前阶段：工程骨架与合同冻结</h2>
        <p>
          这里还不是 Demo 产品页。仓库正在先固定产品、体验、数据和验收合同，避免后续实现 Agent
          一边写代码一边重新设计产品。
        </p>
      </section>

      <section aria-labelledby="frozen-decisions">
        <h2 id="frozen-decisions">已冻结</h2>
        <ul>
          {frozenItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="repo-note">
        开发入口：AGENTS.md → docs/INDEX.md → Implementation Master Plan → TASK-xxx
      </p>
    </main>
  );
}

