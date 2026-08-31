---
id: DOC-INDEX
status: Frozen
owner: Product Architecture
version: 1.0.0
last_verified: 2026-08-31
---

# 文档索引：Repository as External Brain

## 真相源

| 主题 | 唯一入口 | 状态 |
|---|---|---|
| 总计划、范围、阶段与依赖 | `docs/IMPLEMENTATION_MASTER_PLAN.md` | Frozen / 部分待决策 |
| 产品定义、角色、P0/P1 | `docs/product/PRODUCT_SPEC.md` | Frozen |
| Golden Path、IA、交互时序 | `docs/experience/UX_SPEC.md` | Frozen |
| 视觉、Tokens、组件、Motion | `docs/design/DESIGN_SYSTEM.md` | Frozen proposal v1 |
| 系统、目录、模块边界 | `docs/architecture/SYSTEM_ARCHITECTURE.md` | Frozen |
| Provider、Live/Snapshot/Mock | `docs/architecture/PROVIDERS_AND_SNAPSHOTS.md` | Frozen |
| Domain Schema | `docs/contracts/DOMAIN_CONTRACT.md` | Freeze candidate |
| API、错误码、响应信封 | `docs/contracts/API_CONTRACT.md` | Freeze candidate |
| Classroom / Candidate 状态机 | `docs/contracts/STATE_MACHINES.md` | Freeze candidate |
| DoD、测试、Visual/Golden QA | `docs/quality/QUALITY_GATES.md` | Frozen |
| Demo、降级、Freeze、风险 | `docs/operations/DEMO_RUNBOOK.md` | Frozen |
| 架构/产品/UX 决策 | `docs/decisions/INDEX.md` | Accepted records |
| 首批任务图 | `tasks/README.md` | Planned |

## 执行链

```text
Specification
  → Contract
    → Task
      → Implementation
        → Acceptance
          → Verification
```

每一阶段的出口都是下一阶段的入口：

- Specification：P0 故事、状态和失败路径无影响实现的 TBD。
- Contract：Schema/API/Event 可被 fixture、Snapshot、Mock 与测试共同验证。
- Task：依赖、文件、状态、边界、验收、验证均可执行。
- Implementation：只在合同与任务范围内完成最小垂直结果。
- Acceptance：实现者逐条打勾并附命令、截图、限制。
- Verification：从干净环境复验，生成 PASS/FAIL/BLOCKED 报告。

## 关键状态

### 【Frozen】

- Next.js App Router 单体 + Provider boundary。
- Golden Path：进入教室 → 探索学生/簇 → 带入笔记 → Candidate Seat → 三栏证据 → 去知乎。
- 阿问采用方案 A：V1 不实现人格交互，只允许轻量“赛后见”说明；不得抢主路径注意力。
- 课代表 V1 为静态卡 + 两个预计算、带证据的示例推演，不提供自由聊天输入。
- “掌握”改为“来自你的笔记/笔记有明确表达”。
- 备案题 Snapshot 是发布阻断路径；Live Preview 是受控增强。

### 【Decision Needed】

- 知乎 API 是否能经多查询、去重、人工核验得到同题 20–30 条摘要。
- 5 道备案题、示例笔记与粗筛阈值校准结果。
- LLM、Embedding 实际 Provider、凭证和数据处理披露。
- `ml-hclust` 的归一化向量 + Ward/欧氏距离 Spike 结果与最终阈值。

### 【Deferred】

- 任意问题稳定实时建室、通用笔记找三题、自由课代表聊天、MCP、长期记忆、数据库。

### 【Won't Do V1】

- 网页抓取、同步 Route Handler 完整建室、正确性/支持率排名、完整答案代写、跨会话伪记忆。

## 模板

- `docs/templates/TASK_TEMPLATE.md`
- `docs/templates/DECISION_RECORD_TEMPLATE.md`
- `docs/templates/PROPOSAL_TEMPLATE.md`
- `docs/templates/VERIFICATION_TEMPLATE.md`

