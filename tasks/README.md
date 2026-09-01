# Task Board

只有 `Ready` 且依赖已 Done 的任务可开工。2–5h、单一可演示结果、一个核心合同 owner；超 6h 拆分。

## Dependency Graph

```text
001 Repo/Next/CI
 ├─ 002 Domain schemas + fixtures
 └─ 003 Provider + provenance
002 + 003 → 004 一题 Search→Argument 验证门
004 → 005 Embedding→Cluster→Snapshot
002 + 005 → 006 Classroom Stage
006 → 007 Student/Cluster Inspector
002 + 003 → 008 Note→Claims
005 + 008 → 009 Candidate Seat + Evidence
006 + 007 + 009 → 010 Snapshot Golden Path
010 → 011 Seat Motion + Outline + Zhihu CTA
011 → 012 Reliability + Visual/Golden/Red-team QA
```

002/003 可并行；006 UI shell 可基于冻结 fixture 与 005 并行；007/008 可并行。009/010 是收敛点，禁止并行修改共享状态机。

| Task | Status | Owner | Gate |
|---|---|---|---|
| TASK-001 | Done | Repository | 可构建工程骨架与远端 baseline |
| TASK-002 | Planned | Domain | Schema/API/State Freeze |
| TASK-003 | Planned | Server | Provider/provenance Freeze |
| TASK-004 | Planned | Data | H0–2 API/Argument 生死门 |
| TASK-005 | Deferred | Data | 真实 Embedding / Cluster / Snapshot，待 API 资产验证 |
| TASK-006 | Done | Primary Agent | Vertical Slice 01：Mock Fixture Classroom |
| TASK-007…012 | Planned | TBD | TASK-006 评估后再进入后续功能 |
| TASK-013 | Done | Primary Agent | Demo V2 Desktop Classroom + Mock Seatmate Golden Path |
| TASK-014 | Done | Primary Agent | Pixel Classroom World + Structured Seatmate refinement |
| TASK-015 | Verification | Primary Agent | Demo V3 Learning Loop：圆桌 → 黑板三项 → 追问 → 课堂笔记 → 我的一席 → 入席 → 双出口 |

当前用户指令通过 `PROP-0002` 批准 TASK-013 在不改 Domain/API/Provider 的前提下，以显式 Mock Scenario 完成 Desktop Character Classroom 与 Candidate → Seatmate 体验验证。

当前用户指令通过 `PROP-0003` 批准 TASK-014 在保持 TASK-013 数据、状态与技术边界不变的前提下，把 Experience/Visual/Spatial 层升级为原创像素课堂、多教室入口与结构化同桌闭环。

当前用户指令（Demo V3 收束稿，2026-09-01）通过 `PDR-0004` 批准 TASK-015 在不改 Domain Schema、40 人 fixture 与技术栈的前提下，把主流程收束为完整学习闭环：课代表圆桌 → 黑板三项 → 用户表达 → Candidate Seat → 同桌追问 → 用户回应 → 课堂笔记 → 《我的一席》→ 入席 → 双出口（知乎草稿 / 下一教室 102）。
