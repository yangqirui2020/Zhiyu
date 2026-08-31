---
id: DESIGN-001
status: Frozen
owner: Design
version: 1.0.0
last_verified: 2026-08-31
---

# Design System — 认知教室

目标：让空间关系和证据成为视觉主角。shadcn/ui 只提供可访问行为，不继承默认 Dashboard 风格。

## Tokens

### Color

| Token | Value | 用途 |
|---|---:|---|
| `paper` | `#F6F2E8` | 页面与教室暖纸背景 |
| `surface` | `#FFFCF6` | Sheet、浮层 |
| `ink` | `#19232E` | 主文字 |
| `ink-muted` | `#627080` | 辅助信息 |
| `line` | `#D9D2C5` | 分隔、桌椅轮廓 |
| `zhihu` | `#1772F6` | 仅来源链接/知乎动作 |
| `candidate` | `#D5912A` | Candidate Seat 唯一暖强调 |
| `danger` | `#A64B45` | 真实错误，不用于观点簇 |
| `cluster-1` | `#637F96` | 观点簇（低饱和等权） |
| `cluster-2` | `#5E8B83` | 观点簇 |
| `cluster-3` | `#8075A1` | 观点簇 |
| `cluster-4` | `#9A7C58` | 观点簇 |
| `cluster-5` | `#9B6F78` | 观点簇 |

观点色不表示正误、强弱或支持率；Candidate 色只表示“个人视角加入”。

### Typography

- 字体：`ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`，不依赖远程字体。
- 字级：12 metadata / 14 supporting / 16 body / 20 section / 28 page title / 40 hero。
- 行高：正文 1.65；标题 1.25；metadata 1.45。
- 权重：400 正文、500 UI、600 标题；不使用整页粗体。

### Spacing / Shape / Elevation

- Spacing：4, 8, 12, 16, 24, 32, 48, 64px。
- Radius：6 控件、10 Inspector 区块、14 Sheet；胶囊仅用于短标签。
- Border：1px `line`；不要用半透明白边制造玻璃感。
- Shadow：只允许 Sheet/Popover：`0 16px 48px rgb(25 35 46 / 0.14)`；普通区域无阴影。

## Layout

- Desktop max-width 1600；页面 gutter 32–48。
- ClassroomStage 是连续空间，不包 Card，约占内容宽度 70%。
- Inspector 400–440px，打开后仍可看到至少 55% 教室。
- 顶栏只放题目、来源模式、切题；主动作跟随状态放在舞台内或 Sheet footer。
- 移动端使用 Bottom Sheet；证据三栏改为 1→2→3 的顺序段落。

## Core Components

- `DataModeBadge`：始终可见，不使用只靠颜色的状态。
- `ClassroomStage`：唯一空间主体。
- `StudentNode`：24–32px 视觉尺寸，命中区 ≥44px；selected/focus 有轮廓和形状差异。
- `ClusterLabel`：中性标题 + 人数，禁止胜负图标。
- `IndependentViewpoint`：与簇等权，不显示“异常/错误”。
- `InspectorSheet`：学生/簇/笔记/证据共用行为，但内容层级不同。
- `EvidenceRow`：类型、摘要、来源/区间、可回溯动作；缺证据不渲染成功图标。
- `CandidateDesk`：默认只是普通轮廓，成功时一次变为琥珀实线。
- `PrimaryAction`：每状态最多一个；知乎 CTA 才使用知乎蓝。

## Interaction States

- Hover 120ms：轻微提高对比，不位移。
- Focus：2px `ink` 外环 + 2px paper gap。
- Selected：加粗轮廓并弱化无关对象，但不完全隐藏。
- Disabled：降低对比并保留原因 tooltip/说明。
- Loading：局部 skeleton/静态说明；Canvas 不使用满屏 spinner。
- Error：靠近失败位置，明确恢复动作；不使用通用“出了点问题”。

## Motion

- 微反馈 120–180ms；Sheet 240–320ms；初次聚类 1.6–2.2s；Candidate Reveal ≤1.9s。
- 只允许 Candidate Seat 一次 300ms 以内的短光晕，不循环。
- 禁止背景粒子、无限漂浮/呼吸、按钮整体位移、无意义页面渐变。
- `prefers-reduced-motion` 下直接显示最终空间，以淡入替代移动；因果信息必须完整。
- 返回/关闭/Reset 不重播入场或 Candidate Wow。

## AI 味禁止清单

禁止满屏 Card 套 Card、玻璃拟态、过度圆角、发光描边、三栏 Dashboard 模板、每个按钮动画、装饰性插画抢主视线、无层级 Feature Grid、把 shadcn 默认样式当成设计完成。

