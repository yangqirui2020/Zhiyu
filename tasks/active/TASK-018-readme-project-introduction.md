# TASK-018 — Project README Introduction

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 1h
- Freeze deadline: Current iteration

## Goal

将当前项目的玩法、理念、Demo 功能、诚实边界与运行方式整理为仓库根目录正式 README。

## Why in Golden Path

首次访问仓库的人需要先理解产品怎么玩、为什么这样设计，以及当前 Demo 能做什么和不能做什么，才能正确运行与评价项目。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-017 Done。
- Inputs: 用户确认的项目介绍文案、当前 Demo V3 实现与运行命令。
- Outputs: 新版根目录 `README.md`。

## Scope

- Allowed Files: `README.md`、`tasks/README.md`、本 Task。
- Forbidden Files: 业务代码、合同、依赖、fixture、验证资产。
- Non-Scope: 功能改动、部署、页面文案同步、英文版 README。

## Contracts & Decisions

README 遵守 Product Spec 的角色边界、Candidate Seat 可信度措辞与 Mock 披露，不引入新产品承诺。

## States / Events / Guards / Effects / Recovery

不涉及运行时状态。

## Exact UI Copy

不修改 UI；README 使用用户确认的项目介绍。

## Edge Cases

- 不把 Mock 表述成真实知乎数据或实时 AI。
- 不把 Candidate Seat 表述成知识空白、新颖度或正确性证明。
- 运行命令与当前 `package.json`、路由一致。

## Acceptance Criteria

- [x] README 首段先介绍玩法和完整学习闭环。
- [x] README 说明五项核心理念和 Candidate 可信度边界。
- [x] README 列出当前 Demo 功能及尚未实现范围。
- [x] README 提供可复制的安装、启动与访问命令。
- [x] README 保留开发协议和文档入口。
- [x] Markdown 与链接检查通过。

## Verification

- `git diff --check`
- 检查相对链接目标存在。
- 检查运行命令与 `package.json` 一致。

## Do Not / Rollback / Blocker Rule

不得以介绍文案扩大实际能力。回退本 Task 的 README 提交即可恢复旧版。

## Docs to Update

`README.md`、`tasks/README.md`、本 Task。
