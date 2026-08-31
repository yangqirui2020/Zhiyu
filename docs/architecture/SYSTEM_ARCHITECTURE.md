---
id: ARCH-001
status: Frozen
owner: Software Architecture
version: 1.0.0
last_verified: 2026-08-31
depends_on: [ADR-0001, ADR-0002, ADR-0003]
---

# System Architecture

## Context

Next.js App Router 单体同时承载页面与两个 BFF Route Handler。V1 的完整 Classroom 由赛前脚本预计算；运行时主计算是 Candidate Seat。数据库、队列、异步建室不进入 V1。

```text
Browser
  ├─ Server-rendered shell
  ├─ Classroom/Candidate feature machines
  └─ ForceGraphAdapter (client-only) + accessible DOM list
          │
Next.js Route Handlers /api/v1
  ├─ loadClassroom use case
  │    ├─ SnapshotClassroomSource (default Demo)
  │    └─ LiveClassroomSource (controlled preview)
  └─ analyzeCandidateSeat use case
       ├─ Claim extraction pipeline
       ├─ Embedding coarse filter
       ├─ Structured coverage judgment
       └─ deterministic evidence validation + candidate guard
          │
Ports: Content / Embedding / StructuredOutput / ClassroomSource / CandidateAnalyzer
          │
Adapters: Zhihu REST / AI SDK / SiliconFlow-compatible / repository snapshot
```

## Dependency Rule

```text
app/components → features → domain/contracts
app route → server/use-cases → server/ports → domain/contracts
server/providers → server/ports + domain/contracts
scripts/precompute → server pipelines + providers
```

- `domain` 和 `contracts` 不依赖 Next/React/Provider SDK。
- Client Component 不得 import `src/server`。
- Provider 不能决定产品措辞、Candidate guard 或 UI 模式。
- Page 只编排，不承载算法、Prompt 或第三方 SDK 调用。

## Frozen Directory

```text
src/
  app/
    (experience)/page.tsx
    (experience)/classroom/[questionId]/page.tsx
    api/v1/classrooms/[questionId]/route.ts
    api/v1/candidate-seat/route.ts
  components/{ui,shared}/
  features/
    classroom/{components,classroom-machine.ts,selectors.ts}
    candidate-seat/{components,candidate-seat-machine.ts,selectors.ts}
  domain/{schemas,rules}/
  contracts/
  server/
    use-cases/
    ports/
    providers/{zhihu,ai-sdk,embedding,snapshot}/
    pipelines/{classroom,candidate-seat}/
    prompts/
    errors/
data/
  snapshots/<question-key>/<snapshot-id>/
  samples/notes/
scripts/{precompute,validate-snapshots}/
tests/{unit,contract,integration,e2e,visual,fixtures}/
docs/ tasks/ verification/
```

## Runtime Decisions

- Route Handlers 使用 Node runtime；GET Snapshot 缓存必须显式配置，POST 不依赖隐式缓存。
- 完整 `Search → N次抽取 → Embedding → Cluster → Label` 不在同步 Route Handler 执行。
- `react-force-graph-2d` 封装为一个 `dynamic(..., { ssr: false })` Adapter；页面不调用其 API。
- Snapshot 保存稳定 seed、学生最终坐标与簇中心；Embedding 不发送到浏览器。
- Prompt 版本化；业务层只依赖 StructuredOutput Port，不依赖 AI SDK 具体函数。
- 所有外部响应先 Zod parse；无 `any` 进入 pipeline。

## 聚类约束

- 输入为 Argument 的结论 + 理由，不是全文相似度。
- 20–30 小样本使用 Agglomerative；不预设恰好三簇，允许独立观点。
- Ward 与欧氏距离绑定；技术 Spike 必须验证“向量 L2 归一化 + 欧氏距离 + Ward”或记录其他支持 cosine 的 linkage。验证前不冻结阈值数字。
- 低置信度结果保守渲染为一大簇 + 分支/独立观点。

## Security / Privacy

- Secret 只读 server environment；`.env.example` 只有变量名。
- 笔记正文不入日志、不写 Snapshot、不持久化；日志只含 requestId、长度、hash、耗时、错误码。
- 错误响应不暴露 Provider 原始消息或密钥。
- URL 必须通过 schema 限定 `https`；失效链接不显示为可点击。

