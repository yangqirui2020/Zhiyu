# PROP-0005 — 从 Mock 课堂到真实数据与个人学习闭环

- Status: Accepted（TASK-021 合同依据 ADR-0005～0008；聚类实际参数在 TASK-022 实测记录）
- Owner: Primary Agent / 用户
- Date: 2026-09-15

## Problem

当前课堂、Candidate 与同桌学习产物依赖人工 Fixture/固定 Scenario。用户要求在 10 点前形成可交付闭环，并希望后续掌握 Agent 工程。只有填入模型 Key 无法消除下游剧本与输入不一致的问题。

## Evidence

TASK-019 明确排除了真实 Provider、Snapshot 与第三条 Learning API。loadClassroom、analyzeCandidateSeat、loadDemoNarrative 仍分别依赖 Fixture/预计算 Scenario。production build 和 27 项测试通过，但只能证明 Mock 基线。详见 TASK-020 报告。

## Impact

TASK-022 实施：新增已批准的开发依赖 `ml-hclust@4.0.0`，仅本机对归一化论证向量计算 Ward 聚类；在 2–5 个候选簇数上比较轮廓分数，并记录选择与人工质量检查，不能把簇解释为共识。真实课堂仍使用稳定内部 ID q_learn_programming，Question.externalId/url/title 改为已验证真实问题。默认 DATA_MODE=snapshot；Mock 仅显式非生产配置。页面同步摘要标签和真实人数，个人 Candidate/学习实现继续由后续任务验收。

021B 提案定稿：为免增加外部 Embedding 账号，新增开发依赖 `@huggingface/transformers@4.2.0`，只在本机预计算使用 `Xenova/bge-small-zh-v1.5` 的固定版本 ONNX q8 权重，CLS pooling + L2 normalization。官方 Hub 在本机网络超时，镜像可读；锁定 revision 与文件校验和，权重不提交 Git、不进入浏览器或 Vercel 函数。当前单题仅 15 条材料，运行时 Candidate 直接对全部已校验 Argument 进行结构化覆盖判断，避免在 Vercel 加载大模型，也避免粗筛漏掉覆盖证据。未来多题/大语料时再启用检索召回。这是对 ARCH-001 的有限单题调整，见 ADR-0006。

1. 在 TASK-021 冻结真实 Provider/Manifest 所需子集和 Learning Result 合同，保留既有 P0 Schema/可信度语义。
2. TASK-022 加入一个真实备案题的官方来源、抽取/向量/聚类、不可变 Snapshot 与真实课堂叙事。人数和簇数依据资料计算。
3. TASK-023 实现真实 Candidate Analyzer、实际执行模式和精准 Sample 回退；复核超时及幂等边界。
4. TASK-024 新增受约束的学习交互边界，承载一次追问及回应后的结构化产物。建议独立 Learning Turn API/Port，不把不同语义偷偷塞进 Candidate 字段。确切路由、请求、响应、状态及错误复用在 TASK-021 定稿后才实施。
5. 更新提交前第三方模型处理披露、Sample/Live/Snapshot 文案、来源/分母和真实学习状态；保留 Frozen 视觉和产品隐喻。
6. AI SDK/服务适配依赖与 ml-hclust 按已批准方向做兼容性 Spike，锁定版本后使用。具体新增清单在 TASK-021 记录，不做通用依赖升级。

## Alternatives (include keep current)

- 保留当前 Mock：稳定但不能实现用户的真实数据目标。
- 真实 Snapshot + 明示 Sample：最小可复现保底；不得声称自由输入全闭环，比赛资格需核实。
- 真实 Snapshot + Live Candidate/学习结果：推荐目标；外部权限、数据质量与时间允许时实现。
- 截止前换 Python/LangGraph/nanobot 全栈：增大迁移面，推迟到赛后独立实验。

## Migration Cost

021A 另加入 `server-only@0.0.1` 作为 Next.js 服务端边界编译标记，无运行时服务迁移。

