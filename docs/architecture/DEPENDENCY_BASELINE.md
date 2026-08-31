---
id: ARCH-DEPENDENCIES-001
status: Frozen
owner: Repository
version: 1.0.0
last_verified: 2026-08-31
---

# Dependency Baseline

版本来自 2026-08-31 npm registry 查询；package.json 使用 exact versions。未到对应 Task 不安装未使用依赖。

## Installed by TASK-001

- next 16.3.3
- react / react-dom 19.2.7（保持配对）
- zod 4.5.4
- typescript 6.0.3（`typescript-eslint 8.68.0` 当前要求 `<6.1`）
- eslint 9.39.5 / eslint-config-next 16.3.3（Next 所带插件当前未声明支持 ESLint 10）
- tailwindcss / @tailwindcss/postcss 4.3.3
- Node 24 built-in test runner（Vitest 4.1.11 在本机触发 Rolldown optional binding 漏装；4.0.x 又处于 GHSA-5xrq-8626-4rwp 影响范围，因此骨架不保留 Vitest）

## Approved direction; install only at owning Task

- ai 7.0.85 — TASK-004 Spike 后进入 Adapter
- react-force-graph-2d 1.29.1 — TASK-006 可视化验证门后安装
- ml-hclust 4.0.0 — TASK-005 距离/Linkage Spike 后安装

任何版本变更必须 Proposal + lockfile diff + typecheck/lint/test/build。
