---
id: OPS-001
status: Frozen
owner: Demo Operations
version: 1.0.0
last_verified: 2026-08-31
---

# Demo Runbook、Freeze 与风险

## 两分钟主脚本

| 时间 | 场景 | 必须讲清 |
|---|---|---|
| 0:00–0:12 | 信息流痛点 | 真实讨论不是一条线 |
| 0:12–0:32 | 入场分群 | 聚的是结论+理由；独立观点可独坐 |
| 0:32–0:52 | 簇示例推演 | 明确“预计算示例”；材料内引用、材料外拒答 |
| 0:52–1:05 | 带入示例笔记 | 仍在同一教室 |
| 1:05–1:35 | Candidate + 三项证据 | 相关、来自笔记、覆盖较少；N/X 分母 |
| 1:35–1:50 | 三行提纲 + CTA | AI 不代写，把人送回知乎 |
| 1:50–2:00 | 收尾 | 每一种知识都值得找到它的一席 |

## 开演前清单

- `main` 干净构建，Snapshot manifest/checksum/links 全通过。
- GP-001、跑题、高重复、部分重叠、弱分歧、断网分支 PASS。
- 浏览器无 console/hydration error；1440 与常见 Laptop 截图已复核。
- 备案题、示例笔记、网络关闭开关、录屏、README 备份均可用。
- UI 当前模式/时间/分母清楚；绝不把 Snapshot 说成实时。

## 降级触发器

- H13：静态课代表/示例推演未完成 → 永久放弃自由聊天及相关入口。
- H19：Candidate 单题未跑通 → 只保留显式 Sample 笔记 + 对应预计算结果，路演如实说明。
- H24：Demo Freeze；新增功能全部进 Deferred。
- API 权限赛前未批 → 整体 Snapshot；不等比赛当天。

## Scope Reduction 顺序

MCP → 任意题 Live → 课代表自由聊天 → 阿问 → 装饰动画 → 动态提纲改确定性模板 → 通用 Candidate 改显式 Sample。

永不砍：可解释分群、Candidate 三项证据、来源/分母/AI 归纳披露、教室内 Seat、去知乎闭环、Snapshot GP-001。

## Freeze

| 时间 | Freeze | 之后允许 |
|---|---|---|
| H0 | Product/Golden Path/Copy | 修歧义，不改故事 |
| H2 | Schema/API/Snapshot | 只经 Freeze Exception |
| H5 | Provider/Pipeline/Cluster output | 修 blocker |
| H8 | UX/Layout/Tokens/Motion semantics | 仅视觉微调 |
| H24 | Demo | 修 Golden Path/恢复 |
| H38 | Demo data/copy | 修事实错误/死链 |
| H44 | Code | 只修 P0 blocker、录屏/README |

Freeze Exception 必含：阻断证据、最小改动、受影响 Task/Contract、回滚、owner；一次只解一个 blocker，不增功能。

## 风险登记

| 风险 | Gate / Trigger | Recovery |
|---|---|---|
| 同题样本召回不足 | H0 API 去重审计 | 人工核验备案样本；不承诺任意题建室 |
| 搜索摘要误称全文 | Schema/Copy QA | `excerpt + textKind`，统一“搜索摘要片段” |
| Structured output 不稳定 | 15–20 条 eval | 有限重试；不合格用冻结 Snapshot |
| Ward/距离不匹配 | 聚类 Spike | L2+欧氏验证或换支持 cosine 的 linkage 并 ADR |
| 引文幻觉 | evidence integrity test | 丢弃/inconclusive，不显示 |
| Candidate 过度推断 | 红队与文案测试 | “来自笔记”，不说“掌握/空白” |
| Live/Snapshot 混淆 | Mode UI/E2E | 显式 badge/time/fallback reason |
| 笔记隐私不透明 | 提交前 Copy QA | 披露第三方处理，不持久化正文 |
| Canvas 漂移/不可访问 | fixed seed + a11y | 保存坐标 + DOM 列表 |
| 首次集成超时 | H21–H24 | Sample Golden Path 优先，停止 Feature |

## 兜底话术

- Snapshot：“为了不浪费两分钟，我们使用一次真实官方搜索与预计算管线生成的数据快照；抓取时间和分母就在页面上。”
- Live Preview：“这是未校准快速预览，正式效果以备案题为准。”
- Candidate：“我们不证明全知乎没人讲过，只说明当前检索样本中的覆盖程度。”
- AI：“AI 不替用户回答；它只帮助用户看见结构、核验证据并回到知乎表达。”

## 当前 Mock Demo 操作补充（TASK-019）

1. 首屏先打开任一观点组，展示共同理由、边界、代表来源与证据编号。
2. 圆桌结束后可先提交一条 50 字以上的任意观点，演示 `no_candidate` 不误配；再点击“使用示例观点”进入 Sample Candidate。
3. Candidate 面板逐项展开相关性、笔记支持、样本覆盖，并指出笔记区间与 Mock 来源 ID。
4. 同桌追问阶段，任意回应不会放行固定学习产物；点击“使用演示答案”后继续课堂笔记与《我的一席》。
5. 入席后检查“复制提纲”反馈和“打开知乎，亲自完成回答”链接，再从 102 门牌解释下一间教室的因果。

当前 40 人数据仍是人工 Mock，不使用 Snapshot 兜底话术；真实 Snapshot/Live 演示须等 TASK-002/003/004 完整 Gate。
