# Contribution Contract — v1

依据 PDR-0006。所有新类型从 src/domain/schemas/contribution.ts 的 Zod 推导，不修改 learning-turn API。

ExperienceInput：kind（experience/condition/question/counterexample）、origin（self_report/example）、event/action/outcome。三段均为原始文本，合成为标签明确的 noteText 后交给现有签名追问 API；原始卡片不靠模型重写。

经验追问须直接面向“你”，仅一个问号并以问号结束；不能将“用户提到/未说明”等内部分析当作问题。服务端未通过时使用现有 STRUCTURED_OUTPUT_INVALID 与有限重试，不新增错误码。对于文本明确声明的虚构/示例情境，生成不得擅改为真实亲历。

ContributionCard：questionId/revision、input、实际回应、summary、boundary、AI/人工整理来源、prepared evidenceIds；仅在用户确认时建立。模型草稿与用户最终表述分别保留，不称核验过的事实。用户自述与虚构示例固定披露。

Flow：closed → editing → preparing → challenge → completing → review → published；网络错误保留输入和当前阶段，可 Retry；editing/challenge/error 可显式选择 manual review。取消/撤回/Reset 清除相关请求标识，晚到结果无效。修改原始经历必须重新 prepare；修改回应必须重新 complete。review 编辑仅改 summary/boundary，不伪改原始材料。

关闭面板保留 pausedFlow 和原始输入；正在 prepare 时恢复 editing，正在 complete 时恢复 challenge，可从入口继续。撤回与 Reset 清空全部会话材料。人工整理路径的进度步骤标注“本人整理”，不伪称完成模型追问。

Board：confirmation 后显示一条当前会话用户材料；真实来源数组、聚类数和 Snapshot 校验和不变。可打开卡片、撤回，切题/刷新不持久化。

Invite：固定题目/邀请问句/公开教室地址及 #experience 入口。禁止个人经历、回应、token 进入链接、邀请图或默认分享文本。用户主动分享/复制/下载，无后台发送、自动点赞/评论或伪造人数。
