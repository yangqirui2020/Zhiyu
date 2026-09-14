---
id: ADR-0007
status: Accepted
date: 2026-09-15
owner: Primary Agent
supersedes: ADR-0006 dimensions only
---

# 以实际权重确认维度并修复间接依赖

固定 revision 的 config.hidden_size 与实际向量长度均为 **512**；ADR-0006 的 384 维判断错误，本记录将其替换为 512。模型、pooling、归一化、本机边界及完整比较决策不变。三句最小测试：同义句余弦约 0.764，无关句约 0.425，模型启动与推理约 484ms。这只是连通性/形状校验，不是质量基准。

npm audit 检出本次新开发依赖链中的 sharp <0.35.4、adm-zip <=0.6.0 公告。仅对 `@huggingface/transformers` 的 sharp 设 override=0.35.4、`onnxruntime-node` 的 adm-zip=0.6.1。两版本已在 npm registry 验证存在；重新安装后复验实际模型与 build，不原地升级其他依赖。
