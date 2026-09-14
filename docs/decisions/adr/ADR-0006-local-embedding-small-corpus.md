---
id: ADR-0006
status: Accepted
date: 2026-09-15
owner: Primary Agent, within user-authorized delivery scope
supersedes: ARCH-001 Candidate coarse-filter requirement for this single-question release only
---

# 本机向量预计算与单题完整覆盖比较

## Problem / Evidence

用户只提供 DeepSeek 文本模型。真实知乎首题返回 15 条同题摘要；无需大型在线检索。Vercel 应继续读取不可变 Snapshot，运行时加载 ONNX 权重与原生执行库会增加部署体积和冷启动。

## Decision

EmbeddingProvider 使用中文 BGE-small-zh-v1.5 的 ONNX 量化权重，只供本机预计算。开发依赖 exact `@huggingface/transformers@4.2.0`。模型 `Xenova/bge-small-zh-v1.5` revision `75c43b069aac4d136ba6bc1122f995fedcfd2781`，CLS pooling、L2 normalization、384 维；模型卡来源 https://huggingface.co/Xenova/bge-small-zh-v1.5 与 https://huggingface.co/BAAI/bge-small-zh-v1.5 。

本机官方 Hugging Face 请求超时；允许从 hf-mirror.com 获取上述固定 revision 的公开数据文件，记录下载来源与 SHA256。禁止从模型仓库加载远程 Python/JavaScript 代码。缓存放入已忽略的 node_modules/.cache；权重不进入 Git、Snapshot 或 Vercel。

单题最多 50 条 Argument，在线 Candidate 直接提供全部已校验证据给模型；超过预算则拒绝并预先重建资产，不能截断后声称覆盖了全部样本。无需在线 Embedding，其他 Pipeline/Provider 边界保持不变。学术上的相似度与产品覆盖判断分离；归一化向量 + 欧氏距离 + Ward 仍需真实 Spike，阈值与最小样本数通过资料后冻结。

## Alternatives / Cost / Recovery

外部 Embedding API 需用户再开通账号。把本机模型放 Vercel 会增大函数体积；当前不选。验证失败时保留明确 Blocker，不将随机向量或 LLM 标签冒充 Embedding。此决策只涉及 TASK-021 合同与验证，TASK-022 负责最终数据流水线。
