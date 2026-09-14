# 知遇·一席

一道知乎问题，一间可以带着自己观点入席的认知教室。

**[已发布版本](https://zhiyu-yixi.vercel.app)** · [产品说明计划书](docs/submission/PRODUCT_PLAN.md) · 三教室改版见 [TASK-026](verification/TASK-026/report.md) · [当前发布与材料验收](verification/TASK-027/report.md)

参赛团队：**知乎有你一席** · 队长：**杨骐瑞** · **湖北师范大学**。参赛方向：知乎黑客松 2026 校园新锐季「知识炼金场」。

## 当前参赛版本

新版公开代码：[TASK-027 参赛分支](https://github.com/yangqirui2020/Zhiyu/tree/task/TASK-027-three-classroom-submission)。公网 Demo、6 页说明书、2 分 10 秒三教室录屏与提交包按同一版本更新，详见 [提交信息](docs/submission/SUBMISSION_FIELDS.md)。

## 现在可以体验什么

当前代码开放三间可完整体验的教室：

| 教室 | 问题 | 材料 |
|---|---|---|
| 101 | 零基础想学编程，应该从哪门语言开始入门比较好？ | 12 条真实知乎回答摘要、2 个观点组 |
| 102 | 学编程，先系统学基础，还是直接做项目？ | 24 条合成材料、4 个观点组 |
| 103 | 有了 AI 编程工具，初学者还需要自己写代码吗？ | 24 条合成材料、4 个观点组 |

101 来源采集于 2026-09-15 01:41（北京时间）。102/103 明确标为「合成演示 · 非真实知乎回答」，没有真实作者或原回答链接。三间使用独立的材料、讨论、观点示例与追问，均可通过 DeepSeek 分析自己的输入。分组表达论证路径相近，组内座次不表示相似度排名、正确性或支持率。

1. 打开教室，点击像素学生或等价文字列表，核对观点、摘要证据和知乎原链接。
2. 听课代表归纳当前样本的共同点、争议和未解决问题。
3. 写下至少 50 字的观点和理由，或点击「使用示例观点」。
4. AI 比较一条主要主张的相关性、笔记支持和当前样本覆盖；只有三项满足条件才出现 Candidate Seat。
5. 基于本次观点匹配参考来源，由系统生成一次追问。写下真实回应，或明确选择参考回应。
6. 核对原观点、实际回应与 AI 整理草稿，形成《我的一席》，下载课堂笔记与三条提纲，打开知乎或进入下一间相关教室。

推荐先走示例体验，再使用自己的观点。观点与当前样本重复、跑题或依据不足时不一定出现座位，这是合法结果。101 → 102 → 103 → 101 通过上一课未解决的问题串联；切换会开始新的一课，需要保留的笔记请主动下载。

## 真实数据与模式

| 模式 | 本版本含义 |
|---|---|
| Snapshot | 知乎官方回答摘要的历史只读资产；带采集时间、版本和 SHA-256 校验 |
| Live | 当前输入实际调用 DeepSeek；原观点与回应参与本次结果生成 |
| Sample | 观点、回应及已签名追问精确命中的示例结果，页面明确标记 |
| Mock | 102/103 为目录明确开放的合成教室，示例结果也标明合成；旧开发 fixture 仍只限开发环境 |

官方接口返回 15 条回答，核验后排除 2 条偏题、1 条无法提取理由的记录，保留 12 条。数据只有回答摘要；作者、点赞量等未提供的字段不补造。离线使用 BGE-small-zh-v1.5 的 512 维向量和 Ward 层次聚类；9+3 的分组分离度较低，仅作探索结构。

Candidate 不表示「知乎没人说过」「新观点」或「知识空白」。系统不证明用户掌握、不强迫用户改变观点、不生成完整知乎回答、不自动发布。

## 技术实现

- Next.js 16 App Router、React 19、TypeScript、Zod 单一领域真相源。
- AI SDK `generateText + Output.object`，DeepSeek 官方兼容接口；运行时模型 `deepseek-v4-pro`。
- 知乎官方 REST Provider；本地 Transformers.js/BGE 向量与 ml-hclust 聚类；版本化、只读 Snapshot。
- 受约束生成：模型选择 evidenceId，服务端解析与核验真实摘要/笔记区间，拒绝未知引用、错题与旧版本。
- 判别联合 reducer；请求 ID、取消信号、25 秒服务端截止、有限重试与失败保留输入。
- HMAC-SHA256 学习 token 绑定原观点、问题、资料版本、追问和一小时有效期；complete 使用实际回应。
- Vercel Node.js 函数，运行时不落盘；生产不需要知乎采集密钥或本地向量模型文件。

这是有明确步骤和证据约束的 AI 学习工作流。当前没有自主工具循环、多 Agent、向量数据库、长期记忆或 MCP，不将像素学生包装成 Agent。

## 本机运行

要求 Node.js 24、npm。首次安装：

```powershell
npm ci
Copy-Item .env.example .env.local
```

在 `.env.local` 填写 `STRUCTURED_OUTPUT_API_KEY` 和独立随机的 `LEARNING_SESSION_SECRET`（至少 32 字符）。可用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 在本机生成后者。默认模型与官方地址已在模板中配置。

```powershell
npm run dev
```

浏览器打开 `http://localhost:3000`。只读课堂已有完整 Snapshot；没有模型凭证时仍可走精确示例，任意输入实时分析会明确返回配置错误。

重新采集需要另配 `ZHIHU_ACCESS_SECRET`。维护者先阅读 `AGENTS.md`、对应 Task 和数据决策，再执行 `npm run setup:embedding`、`npm run precompute:classroom`；脚本会创建新资产版本，不应在生产请求内执行。

## 验证与边界

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

当前 66 项自动化测试通过。三教室各自的完整示例、精确输入匹配、来源隔离、跨题 token、失败重试、下载、Reset 与切题清理已验证；三视口为 1440×900、1366×768、390×844，含键盘路径与 Reduced Motion。当前改版见 [TASK-026](verification/TASK-026/report.md)；历史真实模型验收见 [TASK-024](verification/TASK-024/report.md)，历史公网验收见 [TASK-025](verification/TASK-025/report.md)。这些是小样本功能验收，不代表大规模质量、延迟或用户效果统计。

输入发送至第三方 DeepSeek 处理。应用不将个人输入写入数据库或日志；当前浏览器会话及服务端有界短期缓存会持有必要数据，Reset 清理当前交互。不要提交个人敏感信息。AI 整理可能失真，需要核对原意和来源。

模型服务可能超时；应用保留输入并支持重试。只有精确匹配的示例才能返回 Sample。2026-09-15 Flash 生成连续超时，经用户授权和交叉验证后切换 Pro；历史资产保留各自原模型元数据。

## 项目文档

- [产品说明计划书](docs/submission/PRODUCT_PLAN.md)
- [两分钟演示脚本](docs/submission/DEMO_SCRIPT.md)
- [发布与恢复说明](docs/operations/RELEASE_RUNBOOK.md)
- [截止前交付计划与赛后 Agent 路线](docs/operations/SUBMISSION_SPRINT_2026-09-15.md)
- [开发规格入口](docs/INDEX.md)

赛后先参考 [nanobot](https://github.com/HKUDS/nanobot) 理解模型-工具循环、上下文与停止条件，再扩展只读证据检索工具、固定评测集、RAG 与可观测性。当前没有集成或运行 nanobot，不将规划写成既有成果。
