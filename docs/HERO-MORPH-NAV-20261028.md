# 正式站首页：学习闭环动效与导航修复（2026-10-28）

## 本轮范围

- 项目介绍第一页添加「先发现自己的需求」，直达 `/needs/` 的 52 项家长问卷，原先的两条 CTA 保留。
- 第一页右侧保持既有「一问题 → 三原因 → 五环节」React Motion 形态变化，延长到可阅读的时长，五环节自动逐项突出（每步约 2.9 秒）。
- 右侧新增 01—05 编号、前后切换、进度线与「自动 / 手动」状态；点击步骤、按钮、键盘左右箭头或在右侧横向滑动后进入手动模式，不再自动推进。
- 在手机与窄屏布局里，当右侧图解尚未充分进入视线时暂停动画；离开视线也暂停自动步骤变化。支持 Reduced Motion 的静态五步内容。
- 右上「家长需求」直接到问卷，「免费资源」「联系作者」继续精确进入第 6、7 页，手机端也显示全部链接。
- 「个人主页」与其他导航样式相同，点击弹出「在建设中，暂时无法进入」，不再实际进入个人主页。需求问卷顶部的同一入口同步。

## 工程说明

- `src/animation/AnimationDirector.ts` 保持原全屏滑动状态机，仅延长首页三个动画阶段的持续时间。
- `src/animation/SceneMotifs.tsx` 管理五步独立 `activeStep` 和 `manual` 状态；步骤本身由已有五张卡片驱动，非额外重复图形。
- `src/pages/AboutPage.tsx` 负责对锚点 / 问卷路径 / 未完工个人主页的路由处理，以及窄屏视口 IntersectionObserver 暂停。
- `src/pages/NeedsPage.tsx` 同步处理个人主页入口。
- 保持第 2—7 页原动画、浏览器返回/前进、三份 PDF、学生和成人演示等功能不变。

## 回归

- 本地 Windows Chrome 31 项 Playwright 全部通过（包括新增 5 项控制专项测试及原 26 项）。
- `npm run typecheck`、`npm run lint`、`npm run build`、`npm run check:publish` 通过；正式站部署后另跑线上回归。
- 关键截图：1440×900、390×844，顶部导航和横向布局无溢出。

## 发布与回滚

- 源码主仓：`zxyzx0430/personal-ai-web`。
- 正式部署仓：`zxyzx0430/personal-ai-study-site` 的 Pages workflow（从源码仓 `main` 构建）。
- 保留 `backup/main-before-hero-controls-20261028` 指向本次上线前的源码。
