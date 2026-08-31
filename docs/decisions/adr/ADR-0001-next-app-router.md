---
id: ADR-0001
status: Accepted
date: 2026-08-31
owner: Architecture
---

# Next.js App Router 单体 BFF

## Context

单人 48h 需要 UI、两个 API 边界与 Vercel 部署；完整建室管线耗时且不适合同步请求。

## Decision

采用 Next.js App Router 单体与 Route Handlers；不用 Dify、微服务或 Python 服务。完整 Classroom 由赛前脚本预计算，运行时以读取 Snapshot 和 Candidate 分析为主。Route Handler 不向部署文件系统写 Snapshot。

## Consequences

前后端共享 TypeScript/Zod；部署简单。未来若做任意题实时建室，需要异步 Job + 持久化存储，并以新 ADR supersede 本决定。

## Verification

TASK-001 build/deploy；TASK-010 Snapshot GP-001。

Reference: https://nextjs.org/docs/app/getting-started/route-handlers

