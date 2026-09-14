# TASK-021 Verification

Status: Provider / contract gate PASS；完整真实 UI 和提交尚未完成。

## Scope and evidence

- 官方手册已读：本地 Markdown + 官方 CLI 0.7.2 文档。截止 2026-09-15 10:00；线上 Demo + 产品说明计划书必交。
- 知乎 quota 真实 Code 0：回答初始 100、搜索初始 5000；用明确主题查询取得问题，未读取用户私人画像。官方 Adapter 745ms 取得 15 条同题摘要，见 zhihu-adapter-smoke.json；初次原始响应见 zhihu-answer-smoke.json。该文件是验证输入，尚不是已发布 Snapshot。
- AI SDK 7 + DeepSeek actual generateText/Output.object 成功，1440ms；模型 deepseek-flash，349 input / 94 output tokens。见 structured-output-smoke.json。SDK 告知 JSON schema 通过 system prompt 兼容模式注入；最终仍由 Zod 验证，不能声称供应商原生强约束输出。
- 固定 revision 的本地中文 BGE ONNX：512 维、CLS、L2 normalization；权重 SHA256 见 embedding-model-files.json；最终依赖修复后 smoke 837ms，同义句 0.764 / 无关句 0.425。不是召回质量基准。模型缓存与密钥均被 Git 忽略。
- Vercel 已登录，团队 qirui-era 可读；尚未创建部署或声称网址已上线。

## Contracts

ADR-0005～0008 定稿 Provider Ports、rc.2 answer_summary、SnapshotManifest、learning prepare/complete 请求及结果、签名 challenge 边界。所有新增实体与模型草稿均位于 domain Zod。原 rc.1 Mock 测试兼容。

新增模型/内容集成测试 9 项、真实合同 5 项，与旧 27 项合计 **41/41 PASS**。涵盖错题来源、错 token ID、空分页/缺游标/不前进游标、限流/鉴权、取消/过期、一次重试、危险主机、非法模型输出、向量维度/有限数/归一化、学习证据和资产关系。

typecheck PASS；lint PASS；production build PASS。npm 全依赖安装审计 0 vulnerabilities，production audit 0。新增 HF 间接依赖先出现漏洞；通过限定 override 与包管理器重新安装修复，无广泛自动升级。git diff --check PASS（仅 CRLF 提示）。

一次直接清理生成依赖目录的命令被自动执行策略拒绝，未执行；改用包管理器的卸载/重装完成修复，没有重试被拒绝的删除操作。

## Acceptance and limits

真实资料/模型/Embedding 最小请求通过；Manifest 包含实际计数/来源/查询/版本/checksum，最低 8 条可用同题来源；学习请求绑定本次笔记/追问/revision，结果只允许当前 evidenceId。最终真实资产和完整 token/消费实现分别由 TASK-022/023/024 验收。

本 Task 没有 UI 修改，三视口浏览器、全流程异常恢复、Snapshot Golden Path、人工作品验收和公网验证留在消费者及 TASK-025 发布门；不宣称这些已完成。AGENTS.md 与 next-env.d.ts 原有用户改动保留，未纳入本任务实现。
