# 《知遇·一席》Demo 开发计划（技术选型 + 48h 实施）

> 状态：**待你确认**。确认后进入第一版 Demo 开发。
> 前置故事方案：同目录《知遇·一席》打磨版.md（P0 范围、降级触发器、Demo 脚本以那份为准，本计划只解决"用什么技术、怎么做"）

---

## 一、知乎 API 权限确认结果（2026-08-30 调研）

### 1.1 可用接口总表

| 接口 | 方式 | 关键字段 | 额度（邀测期） | 状态 |
|---|---|---|---|---|
| 知乎搜索 `GET /api/v1/content/zhihu_search` | REST + MCP(SSE) | Title/ContentID/**ContentText**/Url/VoteUpCount/CommentCount/AuthorName/AuthorBadge/AuthorityLevel(L1-L5)/CommentInfoList；Query 必填，Count≤10 | 5000 次/日（冲突口径：实名 1000 次/日） | ✓ |
| 全网搜索 `global_search` | REST + MCP | 标题/摘要/链接/作者，Count≤20 | 同上 | ✓ |
| 热榜 `GET /api/v1/content/hot_list` | REST + MCP | 标题/链接/摘要，Limit≤30 | 100 次/日 | ✓ |
| 知乎直答 `POST /v1/chat/completions` | OpenAI 风格 + MCP(Streamable HTTP) | 三档模型 zhida-fast-1p5 / zhida-thinking-1p5 / zhida-agent；流式 SSE；可溯源 | 100 次/日 | ✓ |
| 用户数据（本人） | REST/CLI | 仅标题+摘要 | — | ✓ 但本项目不依赖 |
| PDF/PPT 生成 | REST | 细节未公开 | — | 本项目不用 |
| **问题详情/按问题拉全部回答** | — | — | — | **✗ 官方不存在** |

### 1.2 关键发现（影响数据设计，必须知道）

1. **拿不到回答全文**：官方教程明确 `ContentText` 是**检索摘要**，不是完整原文；官方也没有"按问题 ID 拉回答列表"的端点（只有第三方接口有）。
2. **对《知遇·一席》的对策（已计入设计）**：
   - 聚类与 Argument 抽取**基于摘要级文本**——BGE-M3 对 100-300 字摘要做 embedding 聚类完全够用；Argument JSON 相应瘦身（结论+理由为主，依据/适用条件有则抽、无则空）；
   - 课代表卡的"代表回答"= 摘要 + 原文链接（用户可跳知乎看全文）；
   - 空位证据卡的"既有论点引用"= 摘要原句，可点验；
   - **不做 URL 页面抓取**（合规与反爬风险，黑客松评审可能问数据来源合法性）；
   - **待官方核实**：参赛群/邮件询问黑客松是否开放全文接口——若开放，数据管线无缝升级（摘要换全文即可，schema 不变）。
3. **额度结论**：搜索 5000 次/日主口径下 48h 开发+演示绰绰有余；直答/热榜各 100 次/日需省用（本项目直答仅用于笔记判定的精判层和提纲，预算 ≤30 次）。同账号多 Secret 共享额度池，页面测试也扣额度。

### 1.3 你需要立即做的事（申请清单，按优先级）

| 优先级 | 事项 | 怎么做 | 周期 |
|---|---|---|---|
| **今天** | 注册 developer.zhihu.com，个人中心申请 Access Secret + 完成知乎实名认证（实名决定额度档位） | 自助，即申即用 | 即时 |
| **今天** | 邮件 openplatform@zhihu.com：说明黑客松参赛场景+预估调用量，问三件事——①是否有回答全文接口 ②队伍提额通道 ③学生邀测权限 | 官网 FAQ 承诺 1 个工作日回复 | 1 天 |
| **9/13 前** | 报名页完成组队填报（含队员知乎 token），等官方拉技术群开通 API 提额（参照上一季流程） | 报名页操作 | 赛前 1-2 天开通 |
| **H0** | 实测一次 zhihu_search：确认 ContentText 实际长度、额度页真实数字 | 开发首日验证门 | 2h 内 |

---

## 二、技术路线结论

**Next.js 全栈 + Vercel AI SDK，不用 Dify。**

理由：①1 人 48h，Dify 自部署（docker 7+ 服务）+双端联调开销大于收益；②Vercel AI SDK（~26k star）是 AI Agent 应用最主流的 TS 栈，`generateObject(zod)` 结构化输出、MCP client、流式全现成；③聚类、空位判断、三档判定本来就要自写——写在 Next.js Route Handler 里就是**防套壳证据**，写进 Dify 代码节点反而被平台壳稀释。

**与主流技术栈的贴合**：Next.js + Vercel AI SDK + Tailwind + shadcn/ui + MCP + zod 结构化输出 + BGE embedding，这套组合就是 2026 年 AI Agent 应用的默认答案。

---

## 三、组件选型总表

