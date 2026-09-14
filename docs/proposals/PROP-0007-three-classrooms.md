# PROP-0007 — 三间可进入的教室与完整学习出口

## Problem
102/103 只有预览；101 的 12 条真实摘要被放在原 40 人的大空间中，人物小、留白多，后续问题不能进入。

## Evidence
2026-09-15 用户明确要求至少三间教室、允许真实 API 与合成数据，并改进闭环和人数稀疏的 UI。页面 generateStaticParams、Snapshot loader 仅接受 q_learn_programming；门牌只打开预告。

## Impact
三间教室均可独立进入、探索、分析示例/本人观点、追问回应、保存个人笔记、打开知乎或继续下一题。101 保留真实不可变资产与真实人数；102/103 各新增 24 条不同合成论证，固定标注「合成演示 · 非真实知乎回答」。新增可执行目录合同与合成来源类型，现有 API envelope、Candidate guard、签名会话与精确匹配规则不变。Canvas 按实际人数调整构图和角色尺寸，不复制真人来源凑数。

## Alternatives (include keep current)
保持现状无法满足用户要求；三间都生成真实资产受来源召回与外部服务限制；混入合成观点后声称真实会破坏来源边界。采用真实与合成教室分别披露。

## Migration Cost
一个任务完成目录、合成资产、共用课堂加载、页面/导航、空间布局与验证。不增加依赖、不迁移目录，不原地修改 Snapshot 或 Accepted Record。增加 synthetic 来源/textKind 为 rc.2 的兼容扩展；合成课堂不能通过真实 Snapshot 校验。

## Recommendation
按用户当前明确授权执行，Decision 见 PDR-0005；学习产物提供主动下载，浏览器不自动持久化笔记。公共生产入口只开放目录列出的合成教室，不开放任意 Mock 切换。

## Affected Files / Contracts / Tasks
TASK-026 列明 Allowed Files；Domain 来源、目录与展示规范增量；无 Provider Port 或 API 路由增删。

## Rollback
回退 TASK-026 代码与新增资产，保留原 Snapshot；不触及此前用户工作。

## Decision Owner / Deadline
用户当前请求授权；Primary Agent 执行，验收后交付。
