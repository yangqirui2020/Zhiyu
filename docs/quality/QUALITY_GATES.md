---
id: QUALITY-001
status: Frozen
owner: Quality
version: 1.0.0
last_verified: 2026-08-31
---

# Definition of Done 与 Verification

## 所有 Task 的 DoD

- Acceptance Criteria 全通过；无未声明 TODO/FIXME；文件变更在 Allowed Files。
- TypeScript strict、lint、unit、contract、build 通过；适用时 integration/E2E 通过。
- Schema 变更含版本、valid/invalid fixture、关系完整性测试与迁移说明。
- 涉及状态覆盖适用的 initial/loading/success/empty/error/partial/retry/reset/second attempt/switch question/timeout/insufficient data。
- 无 console error、hydration warning、明显 layout shift、重复提交竞态或 stale response 污染。
- 基础 a11y：键盘可达、focus 可见、Sheet focus trap/Escape/焦点恢复、Canvas 等价 DOM 列表、Reduced Motion。
- 1440×900、1366×768、390×844 无关键遮挡/横向溢出；主 CTA、来源模式和分母可见。
- `verification/TASK-xxx/report.md` 附命令结果、截图、已知限制；文档/Task 状态更新。

P0 额外：Snapshot Golden Path、断网恢复、Golden Path 人工 QA 全 PASS。

## 测试金字塔

1. Schema contract：所有 Snapshot/Sample/Mock `safeParse`，再校验跨 ID、去重、checksum、note range。
2. Domain unit：Candidate guard、uncertain、partial、低置信聚类、阈值边界、Evidence 子串。
3. Provider contract：Live/Snapshot/Mock adapter 通过相同 Port suite；CI 默认 Mock。
4. State table：合法/非法 event、stale、retry/reset/cancel/切题/第二次输入/Reduced Motion。
5. Route integration：400/413/409/422/429/502/504、idempotency、live→snapshot、sample-only fallback。
6. Prompt eval：15–20 条人工标注；检验 schema、证据合法性与标签一致性，不逐字断言自由文本。
7. E2E/Visual：固定 Snapshot 走 GP-001 和失败分支。
8. Live smoke：手工/opt-in，永不作为普通 CI 必过项。

## GP-001 Snapshot Golden Path

1. 首页 3 秒内理解“一道问题 = 一间教室”。
2. 进入备案题，模式/时间/分母可见。
3. 入场聚类完成；点学生看 Argument + 搜索摘要 + 原链。
4. 点簇看共同理由、AI 署名、示例对峙与拒答边界。
5. 输入示例笔记；提交披露与真实等待状态正确。
6. Candidate Seat 在原教室出现；三项证据逐条可回溯。
7. N/X 按真实数据计算；无越权措辞。
8. 揭示三行提纲；去知乎 CTA 有效。
9. Reset 后无旧 Seat；第二次提交不叠加；切题清理正确。

发布门：Snapshot GP-001 100% PASS。Live 可以因外部凭证阻塞，但必须有一次真实 smoke 记录或明确 Blocker。

## Failure Matrix

- 断网/Provider timeout → 显式 Snapshot 或 Retry。
- 跑题笔记 → noCandidate，不亮桌。
- 高度重复 → “已有较充分讨论”。
- 部分重叠 → partial/具体既有证据。
- 少数据/弱分歧 → 不强聚类。
- Snapshot 无效 → 阻止渲染。
- 任意笔记 Live 失败 → 不伪用 Sample。
- Evidence 不可回溯 → inconclusive。
- Canvas 失败 → DOM 列表继续 Golden Path。

## Visual QA

每个状态使用固定 snapshot、seed、时间与动画开关：

```text
实现 → 浏览器打开目标状态 → 操作 → 截图 → 对照 Design/UX Spec → 修复 → 复拍
```

截图命名：`TASK-xxx_<viewport>_<state>.png`。至少包含首页、ready、Student Sheet、Cluster Sheet、loading、empty、error、partial、noCandidate、Candidate、outline。

Canvas 专项：节点不遮题目/CTA、簇间距可辨、离群点可见、点击热区 ≥44px、缩放可恢复、文字清晰、动画结束态稳定、低性能/Reduced Motion 仍表达因果。

48h 内不使用脆弱的全页像素阈值；先人工语义对照，只对稳定 DOM 区域做截图回归。Golden Path 录屏不能替代逐状态截图。

## Verification Report

必须记录：commit、环境、Task/Contract/Decision、命令与退出码、AC checklist、截图路径、GP/Visual 结果、失败恢复、已知限制、PASS/FAIL/BLOCKED、验证者与时间。

