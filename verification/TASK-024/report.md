# TASK-024 Verification

Status: PASS (2026-09-15 03:01 CST)

## 验收结论

个人观点 → 当前真实来源匹配 → 系统一次追问 → 实际回应 → AI 整理笔记 / 我的一席 / 三条提纲 → 知乎原问题，已完整连通。生产数据为 `snap_zhihu_20260914185414007`，12 条真实摘要、2 组；入席后 13 人，102/103 仍为预览。

## 自动化与真实调用

- `npm run typecheck`、`npm run lint`、`npm test`（63/63）、`npm run build`、Snapshot checksum/domain/reference 校验 PASS。
- 两组非 Sample 的人工 QA 输入，在 V4 Pro 上分别得到不同同桌和个人结果；prepare + complete 共 8.892 秒 / 7.685 秒。第二组明确表示观点未改、测试门槛待补充，结果没有强行宣称改变。见 `live-smoke.json`、可复现的 `live-smoke.ts`。仅两例实测，不是质量统计或 P95。
- Pro Candidate 三例：新切入点 success / 一席，重复已覆盖和跑题均 no_candidate / 零席；4.624 / 4.783 / 2.436 秒。见 `candidate-pro-smoke.json`。
- 生产本机 HTTP：精确 Sample prepare/complete 200（46 / 7 ms）；篡改 token 400；错误 revision 409；非 Sample prepare 200 Live（3.169 秒）。所有响应 no-store。见 `http-pro-smoke.json`。
- HMAC 篡改、过期、换密钥、笔记/追问/回应/版本错配、非法证据、引用角色互换、格式重试、无响应 SDK 取消、过时 response、pending 编辑、Reset / 第二次体验均有测试。

## 浏览器 Golden Path

Chrome 生产构建，Reduced Motion=reduce。在 1440×900、1366×768、390×844 各自从头完成 Sample 全流程，复制笔记显示「已复制笔记」，到达原问题 URL，随后 Reset。最终截图：`output/playwright/task024-final-{1440,1366,390}.png`、`task024-notes-top-{1440,1366,390}.png`。桌面与手机均已视觉检查，主要按钮可操作，内部长文可滚动。

准备追问和整理回应分别注入 503：重试入口出现，回应原文保留，移除故障后均能恢复。截图 `task024-prepare-retry-390.png`、`task024-complete-retry-390.png`。故障过程产生两条预期 HTTP 503 资源错误；新导航后的三视口正常路径 pageerror/console error 断言为零，无 hydration warning。

键盘 focus + Enter 可展开 Canvas 等价 DOM 列表（12 位真实学生）。三行提纲展开、复制反馈及正确知乎问题链接均通过；没有自动发布回答。

## 已解决问题与边界

02:31 后 Flash 连续生成超时，账户可用；原记录保存在 `http-smoke.json`。用户明确授权后按 PROP-0006 / ADR-0012 切换 Pro，恢复真实生成。旧课堂/Candidate 与新学习资产分别保留各自真实模型元数据。显式取消保护确保 SDK 无响应时在 deadline 返回错误。

样例参考回应改为明确的第一人称人工示例，再由 Pro 生成匹配结果；没有把人工文本伪装成模型输出或真实用户输入。任意输入不会套用该结果。

UI 延续原有布局：手机长黑板占据较大空间，学习面板独立滚动；Canvas 可用 DOM 列表替代。AI 整理仍可能不准确，保留原文与证据供人核对。未实现全站检索、多 Agent、数据库、长期记忆或生成完整回答。公网部署与比赛回执属于 TASK-025，尚不在本报告中声称完成。
