# TASK-002 — Freeze Domain / API / State Contracts

- Status: Planned
- Owner: Domain
- Estimate: 5h
- Dependencies: TASK-001 Done

## Goal

把三个 rc Contract 变成可执行、Frozen 的 Zod schemas、关系完整性校验、fixtures 与状态表测试。

## Outputs

- `src/domain/schemas/*`、`src/contracts/*`、`src/features/*/*-machine.ts`
- valid/invalid fixtures、cross-reference validator、contract/state tests
- CONTRACT-DOMAIN/API/STATE 从 rc.1 → 1.0.0 Frozen

## Acceptance Criteria

- [ ] 所有实体与 Envelope 可 infer 类型，无 any。
- [ ] source/note evidence 可回溯；坏区间/假子串拒绝。
- [ ] student/argument/cluster/source 关系、去重与 sourceCount 校验。
- [ ] Candidate guard 对 uncertain 保守。
- [ ] 状态测试覆盖 stale/retry/reset/second submit/switch question/reduced motion。
- [ ] 决定 schemaVersion、最低 source 数、ID 正则并写 Decision/Policy。

## Non-Scope

Provider、真实 API、聚类实现、UI。

