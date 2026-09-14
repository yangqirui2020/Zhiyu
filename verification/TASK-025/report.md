# TASK-025 发布验收

状态：应用发布 PASS；材料已备齐，最终提交待队长操作和回执。

## 发布结果

- 公共生产地址：https://zhiyu-yixi.vercel.app ，无需应用账号或 Vercel 登录。
- Vercel qirui-era / zhiyu-yixi；业务部署 dpl_8T9PS2CqfvdR2ZY2KuweT9kyE1Co，真实 Snapshot snap_zhihu_20260914185414007。
- 远端 npm ci、Snapshot prebuild、Next build 通过；远端安装 audit 0。纯静态提交材料随随后部署发布，不改变业务代码。
- hkg1 函数区域由生产 response-header x-vercel-id 核实；API cache-control 为 no-store。

## 公网浏览器验收

2026-09-15 03:06–03:16 CST，未登录应用的隔离 Chrome：

1. 公网首页 → 教室、个人观点 → Candidate、匹配追问、实际回应 → 笔记 → 复制 → 我的一席 → 入席 → 正确知乎出口，PASS。
2. 网络记录 19 为 Candidate POST 200，20 为 prepare POST 200，21 为 complete POST 200；页面分别明确标 Live，原观点与实际回应均显示。输入为人工 QA，不含用户个人资料。截图 `output/playwright/task025-live-{candidate,peer,notes,final}-1440.png`。
3. 在 1440×900、1366×768、390×844 各自完成精确 Sample 全流程、Reset；pageerror 断言为零。截图 `task025-sample-final-{1440,1366,390}.png`。Reduced Motion=reduce；DOM/键盘、复制反馈和本机错误恢复证据继承同一业务构建的 TASK-024。
4. 正常公网流程没有 console error 或 hydration warning；首页预取课堂 CSS 出现一次「preload 暂未使用」提示，无功能阻断。未为清除这个非阻断提示改业务代码。
5. 精确 Sample 三个请求的 browser resource duration 为 440/440/555 ms，见 sample-browser-timings.json；各阶段一次 HTTP POST。小样本实测，不作为 P95 或服务 SLA。真实 Pro 的本机延迟样例见 TASK-024。

本机 Node CLI 对 Vercel 域名两次 TCP 连接超时，而浏览器访问和生成成功。`production-smoke.mjs` 保留为其他网络可复现脚本，不能写作已通过；本次公网结论基于实际浏览器操作和网络记录。仍需队长用自己的浏览器或手机流量复核。

## 材料验收

六页 PDF，中文字体嵌入；全部页面已渲染目检。修复了封面图片初次缩放的溢出，复查封面无裁切。正文含目标场景、交互链、AI/数据实现、真实边界、验证、社区价值、后续计划及团队信息。PDF 约 441 KiB，不包含密钥。

PNG 图标 512×512、封面 1440×900；约 3:02 的静音浏览器示例录屏，1366×768，已检查首/中/尾帧，无密钥或不相关账号内容；它是辅助演示，不冒充 Live。

README、发布恢复说明、两分钟讲稿、提交字段、Agent 学习与简历草稿已更新。当前技术定位为 AI 工作流，未宣称多 Agent、MCP、长期记忆或学习成效。

## 未完成项

用户已报名，官方投稿入口已确认；Edge 未连接到可用浏览器工具。需要队长进入作品编辑页核对实际必填项、真实声明、上传并提交，提供成功回执。没有回执之前 TASK-025 不标 Done，也不声称比赛作品已提交。
