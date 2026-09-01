# 知遇·一席

> 每个问题都是一间教室，让你的知识找到它该坐的位置。

《知遇·一席》把知乎同一问题下的多元论证从信息流变成一间动态认知教室：回答成为学生，相近论证形成观点簇；用户带入自己的笔记后，系统以可核验的证据判断是否存在“候选一席”，并把用户送回知乎表达，而不是替用户写答案。

当前仓库已进入 **Demo V3 Learning Loop**。预设教室继续使用人工构造 Mock Fixture：Desktop-first 像素课堂、5 组课代表一轮结构化圆桌、黑板三项（共识/争议/未解决）、「听完他们，你现在怎么看？」表达入口、Candidate Seat 位置解释、同桌一次有效追问、四段渐进生长课堂笔记（含 Before→After 认知 Diff）、《我的一席》沉淀、「留下我的这一席」入席（40→41），以及双出口——去知乎写下这一席（Mock 提纲）/ 去下一间教室 102（由本班未解决问题生长）。真实知乎 Snapshot、Candidate API、额外教室数据与 Live Pipeline 尚未接入。

## 从这里开始

1. 所有开发者与 Agent 先读 [AGENTS.md](./AGENTS.md)。
2. 再读 [文档索引](./docs/INDEX.md) 与 [Implementation Master Plan](./docs/IMPLEMENTATION_MASTER_PLAN.md)。
3. 只有拿到 `tasks/` 下信息完整、依赖已满足的任务，才能开始实现。

## 当前状态

- 【Frozen】产品核心隐喻、Golden Path、可信度边界、主技术方向。
- 【Implemented】`/classroom/q_learn_programming`：像素教室主舞台 + 随相位转换职责的单一上下文栏、40 个可组合 Canvas Student Character、5 个学习桌组、动态黑板（问题 + 圆桌后写入三项结论）、101–103 走廊入口、Student Detail Sheet、证据回溯与等价文字视图。
- 【Mock Prototype】示例观点可稳定完成完整学习闭环：课代表圆桌 → 黑板三项 → 表达 → Candidate Seat → 同桌追问 → 回应 → 课堂笔记（认知 Diff）→ 《我的一席》→ 入席 → 双出口；任意输入不会套用预计算结果。
- 【Mock】当前 Classroom 内容是人工构造的开发数据，页面显式披露，不冒充真实 Snapshot。
- 【Decision Needed】知乎 API 实测、备案题、实际 Provider 凭证与聚类阈值校准。
- 【Deferred】任意问题实时建室、课代表自由聊天、阿问长期记忆、数据库与账号系统。
- 【Won't Do V1】网页抓取、观点正确性/支持率判断、完整回答代写、静默伪装 Snapshot。

规范优先级、目录地图和首批任务见 [docs/INDEX.md](./docs/INDEX.md)。
