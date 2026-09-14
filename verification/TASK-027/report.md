# Verification — TASK-027

- Result: PASS
- Date: 2026-09-15（北京时间）
- Product commit: 2327583（TASK-026）
- Deployed code and public assets: 808756061fb6abc958637a8c2f330946a0533d26
- Branch: task/TASK-027-three-classroom-submission
- Production: https://zhiyu-yixi.vercel.app
- Deployment: dpl_F4UTjwFEWsLMfcq9K4dGJJBtxord
- Version metadata: release.json；独立附件与总包校验：public-assets.json、package-check.json。

## Acceptance Criteria

- [x] A. 当前提交文档统一为三教室：101 为 12 条真实知乎摘要 / 2 组，102/103 各 24 条合成材料 / 4 组。重写 PDF 原稿、项目介绍、讲稿、提交字段；更新 README、求职说明与发布手册。历史单教室记录保留并标明已被当前版本替代。
- [x] B. PDF 6 页、558985 字节，Poppler 渲染全部页面并逐页目视检查通过。封面为三教室首页。新视频 129.92 秒、1366×768、25 fps、10668444 字节；逐间完整操作、下载笔记与切题。开头/中段/结尾抽帧正常。公开附件 SHA-256 与本机文件完全相同。
- [x] C. 公网 3 教室 × 3 视口的九条示例流程通过；每题完成 Candidate、签名追问、回应整理、入席、下载与下一题。101 非示例观点通过真实模型全程入席与下载。102 的独立 API 验证正确保留合成来源身份。
- [x] D. 66 tests、typecheck、lint、生产 build 通过。发布构建生成三间静态页；源码分支已公开推送。源码 ZIP 共 260 文件；从其解压目录重新 npm ci（454 packages）和 npm run build 成功，含真实资产预检与三教室路由。
- [x] E. 总包共 24 项文件，含源码 ZIP、PDF、录屏、图标、封面、讲稿、提交信息、8 张截图、3 份下载示例、验收报告、求职说明、可编辑说明书、版本与 SHA-256 清单。ZIP 完整性、必需文件、实际本机密钥值扫描与公开附件一致性均通过。旧稳定包名也替换为同一个新版包。

## Production browser evidence

production-1440.json、production-1366.json、production-390.json：三间均通过，页面错误数组为空。覆盖键盘 Enter/Escape/焦点恢复、Reduced Motion、来源详情、12/24/24 人文字列表、完整示例、实际下载和切题后清空个人输入。各阶段截图在 output/playwright/TASK-027。

live-ui.json：101 使用人工编写的非示例观点及回应；Candidate success、prepare prepared、complete completed 均为 HTTP 200 / Live。原观点与实际回应保留，浏览器完成入席和下载；现场画面 live-101-seated-1366.png。仅 QA 输入，不含用户私人笔记。

live-production.json：102 材料接口为 Mock / 24 条；Candidate、prepare、complete 均为 Live / HTTP 200，约 4.6 / 3.8 / 7.6 秒。此次 Candidate 为合法 no_candidate，因此这条记录只用于接口行为与来源隔离验证，不将它描述为 UI 入席成功。原输入和本班证据检查通过。实时端到端入席以 101 的 live-ui.json 为准。

public-assets.json：匿名浏览器完整读取公开文件并计算 SHA-256，与本地文件逐项匹配。PDF 为 application/pdf，视频为 video/webm，均 HTTP 200。无需登录应用或 Vercel。

## Reproducible source and packaging

源码来自 Git 提交 8087560；包含应用、领域合同、真实 Snapshot、合成目录、Provider、测试、开发文档、锁文件、环境变量空模板和全部公开媒体。剔除历史 QA 图片、临时输出与构建缓存；没有 .env.local、API 密钥、签名密钥、node_modules、.git 或浏览器会话。源码包中的任务状态反映该提交时点，最新发布验收在本报告。

源码 ZIP 解压路径为 output/submission/source-check/Zhiyu，独立安装依赖后生产构建通过；日志 source-install.log / source-build.log。嵌套在当前仓库内验证产生 Next.js 多锁文件根目录提示，但构建和三间路由全部成功。没有把本机模型凭证复制进解压目录。

package_submission.py 用固定 Git 提交打源码包，并检查源码中的公开 PDF/视频与工作区字节一致；实际密钥值只在内存比较，不打印或写出。打总包后重新打开 ZIP 逐项校验 CRC 和文件列表。SHA256SUMS.txt 覆盖除自身以外的文件，RELEASE.json 包含素材大小/哈希、代码提交和部署标识。最终总包哈希与大小在 package-check.json，避免把包自己的哈希循环写入包内。

## Warnings and boundaries

浏览器无 console error、未处理 page error 或 hydration 错误。Next.js 曾提示 CSS preload 暂未使用；Live UI 最后一轮记录到 4 条此类提示，不影响已验收流程。依赖安装提示部分既有工具版本 deprecated，未新增或升级依赖。不是零 warning 的性能背书。

录屏来自同版本机生产构建、使用精确示例，无旁白；它不是实时调用录屏。三份随包笔记也是明确示例。真实模型功能单独通过公网操作验证，不以少量验收宣称准确率、学习效果或延迟统计。

101 的真实 Snapshot 没有修改；102/103 是静态 TypeScript 合成材料，不需部署时读写新增 JSON 文件。运行时与发布配置未变。用户原有 AGENTS.md、next-env.d.ts 改动未提交，也未进入源码归档。

## Submission and rollback

本次完成三教室公网更新、代码推送与材料打包，未取得知乎作品提交成功回执；TASK-025 继续保留该待办。线上更新不等于已报名投稿成功。

如需恢复历史单教室部署，可用 dpl_Fv5pRx6VJRg4ajB3pMYsgkwAwp3w；当前三教室恢复点为 dpl_F4UTjwFEWsLMfcq9K4dGJJBtxord。保留不可变真实 Snapshot。当前总包：docs/submission/知遇一席_三教室新版_提交材料包.zip。
