---
id: ADR-0009
status: Accepted
date: 2026-09-15
owner: Primary Agent
---

# 一题真实课堂的生成与验收

落实 PROP-0005 与 TASK-022。新增开发依赖 ml-hclust@4.0.0，预计算执行 Ward + 欧氏距离。输入为已抽取结论/理由/限定条件的 L2 向量；候选 k=2..min(5,n-1) 用标准轮廓系数比较，singleton 的轮廓值记 0；记录分数与小组原始论证，最终核验分组可解释性。分组只在当前有限样本内成立。

抽取先检验摘要是否有与问题相关、可引用的结论与理由；无法支持时排除并记录原因。不因语言观点与预期不同而排除。保留原摘要、官方 URL、抓取时间及所有接收数据的 checksum；外部 ID 使用十进制字符串，避免超出 JS 安全整数。

题目来自官方推荐并经回答 API 验证：零基础想学编程，应该从哪门语言开始入门比较好？https://www.zhihu.com/question/1997626624837951772 。内部稳定路由 q_learn_programming 保持。Sample 学习内容明确是示例草稿；直到 TASK-023/024 完成精确 Sample 回退，不对任意输入使用这些固定结果。

源映射为 answer_summary、rc.2，未返回作者名/赞同数即明确缺省。课堂总人数、观点组数由资产计算。真实模式下不加载 Mock。Default snapshot，开发者只有显式 DATA_MODE=mock 且 NODE_ENV 非 production 才能读人工 Fixture。
