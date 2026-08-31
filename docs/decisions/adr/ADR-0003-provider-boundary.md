---
id: ADR-0003
status: Accepted
date: 2026-08-31
owner: Architecture
---

# 最小 Provider Ports

## Decision

冻结 `ContentProvider`、`EmbeddingProvider`、`StructuredOutputProvider`、`ClassroomSource`、`CandidateSeatAnalyzer` 五个 Port。Provider 负责外部调用、超时重试、错误映射和 schema 校验；Pipeline 负责 Prompt 与业务语义；Domain Rule 决定 Candidate。

## Consequences

Live/Snapshot/Mock 可复用合同；UI 不感知厂商。禁止为未来供应商提前增加抽象层。

