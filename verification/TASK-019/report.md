# TASK-019 Verification Report

- Date: 2026-09-02
- Result: PASS
- Scope: Backend-ready Honest Demo Closure

## Outcome

Demo 现在以两条冻结 BFF 为后端接入边界。任意观点不会误命中预计算 Candidate，精确 Sample 可以从课堂、证据、同桌追问、课堂笔记、《我的一席》走到知乎/下一教室双出口。五个观点组均有可回溯 Inspector，390×844 使用固定 Bottom Sheet。

## Automated Gates

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS（27/27）
- `npm run build`: PASS
- `git diff --check`: PASS
- Local API smoke: GET Classroom = mock/40 students/5 representatives；Sample POST = success/1 seat/sample；arbitrary POST = no_candidate/0 seat/mock。

## Browser QA

可重复脚本：`verification/TASK-019/qa.cjs`。

- 1440×900：初始课堂、Cluster Inspector、no_candidate、Candidate 三项证据、完整学习闭环、复制反馈、知乎 href、Reset PASS。
- 1366×768：主 CTA 首屏可见，无横向溢出 PASS。
- 390×844：Rail 为 48dvh Bottom Sheet，主 CTA 首屏可见，教室仍保留可读区域；Cluster 标题/内容不重叠 PASS。
- Reduced Motion：圆桌在 2 秒内进入 Reflection；入场/Candidate/入席直接最终态 PASS。
- 任意同桌回应按钮保持禁用；精确 Sample 回应可继续 PASS。
- Console error / pageerror / hydration warning: 0。

## Screenshots

- `shots/01-exploring-1440.png`
- `shots/02-cluster-inspector-1440.png`
- `shots/03-no-candidate-1440.png`
- `shots/04-candidate-evidence-1440.png`
- `shots/05-seated-exits-1440.png`
- `shots/06-exploring-1366.png`
- `shots/07-exploring-bottom-sheet-390.png`
- `shots/08-cluster-bottom-sheet-390.png`
- `shots/09-seated-reduced-motion-1440.png`

## Known Deferred Work

- 40 人数据仍是人工 Mock，不是 Snapshot；真实知乎、LLM、Embedding 与 checksum/provenance 完整链路仍由 TASK-002/003/004 Gate 管理。
- 任意同桌回应的动态学习产物需要新的 Learning Result Contract/Proposal，本任务只提供 exact-sample 诚实保护。
- `classroom.module.css` 存在历史多代样式重复；本任务只追加了有边界的行为样式，机械合并应单独立 Task 并做视觉回归。
