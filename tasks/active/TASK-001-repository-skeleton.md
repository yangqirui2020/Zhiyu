# TASK-001 — Repository / Next.js / Quality Skeleton

- Status: Done
- Owner: Repository
- Estimate: 3h
- Freeze deadline: 业务开发前

## Goal

从空仓库得到一个可安装、可 typecheck/lint/test/build 的 Next.js App Router 骨架，规范入口可发现，且没有业务功能扩张。

## Why in Golden Path

所有后续合同、Snapshot 和页面需要统一编译与验证环境。

## Dependencies / Outputs

- Inputs: 四份现有方案文档、Accepted ADR/PDR/UXDR。
- Outputs: package/lock、App Router 占位页、CSS Tokens、Zod contract skeleton、Node 24 原生测试配置、Git remote。

## Scope

- Allowed: root config、`src/app` 占位、`src/domain`、`tests/contract`、docs/tasks。
- Forbidden: 真实 Provider 调用、Classroom Canvas、Candidate 业务 UI、Secret。

## Contracts & Decisions

ADR-0001、ADR-0002；Design-001；AGENTS.md。

## Acceptance Criteria

- [x] `npm install` 产生 lock，依赖为 exact version。
- [x] `npm run typecheck`、`npm run lint`、`npm test`、`npm run build` 全通过。
- [x] 首页只说明 spec-first 状态并链接仓库文档，不伪装成产品完成页。
- [x] CSS variables 映射冻结 Design Tokens。
- [x] `.env*` 被忽略且 `.env.example` 无值。
- [x] Git 初始化并关联 `yangqirui2020/Zhiyu`，保留远端历史并完成 baseline push。

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git status --short --branch && git remote -v`

## Do Not

不接 API、不添加 shadcn 生成组件、不制作 Demo 视觉。仅在本轮用户明确授权后完成 baseline push。
