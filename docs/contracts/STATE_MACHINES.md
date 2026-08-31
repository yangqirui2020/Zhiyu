---
id: CONTRACT-STATE-001
status: Decision Needed
owner: Frontend Architecture
version: 1.0.0-rc.1
last_verified: 2026-08-31
freeze_gate: TASK-002
---

# State Machines

## Classroom

```ts
type ClassroomState =
  | { status:"idle" }
  | { status:"loading"; questionId; requestId }
  | { status:"entering"; classroom }
  | { status:"clustering"; classroom }
  | { status:"ready"; classroom; selection:
      {kind:"none"}|{kind:"student";studentId}|{kind:"cluster";clusterId} }
  | { status:"empty"; reason:"no_sources"|"insufficient_arguments" }
  | { status:"error"; error:UiError; questionId };
```

| Event | From | Guard / Effect | To |
|---|---|---|---|
| LOAD/SWITCH_QUESTION | any | abort old, clear selection/result | loading |
| RESOLVE | loading | requestId current, schema valid | entering or ready(reduced motion) |
| ENTER_ANIMATION_DONE | entering | current classroom | clustering |
| CLUSTER_ANIMATION_DONE | clustering | current classroom | ready/none |
| SELECT_STUDENT | ready | student exists | ready/student |
| SELECT_CLUSTER | ready | cluster exists | ready/cluster |
| CLOSE_INSPECTOR | ready | — | ready/none |
| EMPTY | loading | requestId current | empty |
| REJECT | loading | requestId current | error |
| RETRY | error/empty | — | loading |

Reducer 不执行网络和动画；Canvas Adapter 只发送完成事件。旧 requestId 响应忽略。

## Candidate Seat

若 API 没有真实流式阶段事件，状态只能是 `analyzing`，不伪造 extracting/matching/judging。

```ts
type CandidateState =
  | { status:"empty"; noteText:"" }
  | { status:"editing"; noteText; validationError?:string }
  | { status:"analyzing"; requestId; submittedText; draftText }
  | { status:"resolved"; noteText; result:AnalysisResult }
  | { status:"error"; noteText; lastSubmittedText; error:UiError };
```

| Event | From | Rule | To |
|---|---|---|---|
| EDIT | any | 修改后旧 result 立即失效 | editing |
| SUBMIT | editing | local validation pass | analyzing |
| VALIDATION_FAIL | editing | 保留文本 | editing/error text |
| RESOLVE | analyzing | requestId current | resolved |
| REJECT | analyzing | requestId current, 保留文本 | error |
| RETRY | error | 使用 lastSubmittedText | analyzing |
| CANCEL | analyzing | abort，保留 draft | editing |
| RESET | any | 清 input/result | empty |
| SWITCH_QUESTION | any | 保留 draft，清 result | editing/empty |

`success/partial/no_candidate` 都在 resolved.result.status。编辑已完成结果、切题或 Reset 必须清除 Seat。请求中重复提交先取消旧请求。

## Cross-machine Rules

- Classroom 不 ready 时 Candidate 不能提交。
- 切换问题同时触发 Classroom LOAD 与 Candidate SWITCH_QUESTION。
- Classroom revision 改变使旧 AnalysisResult 失效。
- Candidate Reveal 只由合法 `success + candidateSeats.length>0` 触发一次。
- Canvas 失败不改变 Domain state，只切换 renderer 到 accessible list。

## Required Table Tests

合法/非法事件、stale response、retry、cancel、reset、第二次提交、切题、revision mismatch、Reduced Motion、partial/noCandidate、Canvas fallback。

