# TASK-003 — Provider Ports and Provenance

- Status: Planned
- Owner: Server
- Estimate: 4h
- Dependencies: TASK-001 Done; consumes TASK-002 rc contracts

## Goal

建立五个最小 Port、typed errors、ExecutionContext、Snapshot/Mock adapter contract suite；不调用真实 Provider。

## Acceptance Criteria

- [ ] Port 只使用 Domain/Contract 类型，无厂商泄漏。
- [ ] timeout/abort/rate-limit/invalid output 映射为稳定错误码。
- [ ] Api meta 能区分 live/snapshot/sample/mock 与 fallback。
- [ ] 任意笔记不能命中 Sample；只有 sampleId/hash 精确匹配。
- [ ] Snapshot adapter 只读、schema parse、checksum/manifest 校验。
- [ ] CI contract suite 不消耗外部额度。

## Non-Scope

真实知乎/LLM/Embedding 凭证、业务 Prompt、UI。

