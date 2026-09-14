---
id: ADR-0008
status: Accepted
date: 2026-09-15
owner: Primary Agent
supersedes: PDR-0004 precomputed-only learning boundary for real-data mode; ARCH-002 source textKind subset
---

# 真实摘要资产与受约束个人学习结果

## Evidence / Decision

官方回答 API 实测给出 15 条同题摘要，不是全文，也不是搜索结果。新增 textKind=`answer_summary`，仅 rc.2 数据可使用；旧 rc.1 Mock 继续通过。该类型固定显示“知乎回答摘要”。作者/赞同数在接口没有返回，必须以“未提供作者信息”和 null 表达，不能从模型补造。

课堂最少 8 条经过同题校验、去重且可抽取带理由观点的来源；这是本次演示的工程下限，不是统计代表性保证。来源不足时拒绝建室。以实际保留数量为分母；允许独立观点，不能凑 40 人/5 组。聚类参数在 TASK-022 实际向量/簇检查后写入 manifest，分组不表示正确性或社会共识。

SnapshotManifest 使用 rc.2，固定来源、问题/revision、时间、queryHistory、pipeline/prompt/model/embedding 版本、clustering 参数、实际 sourceCount 与 assets 的 SHA256。只新增版本，不覆盖。Sample 资产必须同时绑定 noteHash 和 replyHash，任意输入不能读取 Sample 学习结果。

学习 Port 与新 API `/api/v1/learning-turn` 分 prepare/complete；requestId、absolute deadline、AbortSignal、现有错误/成功 envelope 不变。prepare 生成同桌、理由和一次追问，返回签名 challengeToken；complete 校验 token、原笔记 hash、课堂 revision、有效期，再据真实回应生成个人笔记/我的一席/短提纲。默认 1 小时有效；HMAC-SHA256，独立 LEARNING_SESSION_SECRET，无客户端 SDK/密钥。无自由工具执行或任意多轮会话。

所有 LLM 结果在 domain Zod 中定义；服务端确认 student/evidenceId 属于当前课堂。证据展示从真实摘要或笔记原区间解析，不让 LLM 生成引文。个人总结是 AI 草稿，可供修改，不证明掌握知识。完整回答正文仍禁止。

UI 后续仍复用冻结像素布局和流程，新增 learning idle/preparing/prepared/completing/completed/error 判别状态；失败保留笔记与回应，Retry 重用有效 token；新输入/Reset/切题 abort 并丢弃旧响应。无 Candidate 仍诚实显示原因，不为学习流程伪造一席。

## Migration / Validation

TASK-021 只冻结 Schema/Port；TASK-022 接真实叙事资产，TASK-023/024 再接消费者。临时静态 Mock 类型迁移到 Domain schema-derived type 在 TASK-022 Allowed Files 补齐后执行。当前阶段不能声称用户闭环或公网已完成。
