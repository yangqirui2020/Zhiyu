# TASK-027 — 三教室参赛材料与公网发布

- Status: In Progress
- Owner: Primary Agent (Codex)
- Estimate: 2h
- Deadline: 2026-09-15 10:00（北京时间）

## Goal / Authorization
按用户“把更新之后的要提交的材料全部重新修改、打包”的明确指令，将 TASK-026 三教室版本同步到线上 Demo、全部当前提交材料及可复现的参赛代码包。

## Dependencies / Inputs / Outputs
- Dependencies: TASK-026 Done（2327583），TASK-025 已建立生产域名与账号授权；无需等待知乎投稿回执才能更新材料。
- Inputs: PDR-0005、三教室代码与 QA、现有 Vercel 项目、官方提交清单、已确认团队信息。
- Outputs: 更新的 PDF、封面/截图、三教室录屏、讲稿、表单文案、公开代码分支、源码 ZIP、总材料 ZIP、版本校验清单及公网验收。

## Allowed Files
`docs/submission/**`、`public/product-plan.pdf`、`public/demo.webm`、`output/pdf/**`、`output/playwright/TASK-027/**`、`output/submission/**`、`verification/TASK-027/**`、`README.md`、`docs/operations/RELEASE_RUNBOOK.md`、`docs/operations/AGENT_LEARNING_AND_RESUME.md`、`docs/operations/SUBMISSION_SPRINT_2026-09-15.md`、`docs/INDEX.md`、`tasks/README.md`、本 Task、`.gitignore`。

## Non-Scope / Boundaries
不新增业务功能、依赖、合同或真实数据；不改旧 Snapshot。保持用户已有 AGENTS.md、next-env.d.ts 改动。密钥、环境文件、缓存、真实个人输入不进入代码包或材料包。最终知乎账号投稿仍由队长操作，不把部署等同投稿成功。

## Acceptance Criteria
- [ ] A. 所有当前提交文档统一为 3 教室、101 的 12 条真实摘要、102/103 各 24 条合成材料；讲清下载笔记和下一教室。
- [ ] B. PDF 全页视觉检查通过；封面、截图和新录屏来自当前页面，公开 PDF/视频不再是旧版。
- [ ] C. 线上 3 教室 × 3 视口完整示例流程、下载、切题及 1 次非示例实时模型闭环通过；无未处理页面错误。
- [ ] D. typecheck、lint、66 tests、生产 build、diff check 通过；代码公开推送，源码包无敏感文件且包含可运行依赖锁、资产和启动说明。
- [ ] E. 总包包含全部提交附件与源码 ZIP；清单记录 Git、部署、SHA-256、文件大小；当前材料与生产一致。

## Verification / Recovery
检查命令沿用 TASK-026；生产浏览器复用已验收脚本并另存 TASK-027。视频检查开头、中段、结尾和时长；PDF 用 Poppler 渲染全部页面。生产失败恢复上一部署，包校验失败重建；不得把失败或待办标为通过。

## Report
`verification/TASK-027/report.md`。TASK-025 的投稿回执状态独立保留。
