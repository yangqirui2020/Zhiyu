# Verification — TASK-026

- Result: PASS
- Commit: 未创建提交；分支 `task/TASK-026-three-classroom-learning-loop`
- Environment / Browser / Viewport: Windows、Node 24.13.0、Next 16.3.3、Playwright Chromium；1440×900、1366×768、390×844
- Verified by / at: Primary Agent，2026-09-15（北京时间）
- Production preview: http://localhost:3007

## Contract / Decision References

PROP-0007、PDR-0005、REAL_DELIVERY_CONTRACT 的 TASK-026 增量。保留原 API envelope、Candidate 三条件、来源/笔记引用校验、签名追问与精确示例匹配。

## Acceptance Checklist

- [x] A. 首页、门牌与后续问题均能进入 101/102/103；三个静态路由正确生成，题目/材料/叙事/示例独立。
- [x] B. 101 保留 12 条真实来源、2 组；102/103 各 24 条不同合成材料、4 组，共 60 个唯一来源。真实 Snapshot 及旧资产未修改；合成来源不能冒充真实 Snapshot。学生详情、分析结果与下载笔记均披露来源。
- [x] C. 每题均可完成示例观点 → Candidate → 签名追问 → 示例回应 → 个人笔记 → 我的一席 → 入席 → 下载/知乎出口 → 下一题。下载文件保留原观点、实际回应、三条提纲和当前证据。102 非示例观点也通过真实模型的完整 Live 调用。
- [x] D. 三视口逐题检查 ready、Candidate、seated；重新安排桌组与角色尺寸，101 小班人物放大。手机上下布局不遮挡教室，所有视口无横向溢出。修复组名重叠、候选步骤浮层遮挡和切阶段保留旧滚动位置。键盘 Enter/Escape/焦点恢复通过，Reduced Motion 与普通动效均通过。
- [x] E. 66 项 unit/contract/integration tests、typecheck、lint、production build、diff-check PASS。切题、Reset、第二次操作、晚到响应与三阶段故障重试通过。

## Commands and Exit Codes

| 检查 | 结果 | 证据 |
|---|---|---|
| `npm run typecheck` | 0 / PASS | typecheck.log |
| `npm run lint` | 0 / PASS，无警告 | lint.log |
| `npm test` | 0 / 66 PASS | tests.log |
| `npm run build`（包含全部资产预检） | 0 / PASS | build.log |
| `git diff --check` | 0 / PASS | 无空白错误 |
| 生产页面与未知题 | 200 / 404 符合预期 | http-smoke.json |
| 生产浏览器 | Errors 0 / Warnings 0 | production-console.log |

## State / Failure-Recovery Results

`recovery.log`：观点分析 503 后原输入保留，Retry 成功；prepare 503 后重试成功；complete 503 后回应保留，Retry 可到入席。Reset 清空原输入，第二轮可重新开始。人为延迟旧题 Candidate 请求后切到 103，旧响应不会创建座位或带入旧输入。三次故障是显式注入测试，独立于正常生产浏览器的零错误记录。

合同测试另覆盖：未知题、旧 revision、跨题 token、错笔记、错回应、真实/合成混淆、重复来源、非法引用、uncertain/partial/covered/unrelated、deadline、取消与幂等键冲突。旧 101 Sample Golden Path 回归通过。

真实调用见 `live-smoke.json`：24 条合成材料的 102 教室，非示例观点得到 Live Candidate（约 5.3 秒）、prepare（约 4.3 秒）、complete（约 7.2 秒），全部 HTTP 200，原输入保留、证据属于本班。数据模式始终 mock，模型执行模式分别为 live，未把合成材料称为真实知乎来源。仅使用专门编写的 QA 输入，未保存用户私人笔记或签名 token。

## Visual Evidence

截图位于 `output/playwright/TASK-026/`，生产构建复验覆盖开发期截图：

- `home-{1440,1366,390}.png`：三教室目录与学习路径。
- `{101,102,103}-ready-{1440,1366,390}.png`：来源、人数、布局与组名。
- `{101,102,103}-candidate-{1440,1366,390}.png`：原教室内的 Candidate 与可核对证据。
- `{101,102,103}-seated-{1440,1366,390}.png`：新增自己的座位与产物出口。
- `102-normal-motion-ready-1440.png`、`102-normal-motion-candidate-1440.png`、`102-seatmate-1440.png`：普通动效与真实阶段推进。
- `recovery-1366.png`、`switch-clean-1366.png`：保留输入的恢复与切题后清空。
- `{101,102,103}-classnote-{1440,1366,390}.md`：浏览器实际下载的示例产物。

`production-1440.log`、`production-1366.log`、`production-390.log` 逐题记录完整交互、下载成功、焦点恢复、下一教室与零 page error。`motion.log` 验证普通入场、圆桌跳过、座位揭示与同桌匹配。截图经过目视检查。

## Golden Path Result

PASS：三题 × 三视口，共九条生产构建完整示例流程；101 真实 Snapshot 路径、102/103 合成路径、失败恢复和逐步浏览器操作均完成。

## Known Limitations

101 仍只有 12 条经过核验的真实摘要，未增加虚假来源。102/103 是明确标注的合成讨论，知乎出口为相关问题搜索。任意输入仍可能得到无候选或服务错误，只有精确示例可回退。真实调用耗时是单次功能验证，并非性能统计。笔记仅主动下载，不跨教室自动保存。

本轮交付为代码与本地生产预览，未更新既有公网部署。开工前已有的 AGENTS.md、next-env.d.ts 改动保留，不计入本 Task。

## Follow-up or Rollback

如需回退，仅回退 TASK-026 代码、新增合成资产和文档。旧 Snapshot、依赖、模型配置及密钥未修改。
