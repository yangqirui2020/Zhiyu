---
id: CONTRACT-DOMAIN-001
status: Decision Needed
owner: Domain
version: 1.0.0-rc.1
last_verified: 2026-08-31
freeze_gate: TASK-002
---

# Domain Contract

本文件是字段语义的规范真相源；实现以 `src/domain/schemas` 的 Zod schema 为可执行真相源。所有 ID 是非空、带前缀的稳定字符串；所有跨边界对象含 `schemaVersion`。

## Common

```ts
type DataMode = "live" | "snapshot" | "sample" | "mock";
type TextKind = "search_excerpt" | "full_text";
type Confidence = "high" | "medium" | "low";
```

## Source Layer

```ts
Question = {
  schemaVersion; id: `q_${string}`; externalId: string | null;
  title: string; url: httpsUrl; searchQueries: string[];
}

SourceContent = {
  schemaVersion; id: `src_${string}`; provider: "zhihu";
  externalId: string; contentType: "answer" | "article" | "other";
  questionId; title: string; excerpt: string; textKind: TextKind; url: httpsUrl;
  author: { displayName; badge; authorityLevel: 1|2|3|4|5|null };
  metrics: { voteUpCount: number|null; commentCount: number|null };
  capturedAt: isoDateTime;
}
```

去重以 `provider + externalId` 为主，URL 为保守后备。`excerpt` 不得在 UI 称全文。

## Evidence

```ts
Evidence =
  | { id: `ev_${string}`; kind: "source_excerpt"; text; sourceContentId }
  | { id: `ev_${string}`; kind: "note_excerpt"; text; start; end };
```

- `source_excerpt.text` 必须是对应 `SourceContent.excerpt` 的可验证子串。
- `note_excerpt.text === noteText.slice(start, end)`。
- LLM Draft 只返回 evidenceId；无法回溯则丢弃/uncertain。

## Argument

```ts
ArgumentDraft = { conclusion; reasons: string[1..3]; evidenceIds: string[]; qualifiers: string[] };
Argument = ArgumentDraft & {
  schemaVersion; id: `arg_${string}`; sourceContentId;
  extraction: { promptVersion; modelId; generatedAt };
};
```

Draft 与 Entity 分离：LLM 不生成内部 ID、provenance、引用文本。

## Classroom

```ts
Student = {
  id: `stu_${string}`; sourceContentId; argumentId;
  assignment: { kind:"cluster"; clusterId } | { kind:"independent" };
  displaySeed: number; layout: { x; y };
}

Cluster = {
  id: `clu_${string}`; label; labelKind:"ai_generated"; summary;
  commonReasons: string[1..3]; studentIds; representativeArgumentIds;
  limits: string[]; confidence: Confidence;
  renderMode:"clustered"|"independent"; layout:{ centerX; centerY };
}

ClusterRepresentative = {
  clusterId; title; commonReasons; representativeSourceIds;
  exampleResponses: Array<{ promptKey:"cross_cluster"|"out_of_scope"; text; evidenceIds }>;
  disclosure: string; // 确定性模板，不由 LLM 自由写
}

Classroom = {
  schemaVersion; revision; question; provenance;
  sources; evidence; arguments; students; clusters; representatives;
}
```

Embedding 不属于浏览器 Classroom。所有关系 ID 必须存在且无重复；Student 一一对应去重 SourceContent。

## Candidate Analysis

```ts
ClaimDraft = { text; noteEvidenceIds };
Claim = ClaimDraft & { id:`claim_${string}`; normalizedText };

ClaimAssessment = {
  claimId;
  relevance: Dimension<"related"|"unrelated"|"uncertain">;
  noteSupport: Dimension<"supported"|"insufficient"|"uncertain">;
  coverage: Dimension<"covered"|"partial"|"limited"|"uncertain">;
  decision: "candidate"|"not_candidate"|"inconclusive";
}

Dimension<T> = { value:T; evidenceIds:string[]; explanation:string };
```

唯一 Candidate guard：`related && supported && limited`。任何 uncertain → inconclusive。

```ts
CandidateSeat = {
  id:`seat_${string}`; claimId; title; disclosure;
  evidencePanel:{ relevanceEvidenceIds; noteSupportEvidenceIds; coverageEvidenceIds };
  outline:{ perspective; evidence; structure } | null;
}

AnalysisResult = {
  schemaVersion; id:`analysis_${string}`; questionId; classroomRevision;
  status:"success"|"partial"|"no_candidate";
  claims; assessments; candidateSeats; evidence; warnings; analyzedAt;
}
```

`partial` 的 HTTP 状态仍为 200；未知维度不能猜成 limited。Outline 建议随分析预生成，按钮只揭示，减少额外不稳定调用。

## SnapshotManifest

包含：`schemaVersion/snapshotId/questionId/classroomRevision/generatedAt/capturedAt/sourceProvider/sourceCount/queryHistory/pipelineVersion/promptVersions/modelVersions/embeddingModel/clustering/checksums`。`sourceCount` 必须等于去重合法 SourceContent 数。

## Freeze Gate

TASK-002 必须创建 Zod schema、valid/invalid fixtures、跨引用完整性测试，并决定最低有效 source 数、ID 正则与 exact schemaVersion 后，本合同转 Frozen。

## TASK-019 Demo Slice Implementation（2026-09-02）

`src/domain/schemas/candidate.ts` 已实现 Claim、ClaimAssessment、CandidateSeat 与 AnalysisResult 的可执行 Schema，并校验 Claim/Assessment/Seat/Evidence 跨引用、Candidate guard、状态与 note range。40 人 Mock Classroom 现在为每个 Cluster 提供一个可检查的 Representative。完整 TASK-002 Freeze Gate（尤其生产最低 source 数与 SnapshotManifest）仍未宣称完成。
