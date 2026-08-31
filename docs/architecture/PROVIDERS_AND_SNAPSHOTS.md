---
id: ARCH-002
status: Frozen
owner: Software Architecture
version: 1.0.0
last_verified: 2026-08-31
depends_on: [ADR-0003, ADR-0004]
---

# Provider Boundary 与 Demo Safety Layer

## Ports

| Port | 只负责 | 不负责 |
|---|---|---|
| `ContentProvider` | 官方内容搜索、分页、外部错误映射 | 聚类、产品措辞、Snapshot 伪装 |
| `EmbeddingProvider` | 批量向量、模型元数据 | 阈值与 Candidate 决策 |
| `StructuredOutputProvider` | 按 schema 结构化生成、有限重试 | 证据真伪、业务 guard |
| `ClassroomSource` | 按问题加载合法 Classroom | 动态 UI 决策 |
| `CandidateSeatAnalyzer` | 产出合法 AnalysisResult | 展示 Seat 动画 |

所有调用接收 `ExecutionContext`：`requestId`、`AbortSignal`、`deadlineAt`、`mode`。timeout/retry/rate-limit mapping 在 Adapter；Prompt 与领域规则在 Pipeline。

## 模式定义

- `live`：本次请求真实调用 Provider。
- `snapshot`：真实历史数据的不可变资产，可用于 Demo。
- `sample`：用户显式选择的示例笔记与其预计算结果。
- `mock`：人工合成，只允许测试/开发。

客户端不能把生产请求切成 mock。每个 API success 必须返回 mode、servedAt、requestId、warnings；Snapshot 还要 snapshotId/capturedAt；回退要有 `fallbackFrom` 和 `fallbackReason`。

## Snapshot 文件

```text
data/snapshots/<question-key>/<snapshot-id>/
  manifest.json
  sources.json
  classroom.json
  analysis/<sample-id>.json
```

Manifest 至少包含：schemaVersion、snapshotId、questionId、classroomRevision、generatedAt、capturedAt、sourceProvider、去重 sourceCount、queryHistory、pipelineVersion、promptVersions、modelVersions、embeddingModel、clustering 参数、checksums。

Snapshot 规则：

- 不原地覆盖；新生成新 ID，Demo manifest pin 精确版本。
- 预计算脚本可在本地/CI 写文件；Vercel runtime 只读。
- 所有文件在 build/CI 执行 schema + 引用完整性 + checksum 校验。
- Snapshot 真实来源可用于产品；Mock 不得混入 Snapshot。
- 搜索摘要字段固定为 `excerpt` + `textKind: search_excerpt`。

## Fallback Matrix

| 故障 | 自动动作 | 用户看到 |
|---|---|---|
| Classroom Live timeout/rate limit | 加载同问题合法 Snapshot | 模式、抓取时间、回退原因 |
| Classroom Snapshot 无效 | 阻止渲染 | Retry / 切备案题 |
| Candidate 任意笔记 Live 失败 | 不返回预计算结论；保留输入 | Retry / 使用示例笔记 |
| Candidate sample 精确命中失败 | 可加载该 sample 的预计算结果 | “示例结果”与 Snapshot 时间 |
| 部分 Claim 失败 | 返回 partial；uncertain 不生成 Seat | 已完成项与缺失证据 |
| 来源不足 | 不强聚类 | “材料不足以形成稳定观点地图” |
| Canvas 失败 | DOM 观点列表 | 核心路径仍可继续 |

禁止以通用 Snapshot 回退任意用户笔记；这会把演示资产伪装成个人分析。

## AI SDK 与 Provider 版本

当前官方结构化输出主路径是 `generateText` + `Output.object`。业务代码只调用 Port。TASK-001/TASK-004 必须锁定 exact package version 与最小 Spike；未来 SDK 迁移仅修改 Adapter，并产生 ADR，不改 Domain/API Contract。

