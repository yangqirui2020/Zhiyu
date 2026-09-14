# TASK-022 Verification

Status: Classroom asset and reading path PASS。个人 Candidate / 学习写入路径由 TASK-023/024 继续，当前不能宣称完整交付。

## Frozen asset

`active.json` 指向 `snap_zhihu_20260914174541651`，来源采集于 2026-09-14T17:41:34.317Z（北京时间 09-15 01:41）。真实问题：零基础想学编程，应该从哪门语言开始入门比较好？官方问题 ID 1997626624837951772。

官方返回 15 条摘要，保留 **12** 条；2 条跑题由模型拒绝，1 条工具推荐经人工复核发现没有说明理由，模型将结论重述为理由，因此额外拒绝。拒绝原因保存在 generation-report/manifest，保留 raw.json 供核对。所有来源/观点/学生一一对应，全部引文取自服务端存储的对应摘要，未推断作者名或赞同数。

本地 BGE 512 维、CLS + L2、Ward + 欧氏距离。轮廓系数选 k=2，组规模 9/3，约 0.094；区分度低，组内仍存在立场差异。页面采用限定标签（按基础与目标选语言 / 入门语言各有所荐）、low confidence 与样本限制，不把分组说成一致立场或社会共识。这个数值不用于宣称算法质量领先。

此前生成的 13 条及未调整布局版本保留为历史生成记录，只有 active pin 是本阶段验收版本。后续 Snapshot 新增 Sample 分析和学习资产，必须再生成新版本。

## Implementation

- 可重复生成脚本：官方采集 → 有证据观点抽取 → 本地 Embedding → 选 k / Ward → 组标签 → 真实叙事 → JSON + checksum。
- 模型超长/非法 JSON 在第一轮生成中被拒绝；增加输出预算、逐条缓存和限定一次格式重试后完成，不绕过 Zod。缓存仅公开素材与明确 Sample。
- 人工修正示例 before，始终等于实际提供的 Sample note；示例 after 补充来自该示例回应，不能编造原先相信的内容。
- 加入模型下载校验命令 `npm run setup:embedding`，5 个固定文件均通过 SHA256；weights 只在 node_modules/.cache。
- 默认加载真实 Snapshot，显式非生产 DATA_MODE=mock 才读取 Fixture；实际 API meta 带 snapshotId / capturedAt。
- build 前校验所有 asset checksums / schema / 跨引用；Next tracing 携带 Snapshot JSON，未携带 transformers/onnx runtime。

## Verification

- typecheck / lint / **44 tests** / production build PASS，git diff --check PASS。
- 首页、课堂 HTTP 200；Classroom API=200/snapshot/12；未知题=404。详见 http-smoke.json。
- 1440×900、1366×768、390×844 浏览器截图：output/playwright/task022-{desktop,laptop,mobile}-final.png。检查后仅调整两组资产坐标，保持现有设计与布局，手机学生可在顶部操作。
- 文字列表展开成功，Tab + Enter 打开真实学生与摘要来源；手机 evidence 截图保存。Reduced Motion 下圆桌进入黑板/观点输入。浏览器 console **0 errors / 0 warnings**，未观察到 hydration 错误。
- Snapshot 当前阅读路径：进入课堂 → 学生/来源 → 观点组 → 圆桌 → 黑板/输入 PASS。完整 Snapshot Sample Golden Path 和个人输入失败恢复仍在后续发布门；不把本阶段阅读 QA 当作完整学习流程验收。

## Remaining release requirements

TASK-023：真实自由输入分析与精确 Sample，替换现有 Fixture Analyzer；TASK-024：绑定本次输入的追问与学习结果；TASK-025：公网发布、完整 QA、产品说明书、提交回执。当前页面对个人分析展示接入中提示。
