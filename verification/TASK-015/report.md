# TASK-015 Verification Report — Demo V3 Learning Loop

- Date: 2026-09-01
- Branch: `task/TASK-015-learning-loop`（基线 `main` @ fd602fa）
- Verdict: **PASS**（13/13 AC 通过，0 console error，0 page error）

## Commands

| Command | Result |
|---|---|
| `npm run typecheck` | PASS（0 error） |
| `npm run lint` | PASS（0 error / 0 warning） |
| `npm test`（contract） | PASS（0 fail） |
| `npm run build` | PASS（静态导出 `/classroom/q_learn_programming`） |
| `git diff --check` | PASS |

## Browser QA（puppeteer-core + 系统 Chrome，脚本 `qa-v3.cjs`）

Golden Path 全程自动走查 + 三视口截图 + Reduced Motion 冒烟 + reset 回归。

| # | 场景 | 截图 | 结果 |
|---|---|---|---|
| 1 | 初次进入：40 学生 5 组可辨、黑板问题、overview +「听听各组怎么说」 | 01 / 20 / 30 | PASS |
| 2 | 课代表圆桌：发言人像素头像+台词气泡、名单进度、非发言人降噪、可跳过、AI 归纳披露 | 02 / 31 | PASS |
| 3 | 黑板三项：全班共识 / 核心争议 / 尚未解决的问题 写入黑板并保持；reflection 面板同步回顾 | 03 | PASS |
| 4 | Candidate Seat：空位亮起、位置解释（Python 快反馈 × 因人调整）、三项证据、不贴边 | 04 / 21 | PASS |
| 5 | 同桌：身份卡 + 为什么是他 +「让他追问我」；追问针对观点漏洞（实验失败信号） | 05 / 06 | PASS |
| 6 | 课堂笔记：四段渐进生长 + Before→After Diff 高亮新增条件 + 我的回应入笔记 | 07 / 33 | PASS |
| 7 | 《我的一席》四节 →「留下我的这一席」→ 角色坐进空位、40→41、同桌响应文案 | 08 / 09 | PASS |
| 8 | 双出口：知乎提纲 Mock（展开/复制）+ 102 教室因果入口 | 10 / 11 | PASS |
| 9 | Reduced Motion：圆桌跳过直达黑板、入席直达最终态 | 40 | PASS |
| 10 | reset：回 exploring、黑板三项消失、人数回 40、候选座消失 | 41 | PASS |

Console errors: **0**（修复 favicon 404 后复跑确认）；page errors: **0**。

## AC 核对（TASK-015 A–M）

- [x] A 圆桌：5 组课代表一轮结构化讨论（2.6s/句 ≈ 14s，可跳过），发生在教室舞台 overlay，非 Modal
- [x] B 黑板三项：圆桌后写入并常驻至 reset
- [x] C Reflection 顺序：输入区仅圆桌后出现，文案「听完他们，你现在怎么看？」
- [x] D Candidate Seat：空位亮起 + 位置解释，锚点取景不贴边，无回归
- [x] E 同桌追问：为什么是他 +「让他追问我」，追问针对观点漏洞，无自由聊天
- [x] F 用户回应：输入/演示答案，空回应禁提交
- [x] G 课堂笔记：四段随相位生长（①② candidate、③ challenge、④ responded）
- [x] H Cognition Diff：Before/After 对照卡 + 新增条件 mark 高亮
- [x] I 《我的一席》：观点/理由/补上的条件/与已有讨论相比 四节
- [x] J 入席：空位 → 用户像素角色坐下（下落淡入 420ms），40→41，同桌招手文案
- [x] K 知识出口：知乎提纲 Mock 可展开、可复制（clipboard）
- [x] L 学习出口：102 教室与本班未解决问题因果文案；102/103 诚实 Mock Entry
- [x] M 稳定演示：Golden Path 自动走查 2 轮全绿，三视口截图齐全

## 自修复记录（QA → Fix → 复验）

1. 候选步骤条与黑板三项重叠 → `.candidateStory` top 92px → 178px（步骤条只在 reflection 后渲染）。
2. 候选座/入席角色贴画面底边裁切 → graph 增加隐形 anchor 节点 + reveal 后 `zoomToFit` 重新取景。
3. favicon 404 console error → 新增 `src/app/icon.svg`（像素教室图标）。

## 边界与已知限制

- 圆桌/追问/笔记/我的一席/知乎提纲全部为预生成 Mock 并显式披露；输入沿用 exact-sample guard，任意文本不伪回退。
- 102/103 为走廊 Mock Entry，不加载真实教室；`data/fixtures/classrooms/` 与 `src/domain/` 未触碰。
- 黑板三项为紧凑 9px 三列（1366×768 已验证可读）；移动端改单列。
- 旧 V2 fixture `learn-programming-demo-v2.ts` 已删除（无引用残留，scenarios 单一真相为 V3）。

## 回退方式

- 整体回退：`git switch main`（fd602fa = checkpoint/TASK-014-pixel-classroom）。
- 丢弃本任务：`git branch -D task/TASK-015-learning-loop`。
