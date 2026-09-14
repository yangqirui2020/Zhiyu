---
id: ADR-0011
status: Accepted
date: 2026-09-15
owner: Primary Agent
supersedes: PDR-0004 fixed personal Scenario and cognitive-change copy in real-data mode; REAL_DELIVERY_CONTRACT token-error recovery
---

# 真实学习结果与可恢复会话

实施用户已授权的真实闭环（PROP-0005），不新增依赖，不改变 rc.2 Learning API/Port。prepare/complete 各有 25 秒截止，Token 为 HMAC-SHA256（独立服务端密钥），包含 noteHash/question/revision/追问与一小时期限，校验签名后才解码使用。不得信任客户端自填的同桌或追问。

Session.learning 为判别联合：idle、preparing(requestId)、prepared(result/meta)、completing(requestId,prepared,submittedAnswer)、completed(prepared,result/meta)、error(stage,message,prepared? )。只能从 Candidate 准备同桌，成功后进入 seatmate；challenge 提交真实回应，成功后进入 responded。错误保留输入、Retry；pending 禁止编辑/重复推进；Reset/卸载取消请求并清空状态，过时 response 不推进。显式开发 Mock 仍沿旧示例守卫。

尚未 prepare 时不称某个固定学生已经是你的同桌；保留既有 Candidate 坐标，连线/聚焦只在实际匹配结果返回后出现。运行后期始终使用本次 prepared/completed 数据，不能套固定 Scenario。

结果显示为 AI 整理草稿；原始观点与回应可核对。“认知变化”改为“观点与回应记录”，不要求改变态度。before 使用原输入的限长原文，changed 使用实际回应的限长原文；after/我的一席/短提纲是模型整理，需用户确认。高亮只允许同时出现在实际回应和 after、且不在原观点里的字串；不能表示学习成效或掌握。追问是系统基于来源观点生成的问题，不冒充真实答主。

Sample 资产包含 noteText/noteHash/answerText/replyHash/question/completion，校验当前课堂 evidence/student；complete 必须同时匹配笔记、回应和已签名追问。只为精确命中输出 Sample 模式，其他输入走 Live；Live 错误保留输入，不使用不匹配的 Sample。新增不可变版本，可重绑定完全相同课堂内容的旧 Candidate Sample revision，记录派生关系与原模型时间，不能改分析结论。

保持布局和 Design Tokens。原始观点/回应只在请求/实例短期缓存与当前浏览器内存里处理，不写应用日志、数据库或 Snapshot；只有明确 Sample/人工 QA 可以存为资产。服务器返回 no-store。公开材料明确第三方 DeepSeek 处理和本机历史来源，产品不宣传多轮自主 Agent 或全站检索能力。

格式/引用校验失败时，在原 25 秒 deadline 内最多重试生成一次，增加通用校验反馈，不延长请求时间；鉴权、限流、外部超时不执行此语义重试。source evidenceId 去重，高亮取实际回应与草稿的交集，不能补造引用。

请求 body 保持原合同 48 KiB。失效或错配 token 沿用 INVALID_INPUT，但 recovery 改为 none，中文说明重新开始；同一过期 token 直接 Retry 不可能恢复，UI 保留当前输入直到用户主动 Reset。提纲的运行时生成策略收紧为正好三条、每条最多 100 字，仍是原 domain 3–5 条/300 字的合法子集。
