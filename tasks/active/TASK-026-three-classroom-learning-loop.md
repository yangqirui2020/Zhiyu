# TASK-026 — 三间完整教室与空间/学习闭环

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 4h
- Freeze deadline: 本轮验收

## Goal
用户能进入三间内容不同的教室，在每间完成一轮学习，带走笔记并进入下一道相关问题；101 不再显得人小、桌组稀疏。

## Why in Golden Path
把门牌预览变成实际问题探索，把留下一席连接到可带走的个人产物与下一个问题。

## Dependencies / Inputs / Outputs
- Dependencies: TASK-019、021、022、023、024 Done；PDR-0005 Accepted。
- Inputs: 用户当前请求、101 不可变真实 Snapshot、现有 Domain/API/学习会话。
- Outputs: 三间目录、两间合成数据包、完整操作、响应式布局、验证报告。

## Scope
- Allowed Files: `src/app/page.tsx`、`src/app/home.module.css`、`src/app/classroom/**`、`src/features/classroom/**`、`src/domain/schemas/classroom.ts`、`src/domain/schemas/catalog.ts`、`src/domain/schemas/index.ts`、`src/domain/schemas/snapshot.ts`、`src/server/use-cases/**`、`src/server/providers/catalog/**`、`src/server/providers/synthetic/**`、`src/server/providers/live/live-learning-turn-provider.ts`、`src/server/pipelines/candidate-seat/analyze.ts`、`src/server/pipelines/learning/generate.ts`、`data/classrooms/**`、`scripts/validate-snapshots/check.ts`、`tests/**`、`docs/proposals/PROP-0007-three-classrooms.md`、`docs/decisions/pdr/PDR-0005-three-open-classrooms.md`、`docs/decisions/INDEX.md`、`docs/contracts/REAL_DELIVERY_CONTRACT.md`、`tasks/README.md`、本 Task、`verification/TASK-026/**`、`output/playwright/**`、`.playwright-cli/**`、`README.md`。
- Forbidden Files: 旧 Snapshot 内容、其他 Accepted Record、依赖/锁文件、密钥/个人笔记、用户已有 AGENTS.md 与 next-env.d.ts 改动。
- Non-Scope: 自动部署/知乎发布、自由多轮聊天、账户/数据库、任意实时建室。

## Contracts & Decisions
Allowed Files 补充：`src/domain/schemas/candidate-generation.ts`，将原固定 Sample ID 扩展为带前缀 ID，身份仍由 questionId/revision/hash/原文共同验证。

PROP-0007、PDR-0005，Domain rc.2 来源扩展；API/State/Provider Port 不变。目录与新增数据均通过 Zod 与引用验证。

## States / Events / Guards / Effects / Recovery
沿既有 phase 与 requestId 守卫；切题卸载取消请求；示例精确匹配，任意笔记不能伪回退。来源不足不凑真实人数。输入失败保留/重试，reset 清空个人状态。

## Exact UI Copy
「真实知乎摘要 · 数据快照」「合成演示 · 非真实知乎回答」「看观点 → 写想法 → 同桌追问 → 留下一席」「下载课堂笔记」「去知乎搜索这个问题」。黑板统一「样本共同点」。

## Edge Cases
三题直达/刷新/往返、未知题 404、样例错题/错 revision、任意输入/错误恢复、第二次操作、长题目、12/24 人、手机、键盘与 Reduced Motion。

## Acceptance Criteria
- [x] A. 首页与门牌均能进入 101/102/103，独立题目、来源、圆桌、笔记和后续问题。
- [x] B. 101 保留 12 条真实来源；102/103 各至少 24 条独立合成材料，引用/计数正确，所有来源边界可见。
- [x] C. 每题精确示例完整走到入席/笔记下载/知乎出口/下一教室；个人 Live 能复用现有服务，失败不套样例。
- [x] D. 101 人物与桌组占据合理空间，24 人课堂无碰撞；三视口截图、键盘/Reduced Motion、无横向溢出/console error。
- [x] E. 切题/reset/stale/重复操作与来源合同回归通过，typecheck/lint/test/build/diff-check PASS。

## Verification
- Commands: npm run typecheck、npm run lint、npm test、npm run build、git diff --check。
- Visual: 1440×900、1366×768、390×844；首页、三教室 ready、Candidate、入席与出口；Playwright 操作记录。
- Artifacts: verification/TASK-026/report.md；截图 output/playwright/TASK-026。

## Do Not / Rollback / Blocker Rule
不复制真实来源增人数，不生成虚假原文，不保存用户真实输入，不把 Live 失败套固定结论。Recovery 失败按 AGENTS.md 建 Blocker。回退仅本任务改动。

## Docs to Update
Task、任务板、Decision Index、真实交付合同增量、README、verification report。
