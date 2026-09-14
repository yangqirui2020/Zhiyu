# TASK-025 — 公网发布、验收与比赛提交材料

- Status: In Progress
- Owner: Primary Agent (Codex)
- Estimate: 2h（含发布验证与材料整理）
- Freeze deadline: 见交付计划对应时间门

## Goal

形成评委可以访问和操作的版本及一致的提交材料，保存提交证据。

## Why in Golden Path

落实真实资料到个人表达的闭环；具体范围来自 PROP-0005，禁止越过依赖启动消费者。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-022 Done；TASK-023/024 的完成或明确降级结果已记录；官方提交规则、部署权限可用。
- Inputs: 选定真实数据版本、通过测试的代码、官方材料清单、部署项目。
- Outputs: 线上网址、QA 报告、README/两分钟脚本/截图与录屏素材、具体提交包和回执记录。

## Scope

- Allowed Files: `README.md`、`docs/operations/**`、`docs/submission/**`、`.env.example`、部署配置（具体路径在发布前补入 Task）、任务板、本 Task、`verification/TASK-025/**`。业务 bug 修复须先扩展 Task 到明确文件。
- Forbidden Files: 密钥、用户真实笔记、既有 Accepted Record 原地改结论、Frozen Design Token 值。
- Non-Scope: 通用自由聊天、多 Agent、长期记忆、数据库、多教室 Live、自动发布知乎回答。

## Contracts & Decisions

- 发布具体范围（2026-09-15）：`.vercelignore`、`vercel.json`、`.gitignore`（忽略 .vercel / 浏览器临时证据）、`output/pdf/**`、`output/playwright/task025-*`、`tmp/pdfs/**`、`docs/submission/**`。Vercel 项目 `zhiyu-yixi` / team `qirui-era`；以公开生产域名作为交付，运行时只配 DeepSeek 与签名密钥。用户已授权部署及 Pro 模型。依赖 TASK-022/023/024 均 Done。

PROP-0005、PDR-0004、既有 Domain/API/State 以及 TASK-021 冻结记录。新字段/依赖/目录若不在已定稿范围，先更新 Proposal/Task，不能猜测实现。

## States / Events / Guards / Effects / Recovery

初始/加载/成功/空/部分/错误/重试/Reset/第二次操作/切题/限流/断网；当前模式始终可见。

## Exact UI Copy

提交简介只描述已验证能力；区别真实 Snapshot、Live、Sample 和仍存在的预览。

## Edge Cases

评委无账号访问、模型凭证在生产缺失、死链、手机遮挡、网络失败、剪贴板权限、提交附件过大/上传失败。

## Acceptance Criteria

- [x] 公网评委视角可以打开首页和真实课堂，API/模型配置生效；不依赖开发机常驻。
- [x] 三视口 1440×900、1366×768、390×844 操作截图，等价 DOM/键盘/Reduced Motion、console/hydration、失败恢复与 Golden Path 人工 QA PASS。
- [x] 执行 typecheck/lint/unit/contract/build 与适用 E2E；真实输入、示例、错误恢复各有证据，测量基本延迟与调用次数。
- [x] README 和演示材料包含功能、真实数据说明、技术说明、运行方式、局限、项目链接；官方必交材料逐项核对。
- [ ] 用户完成需本人操作的账号/验证/声明步骤；取得提交成功回执后才标记已提交。

## Verification

- Commands: 相关 unit/contract/integration、typecheck、lint、test、build、git diff --check；有 UI 变更时执行浏览器 QA。
- Visual: 1440×900、1366×768、390×844；仅 server/合同阶段在集成发布门统一验证，阶段报告注明未完成项。
- Artifacts: `verification/TASK-025/report.md` 与脱敏验证材料。

## Do Not / Rollback / Blocker Rule

08:00 功能冻结；先确保已验证版本和录屏可用。提交失败优先查材料大小、权限和链接，保留时间缓冲，不凭保存草稿声称提交成功。 回退仅限任务范围；运行时不写部署文件系统。Recovery 仍失败时按 AGENTS.md 记录 BLOCK，不能无证据标 Done。

## Docs to Update

本 Task、任务板、相应 Contract/Decision、交付计划、运行说明与 verification report。

- 静态交付资产范围：`public/product-plan.pdf`、`public/demo.webm`、`public/demo.mp4`（若有转码）、`docs/submission/icon.png`、`docs/submission/cover.png`；公开说明书与无敏感内容的产品示例录屏属于本次比赛交付。

发布与材料验收已完成，见 verification/TASK-025/report.md；比赛回执仍待队长操作，因此不标 Done。
