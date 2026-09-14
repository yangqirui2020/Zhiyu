# TASK-023 验证报告

- Date: 2026-09-15 02:12 Asia/Shanghai
- Result: PASS（个人观点分析阶段）；完整个人学习产物由 TASK-024 验证，本阶段不部署。
- Snapshot: snap_zhihu_20260914180513051，12 条真实回答摘要、2 组；新增不可变精确 Sample，原课堂来源与模型归纳不变。

## Acceptance

1. 三组真实 DeepSeek 测试：非示例环境受限观点 → success；常见 Python 建议 → covered/no_candidate；公园散步跑题 → unrelated/no_candidate。耗时约 1.6–2.4 秒，仅是三次样例测试，非总体性能基准。见 live-smoke.json。
2. 模型只返回 evidenceId；服务端解析真实笔记区间/当前来源，未知引用、错类型、错 revision 均拒绝。covered/partial/uncertain/跑题/支持不足不亮座。Unicode 切片不拆代理对。
3. 精确 Sample 在原文本、hash、revision、关系全部匹配时读取。缺少模型配置时，相同输入可披露 Live→Sample；添加空白或修改正文均不回退。相同幂等 key 配不同输入拒绝，短期有界实例缓存不承诺分布式 exactly-once。
4. 客户端用服务端 meta 显示实际 Live/Sample，异常响应改为中文提示，no_candidate 说明三个维度的原因。
5. typecheck / lint / 54 tests / build / git diff --check PASS。HTTP Sample 200、key 冲突 400、过期 revision 409、短输入 400，见 http-smoke.json。

## Browser

Playwright CLI managed Chrome，生产构建，Reduced Motion 开启。真实自由输入 → Live Candidate；Reset → 示例；注入 503 → 原输入保留 → 取消注入 → Retry → 精确 Sample 成功。观察到的 console error 仅来自主动注入的 503 资源请求，正常真实请求无 JS/hydration 错误或警告。

1440×900、1366×768、390×844 操作与截图：output/playwright/task023-final-*.png；手机故障恢复 task023-retry-390.png。既有移动端抽屉遮住部分地图，文字视图和主操作可达；未改 Frozen 布局。引用长内容在独立面板滚动，底部操作保持可用。

## Limits

只分析一条主要主张；全部比较当前小样本，不宣称全站新颖性。模型判定仍需用户核对。Sample 初次试算判 partial，因此未写入资产；细化“核心方法覆盖”通用判据后生成通过的版本，未强制修改模型结论。个人同桌/回应仍待 TASK-024 替换，禁止将此阶段直接对外声称完整个人闭环。未记录用户真实笔记，QA 输入均为人工测试文本。
