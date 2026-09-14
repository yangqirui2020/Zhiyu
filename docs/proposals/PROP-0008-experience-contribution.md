# PROP-0008 — 经验入席、黑板更新与分享邀请

## Problem
已有三教室支持观点学习，但缺少让普通用户带入亲历、看见贡献并邀请朋友参与的入口。用户明确希望冲击人气奖，并选择“经验入席 + 黑板更新 + 分享邀请”。

## Evidence
用户 2026-09-15 当前选择及所附产品建议；TASK-027 已验证三教室。官方手册的人气奖依据包括活动广场点赞、使用和评论，OAuth 登录人数也是参考；用户确认尚未提交，无作品专属页链接。

## Impact
新增与 Candidate 并列的用户自述贡献路径，不再以覆盖较少作为参与条件；Candidate 三项判断不变。发生经过、做法、结果由用户填入；现有签名学习 API 提供一次来源约束追问和整理草稿；用户修改并明确确认后，当前课堂黑板新增一条有身份标记的材料。黑板的历史来源及分组不改，不声称改变群体共识、训练模型或持久化给所有人。

## Alternatives (include keep current)
保留现状无法满足参与诉求；大规模条件重排/公共贡献数据库/OAuth 接入扩大验收范围。采用无新增依赖的短贡献路径和用户主动分享，可复用已验证 API、保留旧 Golden Path。

## Migration Cost
新增贡献 Zod Schema、独立 reducer、表单/确认卡/分享组件；现有画布增加黑板安全高度和参与者文案。使用既有 learning-turn 信封、签名和引用校验，不新增厂商 SDK，不修改 Snapshot。当前临时输入不迁移、不持久化。

## Recommendation
本轮实施经验入口、一次实际追问、可编辑且可撤回的贡献卡、黑板新增材料、下载贡献卡及不含个人内容的分享邀请。支持显式虚构经历示例与明确人工整理出口，人工路径不伪装模型成功。邀请只复制/下载或打开系统分享菜单，不自动发送消息。活动广场链接明确为活动入口，非伪造作品点赞页。

## Affected Files / Contracts / Tasks
TASK-028、PDR-0006、CONTRIBUTION_CONTRACT.md。保留 rc.2 API、Candidate Contract、模型配置。后续沿当前用户授权同步生产及参赛材料。

## Rollback
回到 TASK-027 生产部署 dpl_F4UTjwFEWsLMfcq9K4dGJJBtxord 与提交 8087560，不动旧数据。

## Decision Owner / Deadline
Owner: Primary Agent。2026-09-15 用户选择已明确授权本范围；10:00 前完成，时间优先保留发布与验证缓冲。
