---
id: CONTRACT-API-001
status: Decision Needed
owner: API
version: 1.0.0-rc.1
last_verified: 2026-08-31
freeze_gate: TASK-002
---

# API Contract

## Envelope

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: {
    requestId: string;
    mode: "live"|"snapshot"|"sample"|"mock";
    servedAt: string;
    snapshotId?: string;
    capturedAt?: string;
    fallbackFrom?: "live";
    fallbackReason?: string;
    warnings: string[];
  };
};

type ApiFailure = {
  ok: false;
  error: {
    requestId: string;
    code: ErrorCode;
    message: string;
    retryable: boolean;
    recovery: "retry"|"use_snapshot"|"use_sample"|"edit_input"|"switch_question"|"none";
  };
};
```

## GET `/api/v1/classrooms/:questionId`

返回 `ApiSuccess<Classroom>`。生产客户端只能请求 `auto|live|snapshot`；不能请求 mock。`auto` 优先受控 Live，失败时仅回退同 questionId 的合法 Snapshot。Snapshot GET 缓存策略必须显式配置。

失败：`QUESTION_NOT_FOUND`、`INSUFFICIENT_SOURCE_DATA`、`SNAPSHOT_UNAVAILABLE`、`PROVIDER_*`、`INTERNAL_ERROR`。

## POST `/api/v1/candidate-seat`

```ts
Request = {
  schemaVersion: string;
  questionId: string;
  classroomRevision: string;
  noteText: string; // 50–8000 Unicode chars, server recheck
  sampleId?: string;
  idempotencyKey: string;
}
```

返回 `ApiSuccess<AnalysisResult>`。noteText 不记录日志。相同 idempotencyKey 在有效窗口内必须避免重复 Provider 消耗。客户端发送新请求时 abort 旧请求，并以 requestId 丢弃 stale response。

任意笔记 Live 失败不得返回其他笔记的 Snapshot；只有 sampleId 或规范化 hash 精确命中时，才可返回 `mode: sample`。

## Error Codes

```text
INVALID_INPUT              400
PAYLOAD_TOO_LARGE          413
QUESTION_NOT_FOUND         404
CLASSROOM_REVISION_MISMATCH 409
INSUFFICIENT_SOURCE_DATA   422
ANALYSIS_INCOMPLETE        422
PROVIDER_RATE_LIMITED      429
PROVIDER_TIMEOUT           504
PROVIDER_UNAVAILABLE       502
STRUCTURED_OUTPUT_INVALID  502
SNAPSHOT_UNAVAILABLE       503
INTERNAL_ERROR             500
```

`partial` 和 `no_candidate` 是成功业务结果，不使用错误 HTTP 状态。

## Security / Validation

- Content-Type、payload size、schemaVersion、question revision、URL 与枚举全部服务端校验。
- 错误消息不透传 Provider 原文；requestId 可用于排查。
- Provider timeout 与 AbortSignal 必须贯穿。
- Client 可见 mode 不能仅存在日志；UI 必须渲染。

## TASK-019 Demo Slice Implementation（2026-09-02）

- 两条冻结 Route 已实现，响应在返回前再次通过 Envelope Zod Schema 校验。
- Classroom Route 当前只提供 `q_learn_programming` 的显式 `mock` Fixture；不存在时返回统一 `ApiFailure`。
- Candidate Route 校验 Content-Type、声明长度、实际 UTF-8 payload、schema、question/revision 与 deadline。
- `sampleId=sample_learn_programming_v1` 且规范化笔记精确匹配时返回 `mode: sample + success`；其他合法笔记返回 `mode: mock + no_candidate`，不套用 Sample。
- 进程内 idempotency 仅是 30 秒 best-effort；全局幂等与真实 Provider 消耗控制仍属于 TASK-003。
