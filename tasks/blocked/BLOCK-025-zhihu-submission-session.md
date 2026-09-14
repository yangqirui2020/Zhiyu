# BLOCK-025 — 最终作品提交需要队长的登录会话

状态：Waiting for user action。应用、公开材料和源码交付已完成；只阻断比赛最终提交与回执验收。

## 证据

- 用户明确表示已报名；提供官方投稿地址 https://www.zhihu.com/hackathon?activity_code=zhihu_hackathon_2026_p2 。
- 调用当前浏览器连接创建该地址的 Edge 标签，返回 `Browser is not available: edge`。隔离测试 Chrome 没有用户的知乎登录会话。
- 公网 Demo、PDF、视频均已验证可匿名访问；本地六文件提交包完成完整性校验。未获得作品页或提交成功回执。

## 已执行 Recovery

核对官方材料与入口、生成小体积 PDF、校验公网链接、准备图标封面和可复制字段；尝试连接已登录的指定浏览器，并把准确入口交接给用户。没有猜测投稿 API，也没有读取/搬运用户登录凭据。

## 需要的行动

队长在已登录的知乎打开投稿页，按 `docs/submission/SUBMISSION_FIELDS.md` 填写和上传，核对真实声明并完成最终提交，然后提供成功回执或作品展示链接。若实际页面有额外必填信息，由用户提供具体字段后继续协助。截止为 2026-09-15 上午 10:00。

拿到回执前，TASK-025 保持 In Progress，不标比赛已提交。
