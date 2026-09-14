# 真实交付合同补充（TASK-021）

依据 ADR-0005～0008。新增实体以 `src/domain/schemas/provider.ts`、`snapshot.ts`、`learning.ts` 为可执行合同，既有 Classroom/Analysis 字段语义不变。新真实资产使用 rc.2，rc.1 仅兼容旧测试资产。

## API

`POST /api/v1/learning-turn`，Content-Type application/json，body 上限 48KiB。

- prepare：schemaVersion、stage=prepare、questionId、classroomRevision、noteText（50–8000 UTF-16 code units）、idempotencyKey。返回 stage=prepared、seatmate（当前 studentId、匹配原因、共同点、差异、一次 challenge、示例回应）、evidenceIds、challengeToken。
- complete：共用字段 + stage=complete、answerText（10–4000）、challengeToken。返回 stage=completed、classNote、mySeat、zhihuDraft、evidenceIds、学习 id 与当前 questionId/revision。提纲限制 3–5 项，每项最多 300 字，不输出完整回答。
- success/error envelope 复用现有合同；live/sample 分别披露；不在结果中携带用户笔记全文的日志副本。
- token 错误/过期=INVALID_INPUT + none（ADR-0011：界面保留输入并提示重新开始，旧 token 不可直接复用），revision 不匹配=CLASSROOM_REVISION_MISMATCH，模型错误复用 PROVIDER_* / STRUCTURED_OUTPUT_INVALID。
- 本次 idempotency 仅单实例的有界在途去重，key+请求 body hash 绑定。不同 body 同 key 不复用。不能宣传分布式幂等或 exactly-once。

## 证据与状态

生成只选择 evidenceId；服务端复核与当前源、笔记区间的关系。生成结构不验证事实必然正确，需保留摘要标签与来源链接。

学习状态：idle → preparing → prepared → completing → completed；preparing/completing → error，error → 对应 Retry；Reset/切题清空状态，编辑原观点使 token 失效。complete 成功后才能进入 responded/mySeat。任何旧 requestId 的结果均无效。

## 资产验收

Manifest sourceCount 等于 Classroom 去重来源数；files 只允许相对安全文件名，checksum 是文件原始 UTF-8 bytes 的 SHA256。真实教室不能含 Mock provenance。最低来源 8、最高 50；课堂过少返回材料不足，超大需离线缩小并披露筛选。Sample 回退精确匹配规范化笔记 hash，学习结果还要精确回应 hash。

## TASK-026：目录与合成课堂扩展

依据 PDR-0005。`src/domain/schemas/catalog.ts` 是教室目录的可执行合同，要求三个唯一 number/questionId，nextQuestionId 指向另一间已登记教室。首页、静态路由、门牌与后续问题共同使用 `data/classrooms/catalog.ts`。

rc.2 兼容增加 `SourceContent.provider=synthetic` 与 `textKind=synthetic_excerpt`，二者必须共同出现且只允许 `Classroom.provenance.mode=mock`；真实 Snapshot 验证拒绝合成来源。102/103 在生产目录里明确开放，既有开发 fixture 限制保持。新增材料不写入 `data/snapshots`。

Candidate Sample ID 从单一 literal 扩展为 `sample_*`；样例仍严格绑定 questionId、revision、规范化 hash 与原文。示例观点、参考回应及签名追问精确匹配后返回 sample（真实课堂）或 mock（合成课堂）。其他输入调用 Live，来源模式在课堂与 warnings 中分别保留；Live 不能暗示合成材料是真实知乎数据。未知题、跨题 token、旧 revision 与引用越界均拒绝。

新增下载为用户主动保存 Markdown 课堂笔记，包含原观点、系统追问、实际回应、整理草稿、短提纲和本次证据。无账户存储、自动保存、自动知乎发布；合成题链接只提供明确标注的知乎问题搜索。
