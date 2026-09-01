# TASK-017 Verification Report — Classroom Composition Hotfix

- Date: 2026-09-01
- Route: `/classroom/q_learn_programming`
- Verdict: **PASS**（6/6 AC，0 console error）

## Change Result

- 新增不参与绘制的底部安全锚点，让固定桌组取景整体上移：顶部桌组更靠近黑板，底部桌组与边框、规则栏保持留白。
- 删除无产品语义的棕色讲台块、黑色虚线路径和 L 形过道，仅保留低对比中央通道。
- 教室内门标改为“通往走廊 / 1F →”，符合从教室向外的视角。
- 顶部走廊门牌由四列模板改为三列，DOM 与视觉顺序均为 101 → 102 → 103。

## Command Verification

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS（16/16） |
| `npm run build` | PASS |
| `git diff --check` | PASS |

## Browser Verification

| Viewport / Flow | Result |
|---|---|
| 1440×900 exploring | PASS：桌组靠近黑板；底部和左下安全留白；无含义不明黑条 |
| 1366×768 exploring | PASS：规则栏、左下桌组、门标互不覆盖 |
| 390×844 exploring | PASS：五组、三门牌和底部控件完整可读 |
| reflection → candidate | PASS：展开黑板、候选座和步骤条无覆盖 |
| seatmate → challenge → mySeat → seated | PASS：完整主线可达 41 人 |
| Classroom 102 → 返回 → Reset | PASS：入口可用并恢复首态 |

浏览器日志：0 error。门牌文本顺序读取为 `[101, 102, 103]`。

## Evidence

- `shots/1440-exploring.png`
- `shots/1366-exploring.png`
- `shots/390-exploring.png`
- `shots/1440-candidate.png`
- `shots/1440-seated.png`

## Boundaries

- 未修改 fixture 坐标、Domain/API/State Contract、依赖或 Design Token。
- Classroom 102/103 仍为显式 Mock 入口；本任务只修正空间呈现。

## Rollback

回退 TASK-017 对 `ForceGraphCanvas.tsx`、`ClassroomExperience.tsx` 和 `classroom.module.css` 的提交即可恢复 TASK-016 布局。
