---
id: ADR-0012
status: Accepted
date: 2026-09-15
owner: Primary Agent
supersedes: ADR-0005 Flash runtime model selection only
---

# 实时生成采用已验证的 V4 Pro

依据用户明确授权与 PROP-0006 的账户/模型交叉测试，将 STRUCTURED_OUTPUT_MODEL 设置为 deepseek-v4-pro。保留 DeepSeek 官方端点、AI SDK Provider、25 秒截止、结构化校验及全部可信度约束。两把密钥均可访问 Pro，继续使用已有主密钥，备用密钥不部署、不提交。

历史课堂与 Candidate 的生成元数据保持真实。新学习资产记录实际模型与生成时间，不能将旧 Flash 结果改名为 Pro。此项只解决观测到的实时生成超时，不保证外部服务永久可用；示例精确匹配与失败保留输入仍是必需路径。
