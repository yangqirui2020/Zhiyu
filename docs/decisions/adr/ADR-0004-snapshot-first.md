---
id: ADR-0004
status: Accepted
date: 2026-08-31
owner: Architecture
---

# Snapshot-first Demo 与 provenance

## Decision

备案题完整 Snapshot Golden Path 是发布阻断路径；Live Preview 是显式增强。Snapshot 不可变、带 manifest/checksum/time/source/schema/pipeline/model 版本。Classroom 可回退同题 Snapshot；任意笔记 Candidate 不得伪回退，只有精确 Sample 命中可用预计算结果。

## Consequences

Demo 稳定且诚实；需要维护预计算资产与校验。Mock 永不冒充 Snapshot。

