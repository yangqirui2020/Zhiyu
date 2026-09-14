# TASK-020 Verification Report

- Date: 2026-09-15（Asia/Shanghai）
- Result: PASS — 调研与计划交付；不代表真实数据产品已交付
- Branch: `task/TASK-020-deadline-audit`
- Scope: 仓库审计、基线验证、交付计划、范围建议、后续任务和求职学习路线

## 已执行验证

| 验证 | 结果 |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS，27/27，6 suites |
| `npm run build` | PASS，生产构建成功 |
| 生产服务 GET `/` | HTTP 200，HTML |
| 生产服务 GET `/classroom/q_learn_programming` | HTTP 200，HTML |
| GET Classroom | HTTP 200，mode=mock，40 students，5 clusters |
| POST 精确 Sample | HTTP 200，mode=sample，success，1 seat |
| POST 非示例观点 | HTTP 200，mode=mock，no_candidate，0 seat |
| `git diff --check` | PASS |

HTTP smoke 使用本机 production server 3015 端口，无第三方模型或知乎数据调用。没有使用用户真实笔记。没有修改业务源码。

## 实际交付

- `docs/operations/SUBMISSION_SPRINT_2026-09-15.md`：缺口、依赖、上午 10 点倒排、两档交付标准、截止门、用户交接、Agent 学习和简历证据。
- `docs/proposals/PROP-0005-real-data-delivery.md`：真实数据与学习结果的必要范围变化，具体未知合同不提前批准或假定。
- TASK-021～025：Provider/合同、真实 Snapshot、Live Candidate、个人学习闭环、发布与提交五个顺序任务。

## 外部核验与限制

- 用户手册 `https://my.feishu.cn/docx/Mc80dR5XvoPaYDxcTasc04POnjd`：web 读取失败；内置浏览器调用超时；直接公开 HTTP 读取出现登录重定向循环。未得到正文。
- CUA 浏览器清单只有内置浏览器，没有可读取的用户外部已登录标签页。没有尝试读取浏览器 Cookies/凭证。
- 已定位本届官方活动入口，未核验提交字段、指定服务、截止时刻；上午 10:00 为保守排程假设。
- 已读 nanobot 官方 architecture.md，定位 runner/tool registry 源码；未安装/集成/运行 nanobot。
- 已读取百度官方 J100835 校招页面，作为技能路线的一个实例；未把它表述为招聘市场统计。
- 工作区不存在 `.env.local`；仅检查相关环境变量是否存在，当前均未设置。未输出任何密钥。
- 无本地 `.vercel` 配置且未获线上地址，不据此断言用户从未部署。

## 未执行与下一轮放行条件

- 本轮未重新执行浏览器 Golden Path/视口截图。TASK-019 的截图与浏览器 PASS 是历史记录。
- 真实 API、Embedding、模型、Snapshot、数据许可及公网路径需要在后续任务验证。
- 等用户提供开发手册关键文本、服务配置和部署信息，TASK-021 才能具体冻结适配方案。
- 动态学习 API/结果合同仍属 Proposed，不能把任意输入的通用后半段当成现成功能。
- 比赛提交尚未进行，只有正式回执才可标记已提交。

## 变更保护

开工前已有 AGENTS.md、next-env.d.ts 未提交修改；本轮未主动编辑或回退这些文件。审计文档在独立任务分支新增，未 commit/push，也未发布外部消息。

## 后续配置交接复核（2026-09-15 00:49）

- 用户提供 DeepSeek 官方 endpoint 与 deepseek-flash；已写入 `.env.local`。Git check-ignore 确认该文件被忽略，无密钥进入报告、样例配置或业务源码。
- GET `/models`：HTTP 200，773ms，返回 deepseek-flash / deepseek-v4-pro。
- POST `/chat/completions`：HTTP 200，986ms，关闭 thinking 的最小 JSON 请求返回符合预期的对象；48 input + 5 output = 53 tokens。仅使用非敏感连通性测试文本。
- 这证明凭证及一次 JSON completion 可用，不代表复杂业务分析质量、延迟或 SDK Adapter 已验证。模型名称保留用户指定值。
- 证据：`deepseek-smoke.json`。实际业务仍使用旧 Mock，不宣称已接入产品。
- 用户确认目前仅本地运行；公网部署尚未进行。Embedding 服务及知乎内容凭证仍待确认。
- Windows Computer Use 技能已发现用户 Edge 窗口，但恢复最小化窗口后，工具因无法可靠识别当前 browser URL 自动终止本轮 UI 操作。遵守终止要求，未继续 UI 或尝试绕过；手册正文仍未取得。见 BLOCK-001。
