# TASK-028 验收报告

Status: PASS。2026-09-15 完成产品、生产与参赛材料更新；知乎投稿由队长最终操作。

## 范围与依据

用户选择“经验入席 + 黑板更新 + 分享邀请”，并确认尚未提交。依据 PROP-0008、PDR-0006 和 Contribution Contract v1。原 Candidate 规则、12 条真实摘要的 Snapshot、两间各 24 条合成材料及 API 合同保持不变。

## 已验证

- 81 项自动化测试通过：原 66 项加贡献与追问校验、贡献状态、原文保留、本人确认、草稿与最终表述区分、示例身份、取消与晚到、修改原输入、隐私分享及模型提示边界。
- typecheck / lint / build PASS；lint 排除 output/submission 内上次解包复验的生成副本，其余工程受检查。未修改依赖或锁文件。
- 本机生产 http://localhost:3008 的 3 教室 × 3 视口新增流程与 9 条原有 Golden Path 通过。包括确认前后、编辑卡片、撤回、第二次操作、跨题、下载、复制、邀请图、键盘、Reduced Motion；页面无运行异常和横向溢出。
- 实际 API：101 用不属于预设样例的虚构验收情境调用模型，追问重名文件与缺失照片日期的验证标准；实际回应参与整理，保留“尚未验证”的边界。记录 live-local.json，明示 syntheticQaInput，不冒充真实用户经历。
- 失败恢复：注入服务不可用后重试、原文保留、取消并继续、晚到错误无效；明确人工整理；剪贴板拒绝、邀请图片生成失败、系统分享取消均有恢复提示。刷新清空会话材料。
- PDF 六页已逐页渲染检查；正文、表格、中文、链接与黑板截图无裁切。原稳定 PDF 文件被本机阅读器占用，本轮另存“知遇一席_经验入席版_产品说明计划书.pdf”，公开附件使用新版相同字节。

## 证据入口

- tests.txt：测试结果。
- contribution-1440.json / contribution-1366.json / contribution-390.json：新增流程本机生产验收。
- legacy-1440.json / legacy-1366.json / legacy-390.json：原学习流程九条回归。
- recovery-local.json：失败、取消、人工整理与分享恢复。
- live-local.json：实际模型结果摘要，无签名 token 或凭证。
- output/playwright/TASK-028：截图、邀请图与实际下载产物；数据均为明确的示例/虚构验收输入。
- output/pdf/TASK-028-plan-1.png 至 -6.png：PDF 渲染证据。

## 可信度与限制

新增材料仅在当前课堂会话展示，刷新、切题、撤回、Reset 后清除，没有公共贡献库或 OAuth。邀请不携带个人经历或签名，不自动发送消息。暂无作品专属链接，只提供真实活动广场入口。81 项测试与小样本真实调用不构成准确率、P95、学习提升或人气效果统计。

浏览器脚本调试曾遇到 Windows 剪贴板换行归一化及读取焦点等待；实际复制内容已核对，重复验收检查复制成功反馈及邀请原文。最后的生产验收使用独立浏览器顺序执行，避免测试共享页面互相干扰；调试失败不计为 PASS。




## 最终公网与材料

- 生产地址：https://zhiyu-yixi.vercel.app
- 最终代码与公开附件提交：f2aa5d810265909020d2d1254781b1f94a6856cb。
- 最终部署：dpl_C2XoQB19Zfi1oj5LYdL5u4N9NxYE，https://zhiyu-yixi-ji3hkzg43-qirui-era.vercel.app，Vercel READY。
- 三视口 × 三教室 × 新旧两条路径，共 18 条公网操作通过。记录 public-contribution-*.json / public-legacy-*.json，截图在 output/playwright/TASK-028/public/。
- 公网首次 Live 验收发现模型用内部分析代替问句；随后增加经验专用的单个直接问句校验与有限重试，强化虚构材料身份和生成边界。最终 Live 复验通过 prepare / 注入 complete 503 / 保留回应 / retry / complete / 修改确认 / 下载；实际结果见 live-production.json。初次输出保留在 live-production-before-refinement.json，不计为最终问句质量通过。
- 18 条 UI 验收基于 e6d8653；最后 f2aa5d8 只收紧服务端经验追问、增加测试和对应说明，没有改 UI、数据或公开媒体。最终补验直接问句、实际生成、完成阶段错误恢复及公开附件；未无故重复全部 UI 流程。
- 81 项测试全部通过，最终类型检查、lint、生产 build 通过。参赛 ZIP 解压安装 454 个依赖后构建成功，替换为最终源码重建成功，解包后的 81 项测试通过。记录 source-build.txt / source-tests.txt。嵌套复验目录触发 Next.js 多锁文件提示，实际构建完成；未新增工程依赖或修改配置掩盖提示。
- 6 页 PDF 已逐页检查；公开 PDF 480104 字节，视频 9797722 字节，均 HTTP 200，SHA-256 与 Git 中公开附件和本机文件一致，见 public-assets.json / release.json。
- 视频 125.40 秒、1366×768、25 fps、无旁白。录于 e6d8653 本机生产构建：101 精确示例三次请求；102 虚构经历两次 Live；103 明确人工整理。后续只改问句校验与提示，录屏中的直接追问满足新约束，UI 与媒体保持相同。全过程无页面异常，记录 recording.json。
- 提交包 36 项文件；参赛源码 296 项文件。最终包验证 ZIP CRC、必需文件、实际凭证扫描、公开媒体与 Git 一致性，见 package-check.json。源码版本固定 f2aa5d8，包含开发时点文档；总包 10_验收报告.md 与最终分支上的本报告记录完成后的验收。
- 旧版本恢复点：TASK-027 的 dpl_F4UTjwFEWsLMfcq9K4dGJJBtxord。未更改真实 Snapshot、原 Candidate 规则、依赖、用户 AGENTS.md / next-env.d.ts 或本机凭证。

## 尚需队长完成

当前明确“尚未提交”，未获得作品专属链接、点赞数据或投稿回执。队长须于 9 月 15 日 10:00 前完成知乎最终提交，按实际情况确认身份与声明并保存回执。提交后可在本人邀请消息中附作品页链接，邀请真实体验者自愿评价。当前未接 OAuth，不宣称平台已计入邀请产生的使用量，也不保证人气奖结果。
