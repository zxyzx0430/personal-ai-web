# Personal AI System｜React Motion 开发架构和视觉回归基准

## 隔离与基线

- 动画分支：`feature/react-motion-system`，起点 `refactor/react-rebuild` 的 `0ce902f`。
- 历史视觉基准：`design/animation-lab-html` 的 `574b424`，V6.1 七页 + 首页 V5 的 1→3→5。
- 实验网址：`https://react-motion.67.215.236.125.sslip.io/`；不会触碰 `main`、正式站 `ai.zxyzx.me` 或历史 HTML 站。
- 保持已有 React 入口 `/`, `/about/`, `/study/`, `/adult/`, `/needs/`。

## 组件职责

- `src/animation/AnimationDirector.ts`：React 状态决定当前章节、视觉阶段、动画偏好、暂停、阅读模式和 URL history；滚轮累计/手势锁、键盘跳转、触摸切换、减少动效监听和超时清理。
- `src/animation/SceneMotifs.tsx`：`HeroMorph` 使用 Motion for React 的持久节点及 layout 动画，展示一个问题 → 三种根因 → 原有五步流程；`FanCard` 直接动画原网页的文章卡片，无额外“解释卡”或扫描光带。
- `src/pages/AboutPage.tsx`：七页 React 场景、原始链接和复制按钮、分页控件、单页阅读模式。首页版在 ShadowRoot 中 React portal 嵌入，不使用 iframe。
- `scripts/split-about-pages.py`：从原始 About 内容语义拆分为七个面板；原来的 17 个正文链接及 5 个资源/演示卡一一保留，并将原 footer 移到联系页中。
- `src/styles/about-motion.css`：从 V6.1 实验的静态页面构图和 V5 Hero 视觉参数整理来的样式基准；不是 HTML 运行时命令式动画。动画时序、状态、生命周期全部由 React + Motion 管理。

## 七页与时间

1. 项目介绍 / V5 原构图 0→1.5s→3.5s→6.25s 结束，还原五张真实学习流程卡。
2. 四个学习困境 / 原有四卡从中心展开。
3. 适合的学习方法 / 原有三张方法卡。
4. 六个成长支持 / 原有六张成长卡。
5. 三份免费 PDF / 原有三张资源卡、全部阅读和下载链接。
6. 视频、学生演示、研究来源 / 原有两张演示卡和完整参考来源。
7. 联系作者 / 原有联系方式和 footer。

页面 2–7：约 0.51s 入场准备，0.76s 原卡片展开；低动态/静态直接展示最终完整信息。支持手动逐幕、暂停、重播、跳过，离开场景清理 Motion 动画。

## 翻页与阅读

- Wheel / trackpad 采用累计阈值及惯性事件锁；Touch/keyboard/navigation 一次一个逻辑页；`#page-01`～`#page-07` 深链接及后退恢复。
- 每页默认完整对齐，不能停在两页之间。超长内容按“阅读本页完整内容”进入该页原生滚动，退出后恢复整页翻页。
- 移动端 390/360 宽、桌面 1440/1280 宽均纳入浏览器回归。

## 对照原则与边界

本阶段按用户反馈优先**还原 HTML V6.1 的具体视觉效果**，不是自行设计新视觉。保留米白、克莱因蓝、编辑式排版及页面宽度，避免在原卡片前加替代性的抽象动画画面。CSS 作为外观参照可以迁移，旧版 JavaScript `element.animate`、滚动位置推断、DOM 创建/插入不直接移植。未来视觉改动必须先以这个基线对照，并由用户验收。

## 质量门槛

- 代码：`npm run typecheck`, `npm run lint`, `npm run build`, `npm run audit:parity`。
- 浏览器：`tests/about-motion.spec.ts` 与 Windows Chrome 真实 HTTPS 全面回归。
- 重点：首次加载无卡片闪现、7 页无错页、连续滚轮不跳页、按钮不挡链接、页内可阅读、复播和静态状态能恢复完整内容、JS 无异常、独立预览可访问。
- 当前动画属于 **React V6.1 对照版**，不是未来审美终稿；后续设计可以在相同分支中迭代。
