# TASK-016 Verification Report — Interaction and Classroom Layout Hotfix

- Date: 2026-09-01
- Working branch: `task/TASK-015-learning-loop`（当前环境 `.git` 只读，无法创建要求的 `hotfix/TASK-016-interaction-layout`）
- Verdict: **VERIFICATION**（5/6 AC 已有运行证据；Reduced Motion 实现与 QA 断言完成，等待可模拟 media preference 的浏览器复验）

## Commands

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS（原 QA 的 3 个 lint error 已消除） |
| `npm test` | PASS（16 tests；新增 5 个 session reducer tests） |
| `npm run build` | PASS |
| `git diff --check` | PASS |

## Browser QA

使用 Codex in-app Browser 访问 `http://localhost:3000/classroom/q_learn_programming`。

| Viewport / State | Result | Evidence |
|---|---|---|
| 1440×900 Candidate | PASS：黑板、步骤条、五组学生无覆盖；01 当前态正确 | `shots/1440-candidate.png` |
| 1440×900 Seated | PASS：40→41、双出口可见 | `shots/1440-seated.png` |
| 1366×768 Exploring | PASS：初始黑板与上方组保留间距 | `shots/1366-exploring.png` |
| 1366×768 Reflection | PASS：黑板三项增高后重新取景，无人物覆盖 | `shots/1366-reflection.png` |
| 1366×768 Candidate | PASS：步骤条位于安全区，01 当前态正确 | `shots/1366-candidate.png` |
| 390×844 Exploring | PASS：黑板与学生分离 | `shots/390-exploring.png` |
| 390×844 Reflection | PASS：紧凑黑板三项与最上方学生保留间距 | `shots/390-reflection.png` |
| 390×844 Candidate | PASS：移动端隐藏舞台悬浮步骤条，Candidate rail 保持完整 | `shots/390-candidate-full.png` |

完整交互复验：Candidate → Seatmate → Challenge → Responded → MySeat → Seated → Classroom 102 → 返回 101 → Reset → 第二次 Candidate，全部 PASS。空回应按钮保持 disabled；浏览器 console warning/error 为 0。

步骤条实测：

- Candidate：01 当前，02–04 待完成。
- Seatmate：01 已完成，02 当前。
- Challenge：01–02 已完成，03 当前。
- MySeat：01–03 已完成，04 当前。

## Reduced Motion

- `ClassroomExperience` 监听 `prefers-reduced-motion`；圆桌相位在偏好开启时下一帧直接发送 `roundtable_finish`。
- `qa-v3.cjs` 已改为点击圆桌入口后 2 秒内等待 Reflection，删除了手动“跳过”动作；若未自动进入会失败。
- 当前 in-app Browser 的 media preference 为 `false`，且不暴露 media override，因此本轮没有伪造浏览器 PASS。此项保留在 Verification。

## QA Corrections

- QA 现在同时以 console error 和 page error 作为非零退出条件。
- 102 出口不再吞掉点击失败，而是必须出现 `走廊上的 Classroom 102`。
- Puppeteer 与 Chrome 路径支持 `PUPPETEER_CORE_PATH` / `CHROME_PATH` 环境变量，不再绑定 WorkBuddy 用户目录。

## Git Limitation

工作区允许修改源码，但 `.git` 为只读；创建 hotfix 分支失败。因此本 Task 未提交或上传，所有改动保留在当前工作区，待用户恢复 Git 写权限后执行提交与推送。