| 组件 | 首选 | 备选 | 理由 |
|---|---|---|---|
| 全栈框架 | **Next.js (App Router)** | — | 前端+API Route 一体，Vercel 一键部署出"可运行链接"（必交项） |
| LLM SDK | **Vercel AI SDK**（vercel/ai ~26k）`generateObject+zod` | OpenAI 兼容 json_schema 裸调 | 类型安全+自动校验重试，2026 主流做法 |
| 教室可视化 | **react-force-graph**（vasturiano ~2.3k）`d3Force()` 注入簇心力 + `nodeCanvasObject` 自绘 | AntV G6（ComboForce 布局）/ 裸 d3-force | React 组件化、onNodeClick 原生、Canvas 渲 40 节点无压力 |
| 中文 Embedding | **SiliconFlow 托管 BGE-M3**（OpenAI 兼容、免费额度、国内直连） | 智谱 embedding-3（注册送 2000 万 token） | 48h 场景免费+免折腾优先，中文第一梯队 |
| 层次聚类 | **ml-hclust**（mljs 官方族，AGNES/ward） | Python sklearn 微服务 | 20-30 条向量 O(n²) 小事，Node 内十行搞定；不起 Python 服务 |
| 知乎数据接入 | **REST 直连**（Bearer + X-Request-Timestamp） | AI SDK MCP client（experimental） | 取数 pipeline 用 REST 更可控；MCP 留作加分项，H0 验证后决定 |
| LLM | **DeepSeek**（JSON mode 稳、批量小任务性价比最高） | GLM-5.1 / Kimi（若赛事发 token，OpenAI 兼容改两行切换） | 抽取+标签是批量小任务；架构保持 OpenAI 兼容随时换 |
| UI | **Tailwind + shadcn/ui** | — | 主流；教室本体是自定义 Canvas，模板帮不上，不 fork ai-chatbot |
| 数据 | **静态 JSON 落盘**（预拉取摘要+预计算结果） | SQLite | Demo 期完全离线可跑，快照即兜底 |
| 部署 | **Vercel** | — | 无状态 pipeline，免费档够出可运行链接 |

### 可二开参考项目（不整体 fork，抄思路）

1. **AIObjectives/talk-to-the-city-reports**：LLM 抽论点→embedding 聚类→簇标签→交互散点报告，理念与我们完全一致。**精读其 pipeline 的 prompt 与聚类代码抄思路**（二开工作量：中，只抄不 fork）。
2. **yizhang96/social-media-comment-map**：评论→embedding→聚类→Next.js 点击看原文，web/ 目录散点交互可参考（中）。
3. **a16z-infra/ai-town**（~9k）：多小人场景渲染氛围感标杆，**只抄 PixiJS 视觉技巧**（fork 工作量：大，不 fork）。

---

## 四、架构与数据流

```text
【赛前预计算管线：Node 脚本，产出静态 JSON】
知乎 REST API（zhihu_search ×N 次查询）
  → 20-30 篇回答摘要落盘 raw.json（注明抓取时间）
  → LLM generateObject 抽 Argument JSON（结论+理由+依据?+适用条件?）   ← prompt 自写
  → BGE-M3 embedding（结论+理由向量）                                    ← API 现成
  → ml-hclust 聚类 2-5 簇 + 簇心坐标 + 保守渲染标记                      ← 自写（壁垒①）
  → LLM 生成中性簇标签（带"AI 归纳"水印）                                ← prompt 自写
  → classroom.json（学生/簇/课代表卡/来源链接 全量静态数据）

【Demo 运行时：Next.js】
首页（两个入口 + 阿问立绘占位"赛后见"）
  → 教室页：react-force-graph 读 classroom.json
      d3Force 注入簇心力 → 学生聚拢动画（Wow 1）
      点击学生 → Argument 详情卡；点击簇 → 课代表静态卡+拒答展示（Wow 2）
  → 笔记匹配：粘贴笔记 → Route Handler
      LLM 抽 3-5 条 Claim（generateObject）
      粗筛：BGE 余弦相似度 vs 各簇论点（赛前校准阈值 τ）                 ← 自写（壁垒②）
      精判：LLM 逐条答"已表达/部分重叠/未覆盖"并引用摘要原句            ← 自写（壁垒③）
      → 空桌亮起 + 三栏证据卡（相关/掌握/覆盖较少+分母披露）（Wow 3）
  → 闭环：「去知乎写下这一席」deep link + 三行提纲（generateObject）
```

**自写 vs 现成（防套壳声明）**：现成 = Next.js/AI SDK/react-force-graph/BGE/hclust/shadcn（全部是"零件"）；自写 = Argument prompt 体系、聚类管线与簇心力配置、双层空位判定（粗筛校准+精判三档）、证据卡数据结构。评委问"你们自己写了什么"，答这三层。

---

## 五、48h 开发计划（与打磨版排期对齐，落到技术任务）

### 赛前（9/12 晚前必须完成）

