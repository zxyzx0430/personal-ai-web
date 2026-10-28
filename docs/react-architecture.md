# React 迁移架构（独立重构分支）

## 文件组织

- `src/entries/*.tsx`：Vite 多页面独立入口，分别加载页面专属 CSS。
- `src/pages/HomePage.tsx`：`?view=` 选择器、侧栏弹窗、`popstate` 历史与无 iframe 嵌入。首页通过 Shadow DOM + React portal 隔离不同产品线的既有设计风格；实际内容仍是 React 组件，不是网页 iframe。
- `src/pages/StudyPage.tsx`：学习演示十页的 React 状态、页面导航、键盘/触摸/滚轮、Video 控制、Web Animations 和 Canvas 生命周期。
- `src/pages/AdultPage.tsx`：成人演示十一页的 React 状态、人群场景数据、动态组件、讲稿、目录、复制反馈。
- `src/pages/AboutPage.tsx`、`NeedsPage.tsx`：项目介绍、家长需求指南；所有输入、复制反馈由 React 维护。
- `src/content/{study,adult}/slide-*.html`：按页拆分的原始文字及 SVG/结构，用 HTML parser 映射为 React 元素。**不是独立 HTML 网页，更没有通过 iframe 加载。** 后续内容编辑时可继续逐页升级为 JSX。
- `src/data/adult-content.json`：五类人群的原始动态案例、问题、流程、知识库数据和 FLOW；`adult-notes.json`：十一页演讲稿。
- `src/styles/*.css`：原 CSS 保持源样式；`src/styles/embedded/*.css.txt` 通过 `scripts/scope-css.mjs` 生成可在 ShadowRoot 隔离使用的主题 CSS。
- `public/media/`：从原 HTML 解包的图片和 MP4；`public/resources/`：三份原 PDF，已校验内容相同。
- `tests/e2e.spec.ts`：Playwright 交互、链接、四类尺寸测试；`scripts/*parity*`：从 git main 验证全部静态/动态内容无遗漏。

## 建立和验证

```bash
npm ci
npm run typecheck
npm run lint
npm run audit:parity
npm run build
npm run test
```

GitHub Pages 子目录构建：`npm run build:pages`；独立预览：`npm run preview`。

## 约束和未来动画

- React 与 Vite 以 MPA 方式提供 `/about/`、`/needs/`、`/study/`、`/adult/`；首页通过 ShadowRoot 嵌入 React 组件，避免重新引入旧 iframe。
- 成人业务状态与页面状态保持各自单页内部，不用 Redux；`data` 目录独立于视图组件。
- 原版学习动效基于 Web Animations/CSS/SVG/Canvas，迁移中继续支持暂停/重播/静态模式，动画执行受 React effect 生命周期管理。
- **Motion for React** 最适合后续卡片、导航、模块进出和节点转换；**Remotion** 最适合独立导出的视频、讲解动画和镜头时间线，不应加载整个 Remotion 编辑/渲染运行时到公开站点。
- 未来增加高级动画时可独立导入所需组件并保留 `prefers-reduced-motion` 行为，不应再把动画逻辑放回全局内联 JS。

## 回滚

`main` 保持未修改；独立预览使用独立 Nginx 站点根目录。回滚预览时将备份目录恢复到原预览目录；不涉及生产域名、DNS 或生产部署。
