# TASK-016 Verification Report — Interaction and Classroom Layout Hotfix

- Date: 2026-09-01
- Working branch: `hotfix/TASK-016-interaction-layout`
- Verdict: **PASS**（6/6 AC 通过）

## Commands

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS（原 QA 的 3 个 lint error 已消除） |
| `npm test` | PASS（16 tests；新增 5 个 session reducer tests） |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| GitHub 干净克隆后 `npm ci` | PASS（398 packages） |
| 干净克隆后 typecheck / lint / test / build | PASS |

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
- `verification/TASK-016/reduced-motion-smoke.cjs` 使用真实 Chrome 模拟 `prefers-reduced-motion: reduce`：PASS，自动进入 Reflection，0 console/page error。

## QA Corrections

- QA 现在同时以 console error 和 page error 作为非零退出条件。
- 102 出口不再吞掉点击失败，而是必须出现 `走廊上的 Classroom 102`。
- Puppeteer 与 Chrome 路径支持 `PUPPETEER_CORE_PATH` / `CHROME_PATH` 环境变量，不再绑定 WorkBuddy 用户目录。

## Delivery and Rollback

- GitHub branch: `hotfix/TASK-016-interaction-layout`。
- 修复前回退标签：`checkpoint/TASK-015-before-interaction-hotfix`，指向 `f1cbcfe`。
- TASK-014 基线仍为 `fd602fa`；历史任务分支与提交均未删除或重写。
- 回退 TASK-016：`git switch --detach checkpoint/TASK-015-before-interaction-hotfix`；需要建立可继续开发的回退分支时使用 `git switch -c rollback/TASK-016 checkpoint/TASK-015-before-interaction-hotfix`。
