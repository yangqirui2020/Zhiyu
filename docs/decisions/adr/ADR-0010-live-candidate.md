---
id: ADR-0010
status: Accepted
date: 2026-09-15
owner: Primary Agent
supersedes: PDR-0004 blackboard consensus label for real-data mode only
---

# 受证据约束的真实个人分析

当前每次选择一个主要主张，向用户披露范围。笔记由服务端划分为带 UTF-16 start/end 的片段，模型只返回这些 note evidenceId 和真实课堂 source evidenceId。模型不负责生成引用文字；服务器拒绝越界 ID、错类型引用、错 revision，并用既有三个维度判定：related && supported && limited。uncertain → partial / inconclusive，不生成 Seat。covered/partial 或 unrelated → no_candidate。

每次整体 deadline 25 秒，模型输出最多 3600 tokens；仍由原 StructuredOutputProvider 限制调用。比较全部当前 12 条论证；不把未检索内容说成无覆盖。服务端生成稳定 hash ID、固定限制说明，输出最多一个候选与简短提纲，不产生完整知乎回答。

Sample asset 包含 noteHash、Sample ID、精确 AnalysisResult，绑定当前 revision；错 hash 不回退。客户端的 sampleId 不决定实际模式。自然输入真实失败，仅精确同 hash 可以回退，并带 fallbackFrom/live 与原因；其他输入保留后 Retry。实例内去重 key 绑定请求 body hash，有界短期缓存；相同 key 不同 body 拒绝，失败不缓存，不能保证跨实例 exactly-once。

API envelope/AnalysisResult/CandidateSeatAnalyzer Port 保持。use case 附带内部 execution meta 给 Route；客户端将服务端 mode/fallback 信息保存到当前请求状态并展示。来源仍是 Snapshot，个人分析单独披露 Live 或 Sample。

真实模式把黑板“全班共识”标为“样本共同点”。当前分组 silhouette 低、成员立场有差异；这一措辞与现有可信度约束一致，布局/数据字段名不变。

实现细则：coverage 围绕核心方法/条件比较；仅主题一致不算核心方法覆盖，已有方法细节扩写仍属 partial/covered。Sample 除规范化 hash 外再校验原文本完全一致，避免空白/Unicode 规范化改变引用区间。Snapshot 文件固定 LF，保证 Git 跨平台签出后 SHA256 字节不变。
