# Personal AI System — React website

公共站点，含学生版和成人版两条产品线。现已在独立分支 `refactor/react-rebuild` 迁移至 React + TypeScript + Vite。

## 页面

- `/`：项目入口、学生/成人/项目介绍切换，可用 `?view=about|study|adult`
- `/about/`：项目介绍与资源
- `/needs/`：家长需求指南（52 项可选择问题）
- `/study/`：在学中扩展（10 页）
- `/adult/`：在做中扩展（11 页）
- `/resources/`：三份公开 PDF

## 开发、构建和验收

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run audit:parity
npm run build
npm run test
```

在现有公开预览站运行浏览器冒烟测试：`SITE=https://ai-preview.67.215.236.125.sslip.io npm run test:public`。

部署到 GitHub Pages `/personal-ai-web/` 子路径：`npm run build:pages`。默认 `npm run build` 产物支持根目录部署。

## 审阅与设计保留

- [架构说明](docs/react-architecture.md)
- [重构报告](docs/REACT-REBUILD-REPORT.md)
- [完整旧版功能审计](docs/legacy-feature-audit.md)
- [新旧截图对照](docs/visual-review/README.md)

重构后的公开预览：https://ai-preview.67.215.236.125.sslip.io/

**生产保护**：此分支不得未经批准合并 `main`，不得用试验构建覆盖正式域名 `ai.zxyzx.me`。

私人 Obsidian 知识库、学生记录和内部项目计划不在此公开仓库中。
