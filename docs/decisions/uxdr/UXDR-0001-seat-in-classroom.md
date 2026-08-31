---
id: UXDR-0001
status: Accepted
date: 2026-08-31
owner: UX
---

# Candidate Seat 在原教室内出现

## Decision

用户提交笔记后不跳结果页。Claim 进入当前教室、空桌亮起、证据 Sheet 展开；Reset 只清结果，不重放入场。

## Why

只有空间内因果才能让用户理解“我的知识与既有讨论发生了关系”。独立结果页会把核心概念退化为普通 AI 报告。

## Accessibility

Reduced Motion 直接显示 Seat 与证据；DOM 结构仍按 Claim → Seat → Evidence 排序。

