# 知遇·一席

> 每个问题都是一间教室，让你的知识找到它该坐的位置。

《知遇·一席》把知乎同一问题下的多元论证从信息流变成一间动态认知教室：回答成为学生，相近论证形成观点簇；用户带入自己的笔记后，系统以可核验的证据判断是否存在“候选一席”，并把用户送回知乎表达，而不是替用户写答案。

当前仓库已进入 **Implementation Phase**。Vertical Slice 01 提供一间基于人工构造 Mock Fixture 的可交互观点教室，用于先验证空间体验；真实知乎 Snapshot 与 Live Pipeline 尚未接入。

## 从这里开始

1. 所有开发者与 Agent 先读 [AGENTS.md](./AGENTS.md)。
2. 再读 [文档索引](./docs/INDEX.md) 与 [Implementation Master Plan](./docs/IMPLEMENTATION_MASTER_PLAN.md)。
3. 只有拿到 `tasks/` 下信息完整、依赖已满足的任务，才能开始实现。

## 当前状态

- 【Frozen】产品核心隐喻、Golden Path、可信度边界、主技术方向。
- 【Implemented】`/classroom/q_learn_programming`：40 位学生、5 个观点簇、Hover/Click、Student Detail Sheet、证据回溯与等价文字视图。
- 【Mock】当前 Classroom 内容是人工构造的开发数据，页面显式披露，不冒充真实 Snapshot。
- 【Decision Needed】知乎 API 实测、备案题、实际 Provider 凭证与聚类阈值校准。
- 【Deferred】任意问题实时建室、课代表自由聊天、阿问长期记忆、数据库与账号系统。
- 【Won't Do V1】网页抓取、观点正确性/支持率判断、完整回答代写、静默伪装 Snapshot。

规范优先级、目录地图和首批任务见 [docs/INDEX.md](./docs/INDEX.md)。
