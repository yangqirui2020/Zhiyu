# 把知遇·一席变成能讲清楚的求职项目

## 当前准确定位

一个已接入真实来源和模型、可以上线使用的 AI 学习工作流。前端的多位学生不是多个 Agent。目前最有价值的工程内容是证据约束、结构化输出、状态与错误恢复、Snapshot 交付及真实测试；这些是继续做 Agent 的基础。

## 可调整后用于简历的项目描述

**知遇·一席｜基于知乎真实讨论的 AI 学习应用**

技术：Next.js / TypeScript / Zod / AI SDK / DeepSeek / BGE / Vercel。

- 在 AI 辅助开发下完成「来源对照 → 个人观点分析 → 一次追问 → 回应整理 → 下载笔记 → 知乎表达提纲/下一教室」闭环；接入官方 API 的 12 条去重回答摘要，以本地 512 维 BGE 向量及 Ward 聚类组织观点；另有两间各 24 条合成材料的独立课堂，明确区分来源、实时执行与示例。
- 实现 Zod 共用合同、evidenceId 引用校验和保守候选规则，区分实时调用、真实历史资产与精确示例；通过签名绑定笔记、追问与资料版本，防止会话结果错配。
- 实现请求取消、25 秒截止、有限重试和输入保留；完成 66 项自动化测试、三种视口体验验收及 Vercel 发布，并通过交叉测试定位和恢复模型生成超时问题。

投递前按你能独立解释和修改的部分取舍。尚未获得赛事结果，不写获奖或入围；不写生产用户量、学习效率提升、P95 或准确率。LangGraph、MCP、多 Agent、长期记忆和向量数据库目前只能写学习计划。

## 先学会讲清楚这五件事

| 问题 | 建议阅读 | 你亲手做一次 |
|---|---|---|
| 一次请求怎样走完？ | app/api/v1/learning-turn、server/use-cases/run-learning-turn | 画出 prepare/complete 输入输出，解释每个阶段何时结束 |
| 为什么 JSON 合法还不够？ | domain/schemas/learning、server/pipelines/learning/generate | 给一段合法 JSON 放入不存在的 evidenceId，观察为什么被拒绝 |
| 怎样避免旧结果覆盖新输入？ | features/classroom/session-machine | 在现有测试里构造晚到的 requestId，解释 reducer 为什么忽略它 |
| 为什么不能给所有人用示例？ | use-cases/analyze-candidate-seat、run-learning-turn | 改一个字，看为何不能命中同一预计算结果，解释个性化因果关系 |
| 超时怎样不拖死页面？ | providers/deepseek、provider-failure | 用不会返回的 transport 验证 deadline，区分客户端取消、模型超时和格式错误 |

以上路径相对于 src/。每次只改一个已明确的 Task，先写预期，再验证，最后用自己的话解释。

## 从工作流到 Agent：三周实验

**第 1 周：手写一个最小工具循环。** 参考 nanobot 的 AgentRunner、工具注册和上下文组织。只允许 search_sources、read_evidence、compare_claim 三个只读工具，最多 5 步、总计 30 秒。真正理解模型如何决定调用工具，工具结果如何回填，什么条件停止。保留逐步 trace。

**第 2 周：做检索和质量评测。** 先建立不少于 20 个固定测试问题与人工标注，再比较全量上下文、向量召回和混合检索。衡量引用是否有效、证据是否足够、延迟和 token 成本。用同一组用例尝试 LangGraph，比较手写循环与图编排，而非为了框架而迁移。

**第 3 周：做可解释的工程交付。** 按实际需求增加 Langfuse / OpenTelemetry、故障重放、Docker 和 CI；若确需跨工具共享，再把只读检索封成 MCP。证明质量回归可复现，敏感文本不进入日志。

nanobot 阅读入口：[官方架构](https://github.com/HKUDS/nanobot/blob/main/docs/architecture.md)、[运行循环](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/runner.py)、[工具注册](https://github.com/HKUDS/nanobot/blob/main/nanobot/agent/tools/registry.py)。赛前仅作架构参考，未安装或集成。

## 三分钟面试讲述顺序

先说用户问题；再走一次真实请求；解释为什么用只读 Snapshot 和保守规则；讲一个真实失败（Flash 可鉴权但生成超时，交叉测试后切到 Pro）；最后指出当前边界和下一步评测。能解释失败与取舍，比罗列技术名词更有说服力。
