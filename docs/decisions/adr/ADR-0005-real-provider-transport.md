---
id: ADR-0005
status: Accepted
date: 2026-09-15
owner: Primary Agent, within user-authorized delivery scope
---

# 首批真实服务适配与传输合同

## Context / Evidence

用户已授权补齐真实数据并提供两项服务凭证。DeepSeek `deepseek-flash` JSON 请求 HTTP 200；知乎 quota 返回 Code 0。手册中的官方 CDN 技能包版本 0.7.2-beta.20260911131715，SHA256 `7408ea4cb339c27294c3d664ac2f8c14b21b30c24b2bfb82dc0bd86d78443fb2`。

## Decision

此记录落实 ADR-0002/0003，未取代其结论。TASK-021 的 021A 子集新增 exact `ai@7.0.85` 与 `@ai-sdk/deepseek@3.0.44`（npm registry 已确认均为 provider v4 协议，Zod 4 / Node 24 兼容性以测试为准）。生成适配用 `generateText + Output.object`，业务只接收 Zod 校验后的数据和实际模型/usage 元数据。禁用 reasoning 以控制当前单次结构化生成耗时；可配置明确模型名，不静默切模型。

新增 `StructuredOutputProvider` 与 `ContentProvider` 传输 Port。所有真实调用接收 ExecutionContext，尊重外部取消和绝对 deadline，最多一次重试；失效输出不进入业务。仅服务端读取 `.env.local`。使用现有错误码映射超时、限流、不可用和非法输出，不暴露厂商返回的原始错误或 Secret。

知乎应用集成直接使用官方 REST，无需安装或运行 CLI。认证为 Bearer Access Secret 与秒级 X-Request-Timestamp。回答 API：`GET https://developer.zhihu.com/api/v1/content/question_answers`，参数 QuestionUrl、Offset、Limit（1–50）。保留 Url；Summary 仅是摘要。分页以 Paging.IsEnd / NextOffset 为准，空页仍可能有下一页。先冻结原始传输 Zod，不将摘要误标为现有 full_text/search_excerpt，不在本子集映射 Classroom。

只接受知乎标准问题 URL 与安全整数 offset；不允许模型控制主机或认证目标。对畸形响应、缺失下一页游标、不前进游标显式报错。服务端错误使用既有 API 错误语义。

## Deferred gates

为在 Next.js 构建时阻止 Provider 进入 Client bundle，增加标记包 `server-only@0.0.1`。Node 集成测试使用 `--conditions=react-server`，与应用服务端的导出条件保持一致。

Embedding、最终 SnapshotManifest、`answer_summary` 产品字段版本、学习结果 API 仍需单独定稿。当前子集通过不等于 TASK-021 Done，不允许提前开始 TASK-022/023/024。本次模型结果和官方数据不包含用户笔记；后续用户输入需披露第三方处理。

## Validation

保留真实最小请求、超时/取消、错误码映射与非法结构测试；typecheck/lint/test/build 完成后写 verification/TASK-021/report.md。真实服务输出从 Git 忽略配置取得凭证，验证文件只含脱敏结果。
