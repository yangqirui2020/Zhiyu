# PROP-0006 — DeepSeek V4 Pro 恢复实时生成

Status: Accepted（用户 2026-09-15 明确授权测试并切换）

## Problem
Flash 实时生成连续超时，阻断任意笔记的观点分析和学习结果。
## Evidence
02:49 本机 learning HTTP smoke 在 25 秒后返回 PROVIDER_TIMEOUT。模型列表与余额接口可用。02:54 两把用户授权密钥调用 deepseek-v4-pro 最小生成分别用时 911 ms / 806 ms，均 200 且有内容；备用密钥 deepseek-flash 12 秒无完整返回。
## Impact
仅运行配置的模型切换为 deepseek-v4-pro；结构化 Provider、合同和截止时间不变。价格可能更高，用户已知情同意。历史资产保留原模型记录，新生成结果记录实际返回模型。
## Alternatives (include keep current)
保持 Flash 可保留精确 Sample 演示，但实时请求受阻。换平台需新鉴权、SDK 验证，时间与范围更大。
## Migration Cost
一项环境变量与完整业务 smoke；无需升级依赖。备用密钥仍只在忽略的本机配置中。
## Recommendation
切换同平台 V4 Pro，先生成 Sample，再验证两组真实调用和生产部署。
## Affected Files / Contracts / Tasks
TASK-024/025、本机环境配置、ADR-0012、不可变新 Snapshot；不修改 API/Domain/Provider Port。
## Rollback
模型恢复后可显式把环境配置切回 deepseek-flash，重新验证；不改写既有 Snapshot。
## Decision Owner / Deadline
用户已授权；Primary Agent 执行，发布前验证。
