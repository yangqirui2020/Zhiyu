# 发布与恢复说明

当前生产地址：https://zhiyu-yixi.vercel.app

当前为 TASK-027 三教室版本：101 真实 Snapshot，102/103 合成目录；均支持完整个人学习与笔记下载。部署 dpl_F4UTjwFEWsLMfcq9K4dGJJBtxord，代码/附件提交 808756061fb6abc958637a8c2f330946a0533d26。当前验收与 SHA-256 见 verification/TASK-027；下文首次发布记录为历史恢复点。

项目：qirui-era / zhiyu-yixi。运行地区 hkg1（已从生产响应 x-vercel-id 核实）；构建机器地区 iad1 与运行地区不同。首次发布 ID：dpl_8T9PS2CqfvdR2ZY2KuweT9kyE1Co。

## 运行配置

生产仅配置 STRUCTURED_OUTPUT_PROVIDER、STRUCTURED_OUTPUT_BASE_URL、STRUCTURED_OUTPUT_MODEL、STRUCTURED_OUTPUT_API_KEY、LEARNING_SESSION_SECRET、DATA_MODE。模型为 deepseek-v4-pro。API 密钥及签名密钥以 Vercel Secret 保存，仅通过标准输入上传。知乎采集密钥、本机备用密钥与向量模型缓存未上传。

`.vercelignore` 排除本机环境文件、依赖缓存、浏览器记录、文档与测试；只读 Snapshot 随应用构建；102/103 的合成材料是静态 TypeScript import，随服务端代码打包，不需额外落盘。Vercel 不运行采集或 Embedding。`vercel.json` 使用 Next.js 构建，安装 npm ci，无新增依赖。

## 发版检查

1. 在 Task 分支修改已授权文件；本机 `.env.local` 不提交。
2. 运行 typecheck、lint、test、build，确认 active Snapshot 校验通过。
3. 用 Vercel CLI `vercel deploy --prod --scope qirui-era` 发布；不要使用暴露源码的 `--public` 选项。
4. 用未登录应用的浏览器打开生产别名，分别走精确 Sample 与个人输入；确认 Live / Sample 标记、引用、重试及正确知乎链接。
5. 保存 deployment ID、Snapshot ID、Git commit 和验收证据。改变环境变量后必须重新部署才能生效。

## 失败恢复

模型超时：保留用户输入并重试。精确示例可继续；修改后的输入绝不套用旧 Sample。Flash 曾出现连续生成超时，Pro 经授权验证可用，不自动切回 Flash。

学习 token 过期：保留可见输入，重新开始本次学习。不得把过期签名重试描述为可恢复。

发布失败：以已验证生产 deployment 为恢复点，用 Vercel 项目部署记录恢复；不要覆盖历史 Snapshot。当前真实版本为 snap_zhihu_20260914185414007。

来源数据更新：新建 Snapshot，重新生成或合法重绑定相关资产并校验，变更 active pin 后构建。禁止在生产请求内写 JSON。

网络检查：本次浏览器直接访问公开别名、真实 POST 与示例流程成功；本机 Node CLI 直连 Vercel 出现 TCP 连接超时，因此不能据此宣称所有网络均可访问。建议队长用自己的浏览器及手机流量复核，发生访问问题时保留具体运营商/网络和页面提示。

## 参考

[Vercel CLI 发布](https://vercel.com/docs/cli/deploy)、[环境变量](https://vercel.com/docs/cli/env)、[运行区域](https://vercel.com/docs/regions)。本机 CLI 59.16.0 与官方文档核验于 2026-09-15。

历史单教室静态材料部署：dpl_Fv5pRx6VJRg4ajB3pMYsgkwAwp3w（2026-09-15 03:26）。公开 /product-plan.pdf 与 /demo.webm 均已验证 HTTP 200。
