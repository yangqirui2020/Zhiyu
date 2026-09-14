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
| TASK-016 | Done | Primary Agent | 交互与课堂布局热修复：黑板安全区、Reduced Motion、步骤条、状态机测试与 QA |
| TASK-017 | Done | Primary Agent | 课堂构图热修复：桌组安全留白、移除无解释动线、走廊门牌顺序 |
| TASK-018 | Done | Primary Agent | 项目 README：玩法、理念、Demo 功能、诚实边界与运行方式 |
| TASK-019 | Done | Primary Agent | 后端就绪的诚实 Demo 闭环：Contract/BFF、证据、Cluster、移动端与语义动画 |
| TASK-020 | Done | Primary Agent | 截止前交付审计、基线验证与 Agent 求职路线；真实接入尚未开始 |
| TASK-021 | Done | Primary Agent | 真实知乎/模型/Embedding 通过；rc.2 资产与学习合同冻结，41 tests PASS |
| TASK-022 | Done | Primary Agent | 12 条真实回答摘要 / 2 组；资产、阅读路径、三视口验证及 44 tests PASS |
| TASK-023 | Done | Primary Agent | Live / 精确 Sample；54 tests、真实模型三组测试与浏览器失败恢复 PASS |
| TASK-024 | Done | Primary Agent | 63 tests / Pro 真实输入 / 三视口闭环与失败恢复 PASS |
| TASK-025 | In Progress | Primary Agent | 公网与材料已交付；最终提交/回执待队长操作 |
| TASK-027 | In Progress | Primary Agent | 三教室公网同步、全部材料与源码打包 |
| TASK-026 | Done | Primary Agent | 三间完整教室、真实/合成来源隔离、适配人数布局、笔记下载与跨题闭环；66 tests / 三视口 / Live 验证 PASS |

当前用户指令通过 `PROP-0002` 批准 TASK-013 在不改 Domain/API/Provider 的前提下，以显式 Mock Scenario 完成 Desktop Character Classroom 与 Candidate → Seatmate 体验验证。

当前用户指令通过 `PROP-0003` 批准 TASK-014 在保持 TASK-013 数据、状态与技术边界不变的前提下，把 Experience/Visual/Spatial 层升级为原创像素课堂、多教室入口与结构化同桌闭环。

当前用户指令（Demo V3 收束稿，2026-09-01）通过 `PDR-0004` 批准 TASK-015 在不改 Domain Schema、40 人 fixture 与技术栈的前提下，把主流程收束为完整学习闭环：课代表圆桌 → 黑板三项 → 用户表达 → Candidate Seat → 同桌追问 → 用户回应 → 课堂笔记 → 《我的一席》→ 入席 → 双出口（知乎草稿 / 下一教室 102）。

当前用户指令（2026-09-02 修复 review 问题）通过 `PROP-0004` 批准 TASK-019 吸收 TASK-002/003 中与本 Demo 垂直切片直接相关的 Contract/Provider 子集；完整 Snapshot/Live Provider Gate 仍保留在原任务，不以 Mock 冒充完成。

2026-09-15 用户要求先调研并制定 10 点前交付计划，再在用户补齐外部配置后实施。计划见 `docs/operations/SUBMISSION_SPRINT_2026-09-15.md`，范围建议见 PROP-0005；TASK-021 → 022 → 023 → 024 → 025 顺序推进，不把 TASK-002/003/004 的未完成 Gate 绕过或直接标 Done。具体 Provider/新学习合同未定稿，实施任务暂保持 Planned。
