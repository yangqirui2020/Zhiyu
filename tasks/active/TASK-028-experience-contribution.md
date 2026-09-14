# TASK-028 — 经验入席、黑板更新与分享邀请

- Status: Done
- Owner: Primary Agent
- Estimate: 2h + 发布验收
- Freeze deadline: 2026-09-15 09:00；10:00 提交截止

## Goal / Why in Golden Path
用户带入一段经历，得到一次追问，确认贡献卡后看到黑板新增自己的材料，并主动邀请他人到同一教室。

## Dependencies / Inputs / Outputs
TASK-026/027 Done；用户明确选择推荐方向，尚无作品专属链接。输入为三教室只读数据和真实学习 API；输出为新体验、验证、生产版本与同步材料。

## Scope
- Allowed Files: src/domain/schemas/contribution.ts、src/features/contribution/**、data/contributions/**、src/features/classroom/ClassroomExperience.tsx、src/features/classroom/ClassroomContextRail.tsx、src/features/classroom/ForceGraphAdapter.tsx、src/features/classroom/ForceGraphCanvas.tsx、src/features/classroom/presentation-layout.ts、src/features/classroom/classroom.module.css、src/app/page.tsx、src/app/home.module.css、src/app/layout.tsx、src/server/pipelines/learning/generate.ts、tests/unit/contribution.test.ts、tests/integration/contribution-learning.test.ts、docs/proposals/PROP-0008-experience-contribution.md、docs/decisions/pdr/PDR-0006-experience-contribution.md、docs/contracts/CONTRIBUTION_CONTRACT.md、docs/decisions/INDEX.md、docs/INDEX.md、tasks/README.md、本 Task、verification/TASK-028/**、output/playwright/TASK-028/**、docs/submission/**、output/pdf/**、public/product-plan.pdf、public/demo.webm、output/submission/**、docs/operations/**、README.md、.gitignore。
- Forbidden: 旧 Snapshot、已有冻结决策原地改写、AGENTS.md 和 next-env.d.ts 的用户改动、依赖与锁文件、实际密钥。
- Non-Scope: OAuth、公共贡献数据库、自动发送/发布/点赞、条件重排、多 Agent。

## Contracts / States / Exact Copy
PROP-0008、PDR-0006、CONTRIBUTION_CONTRACT v1；学习 API unchanged。固定“用户自述 · 未独立核验”“示例经历 · 虚构”“仅在本次课堂展示”“邀请不包含你的经历”。状态按独立判别联合 reducer；保留原 Candidate 路径。

## Acceptance Criteria
- [x] A. 三间有各自的经历邀请与明确虚构示例；自己的经历通过实际一次追问/整理，相关或重复观点无需新颖性门槛，原 Candidate 合同不变。
- [x] B. 原事件/行动/结果/回应与 AI 草稿可核对；可编辑 summary/boundary；确认前黑板不变，确认后新材料可查看和撤回；不改变真实数据或冒充公共存储。
- [x] C. 下载贡献卡、复制邀请、保存邀请图可用；个人文本和 token 不进分享；失败有可用恢复；分享回到正确教室和经历入口。
- [x] D. 三视口、键盘、Reduced Motion、网络错误/Retry/取消/Reset/切题/晚到/第二次操作、非示例 Live 验证及原九条 GP 回归通过；typecheck/lint/test/build PASS。
- [x] E. 新版生产与 PDF/录屏/文案/代码/材料包同步并校验，保留上版恢复点；没有虚构人气或投稿回执。

## Verification / Recovery
verification/TASK-028/report.md；原 TASK-027 GP 脚本与新增贡献流程脚本。API 失败保留输入、Retry 或明确人工整理；Snapshot Golden Path 仍可用。记录不能解决的阻断，不能猜测降级。

## Docs / Rollback
更新任务、合同、发布、提交和求职文档。回退到 TASK-027 部署；不动真实快照或个人配置。

完成证据：verification/TASK-028/report.md。最终代码 f2aa5d8，生产 dpl_C2XoQB19Zfi1oj5LYdL5u4N9NxYE；81 tests、三视口新旧流程、公网 Live + 完成阶段重试、6 页 PDF、125.40 秒视频、36 项总包与 296 项源码均验证。知乎投稿与身份声明由队长完成，未冒称取得回执。