| 事项 | 产出 |
|---|---|
| Access Secret 申请+实名+邮件（见 1.3） | token 在手 |
| `create-next-app` + Tailwind + shadcn + ai sdk + react-force-graph + ml-hclust 脚手架搭好，Vercel 部署跑通"Hello" | 空壳上线 |
| 实测 zhihu_search：ContentText 长度/字段/额度（**API 验证门**） | 验证记录 |
| 5 道备案题数据预拉（含多观点题 2、弱分歧题 1、知识型题 2），raw.json 落盘 | 数据资产 |
| 备案笔记 2-3 份（含 1 跑题、1 高度重复） | 语料 |
| react-force-graph 原型：20 节点注入簇心力+聚拢动画+点击卡（**可视化验证门**，不行降级裸 d3-force/G6） | 原型录屏 |
| 空位粗筛阈值 τ 用备案题人工校准并记录 | 校准记录 |

### 比赛中（44h + 4h 缓冲）

| 时段 | 任务 | 技术要点 |
|---|---|---|
| H0-2 | **生死验证**：预计算管线跑通一道题（search→raw→generateObject 抽 Argument，肉眼查 15-20 条）。抽取不稳修 Prompt 上限 1h，超时切备案快照 | generateObject zod schema 定稿 |
| H2-5 | 聚类管线：embedding→ml-hclust→簇心坐标→簇标签；3 道题人工判"能不能解释为什么坐一起" | 簇数自适应（距离阈值）+保守渲染标记 |
| H5-8 | 教室页 v1：读 classroom.json 渲染+聚拢动画+学生详情卡。**H8 必须出第一个 Wow，没有就停后端修视觉** | react-force-graph 力配置 |
| H8-10 | 吃饭+调整 | — |
| H10-13 | 课代表静态卡：共同理由+代表回答摘要+来源+一条"本组未覆盖"拒答展示。**【触发器①】H13 末未完成→永久放弃聊天** | shadcn Card+Sheet |
| H13-16 | 笔记→Claim 抽取（generateObject，3-5 条）+预置教室映射 | zod schema |
| H16-21 | **Candidate Seat（5h）**：粗筛（BGE 余弦 vs τ）+精判（LLM 三档带引用）+三栏证据卡数据结构 | 最难模块双倍预算 |
| H21-24 | 首次端到端联调（3h 预算）。**H24 要求：已经可以比赛，哪怕很丑** | — |
| H24-30 | 睡 6h | 不通宵 |
| H30-33 | 空座位视觉（知识卡飞入+空桌亮起+证据卡展开）+闭环按钮（deep link+提纲） | nodeCanvasObject 自绘+时序 |
| H33-35 | （方案 B 才做）阿问真 session 版，限 1h；否则并入 UI 打磨 | 台词只许引用真实输入 |
| H35-38 | UI 打磨+可靠性文案（来源/分母披露/"AI 归纳"水印/"聚类≠正确性"/快照时间戳） | — |
| H38-41 | 红队自测（打磨版第九节清单） | — |
| H41-44 | 锁定 Demo A/B/C 三条路径+彩排掐表 | — |
| H44 | **Code Freeze** | — |
| H44-47 | 录屏+README+备份快照 | — |
| H47 | 提交，留 1h 意外 | — |

**【触发器②】H19 空位判断单题未跑通→切"预置笔记+预置空位"保底，证据卡照常展示，路演如实声明。**

---

## 六、H0-2 验证门清单（不过就降级，不硬撑）

1. **API 验证**：zhihu_search 返回字段与 ContentText 长度是否符合预期；额度页真实数字。
2. **抽取验证**：generateObject 对摘要抽 Argument 的稳定率（15-20 条肉眼抽检）。
3. **聚类验证**：备案题 embedding→聚类结果"人能不能解释"；不能解释先调（结论+理由）拼接权重，再不行加"LLM 二次归并"兜底。
4. **可视化验证**：react-force-graph 簇心力+入场动画原型；不行降级裸 d3-force 或 G6。
5. **MCP 验证（可选加分项）**：AI SDK MCP client 挂知乎官方 MCP 是否通；不通果断 REST（功能等价）。

---

## 七、待确认事项（需要你决策/行动）

1. **本计划整体是否 OK？**（技术路线 Next.js 全栈 vs Dify，我强烈推荐前者）
2. **今天请执行申请清单 1.3 的前两条**（Access Secret+实名；邮件问全文接口/提额/学生权限）——全文接口的答复会决定数据管线是否需要预留升级位。
3. **阿问选方案 A（立绘占位，推荐）还是方案 B（1h 真 session 版）？**
4. **LLM 用 DeepSeek 自费（几十元内）还是等赛事 token？** 建议架构保持 OpenAI 兼容，两者随时切。
5. 备案题选哪 5 道？我建议覆盖：编程学习类（C vs Python，已有故事）、AI 技术类（Transformer 位置编码）、弱分歧知识题 1 道、以及你专业相关 1-2 道（你来讲痛点更真）。