预计依赖确认与合同 0.5–1h，真实资料 2h，Candidate 1.5–2h，学习闭环 1.5–2h，发布验证 1.5–2h。为顺序工程估算，部分属于同一时间块；有外部接口阻断时无法保证原时间表。具体截止门见冲刺计划。

## Recommendation

021B 兼容性实测：中文 BGE-small 输出 **512 维**（模型 config 与实际结果一致，修正 ADR-0006 的 384 维预期）。新增开发依赖带入 sharp / adm-zip 漏洞，局部 override 为已查询的 `sharp@0.35.4`、`adm-zip@0.6.1`，其余依赖不升级；安装后复验本机向量、构建与审计。参见 ADR-0007。

2026-09-15 01:06 已确认：官方 `GET /api/v1/content/question_answers` 返回回答摘要与分页；`GET /api/v1/quota` 鉴权成功，实际剩余额度为回答 100 次、搜索 5000 次。模型为已实测的 DeepSeek `deepseek-flash`。021A 新增 `ai@7.0.85`、`@ai-sdk/deepseek@3.0.44`，实现隔离的结构化输出和官方内容传输 Port；新增 Zod 传输 Schema，不改变现有产品合同/UI。具体见 ADR-0005。

执行单题垂直切片，先形成真实 Snapshot/Sample 保底，再接用户输入。用户已授权调研、后续以自己辅助推进交付；本 Proposal 不要求用户重新批准例行代码工作。未知供应商/权限与新合同语义需根据事实补齐，缺失时不猜测性冻结。

## Affected Files / Contracts / Tasks

TASK-022 的 Sample Candidate 验收改为 TASK-023 的最终发布前门：初始 Snapshot 先提供真实课堂与明确示例输入，真实 Candidate Analyzer 实现后再生成精确 Sample 结果的新资产版本，避免 TASK-022/023 依赖循环。此调整不降低最终完整 Sample Golden Path 验收。

021C 定稿范围：新增回答摘要 `answer_summary` 与 schemaVersion `1.0.0-rc.2`（兼容旧 Mock rc.1），新真实资产一律 rc.2。至少 8 条去重、可抽取观点的同题来源才建室；当前 15 条摘要包含简短推荐、招生推广等，需逐条抽取验收后再计入。SnapshotManifest 对所有资产作 SHA256，按最终实际数量披露。

动态学习独立 `POST /api/v1/learning-turn`：prepare 输入当前问题/revision/笔记，返回同桌/一次追问与服务端签名 challengeToken；complete 提交原笔记、token 和回应，返回课堂笔记、我的一席、短提纲及证据。Token 绑定 noteHash/revision/questionId/追问内容、1 小时有效期，HMAC 密钥只在服务端。输入及学习结果不落日志或共享资产；引用用当前课堂 evidenceId。状态与生成字段见 ADR-0008 及 REAL_DELIVERY_CONTRACT.md。

TASK-021～025 各自限定 Allowed Files。会涉及 domain/contract/server、预计算脚本、Snapshot、课堂消费者、配置、依赖清单、运行说明与验证资料。未来 Agent/MCP/数据库不在本次范围。确需改变既有冻结结论时新增 Decision Record 并标记 Supersedes，不原地重写 Accepted Record。

## Rollback

保留现有 Mock 分支基线。真实资产只新增版本；故障回退只允许同题 Snapshot 或精确 Sample。无法恢复时明确错误并保留用户输入，不用旧 Mock 冒充 Live。分阶段提交与记录，各阶段独立回退，不触碰用户原有未提交变更。

## Decision Owner / Deadline

实现 owner：Primary Agent。用户负责账号、规则和服务信息。计划 01:00 前完成依赖确认，01:30 权限门，03:00 数据门，05:00 分析门，06:30 学习门，08:00 功能冻结。尚未确认的上午/晚上截止按上午处理。
