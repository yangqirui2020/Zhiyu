# TASK-004 — One-question Zhihu → Argument Validation Gate

- Status: Planned
- Owner: Data Pipeline
- Estimate: 4h (H0–2 gate has a 2h stop decision)
- Dependencies: TASK-002/003 Done; credentials available

## Goal

用官方知乎接口验证一题能否稳定召回、去重并人工核验足量同题摘要，产出真实 sources/arguments Snapshot 与验证记录。

## Inputs / Outputs

- Input: 一个备案题、query strategy、Access Secret。
- Output: raw response audit（脱敏）、去重 SourceContent、Evidence、15–20 条人工抽检 Argument、API 字段/额度/长度记录。

## Acceptance Criteria

- [ ] 不抓网页、不使用非官方全文接口。
- [ ] 每条内容验证 question association、externalId、URL、textKind。
- [ ] 去重后分母真实；不能把多问题混为同一教室。
- [ ] AI SDK 7.0.85 `generateText + Output.object` Adapter Spike 通过并有 bounded retry。
- [ ] LLM 仅返回 evidenceId；假引用被拒。
- [ ] 2h 时形成 Go/Degrade：不足则冻结为“官方搜索召回并人工核验的备案同题样本”，不承诺任意题建室。

## Do Not

不调 UI、不改 Golden Path、不为了凑 20–30 条降低关联性标准。

