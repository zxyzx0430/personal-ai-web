# Personal AI System — React 网站源码

此仓库维护「在学中扩展 / Personal AI System」官网的 React + TypeScript + Vite 源码，包括项目介绍七页动画、学生版、成人版和家长需求指南。

## 入口

- 正式网站：<https://ai.zxyzx.me/>（由 `personal-ai-study-site` 的 GitHub Pages Workflow 发布）
- 源码仓库 GitHub Pages：<https://zxyzx0430.github.io/personal-ai-web/>
- `/`, `/about/`, `/needs/`, `/study/`, `/adult/`；公开资源在 `/resources/`，媒体在 `/media/`。

## 本地开发及验证

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run audit:parity
npm run build:publish
npm run check:publish
npm run test
```

`npm run build:publish` 输出 `dist/`，使用相对路径构建，使根域名与 GitHub Pages 子目录均可加载 Vite 的脚本、CSS、PDF 和视频。发布时**不可直接把 Vite 源码 `index.html` 作为静态网页**；部署的必须是 `dist/`。

## 发布结构与回退

- `personal-ai-web/main` 为唯一源码分支；本仓库的 `.github/workflows/pages.yml` 从源码构建并部署 GitHub Pages 项目网址。
- `personal-ai-study-site/main` 的工作流也检出此仓库的 `main`，重新构建并将完整 `dist/` 发布到 `ai.zxyzx.me`。如果源码升级，需要运行该部署工作流，以立即刷新正式站；此外每日会检查并重新发布。
- 两个仓库均保留 `backup/pre-react-motion-20261028` 作为上线前回退点。
- 内部 Obsidian 笔记、学员资料和私人项目计划不在公开仓库内。

## 技术记录

- [React 架构](docs/react-architecture.md)
- [原版内容与交互审计](docs/legacy-feature-audit.md)
- [React 动画系统](docs/REACT-MOTION-ARCHITECTURE.md)
- [重构报告](docs/REACT-REBUILD-REPORT.md)
