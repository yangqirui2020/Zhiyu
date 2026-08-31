---
id: ADR-0002
status: Accepted
date: 2026-08-31
owner: Architecture
---

# Zod 是运行时合同，AI SDK 被隔离

## Context

UI、API、LLM、Snapshot、Mock、测试字段漂移会让多 Agent 开发失控；原计划引用的 `generateObject` 是旧接口路径。

## Decision

所有核心对象以 Zod schema 为运行时真相，TypeScript 类型由 schema infer。LLM Draft 与最终 Domain Entity 分离。当前 Adapter 使用 AI SDK 7 的 `generateText + Output.object`；业务只依赖 `StructuredOutputProvider`，不冻结厂商函数。

## Consequences

SDK 迁移局限于 Adapter；所有外部数据必须 parse。增加少量合同测试成本，换取跨模块稳定。

Reference: https://ai-sdk.dev/docs/reference/ai-sdk-core/output

