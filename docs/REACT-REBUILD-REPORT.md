# Personal AI System — React 全站架构重构 V1 报告

**执行日期**：2026-10-28  
**仓库**：`zxyzx0430/personal-ai-web`  
**基准正式分支**：`main` @ `051fa4ceec125fd30832c6fd6495a96839f0c6a4`  
**开发分支**：`refactor/react-rebuild`  
**独立预览**：https://ai-preview.67.215.236.125.sslip.io/  
**合并状态**：未合并，未修改正式站或 DNS。

## 1. 完成的迁移

| 模块 | React 迁移成果 | 数据与行为保真 |
| --- | --- | --- |
| 首页 `/` | `HomePage.tsx` + ShadowRoot + React portal 进行三版本即时切换，**没有 iframe** | `?view=...`、侧栏、关闭/展开、存储记忆、`popstate`、手机边缘手势 |
| `/about/` | `AboutPage.tsx` | 原视觉、内容/链接、两处复制/失败回退、PDF 入口 |
| `/needs/` | `NeedsPage.tsx` | 原视觉、52 个问题、选择计数、清空、复制问题与微信、打印 |
| `/study/` | `StudyPage.tsx` + 10 份分离的页面内容 | 翻页、十页目录、快捷键、鼠标滚轮、触屏、静态模式、动画暂停与重播、Web Animations、Canvas、视频章节/全屏/状态、提示词复制、深链 `#01` 至 `#10` |
| `/adult/` | `AdultPage.tsx` + 11 份分离的页面内容 | 五类人群、动态问题和案例、流程/知识库节点/Idea/复用演示、11 页演讲稿及章节切换、目录、讲稿快捷键、交付方式、真实问题复制、深链 `#01` 至 `#11` |
| 静态资源 | `public/resources/`、`public/media/` | 三份 PDF 及内嵌图片和视频已转移；SHA-256 内容一致 |

架构详见 [`docs/react-architecture.md`](./react-architecture.md)。旧页面的文字和 SVG 仍按页保存在 `src/content`，运行时解析为 React 元素；它们不再是独立 HTML 文档，也不通过 iframe 加载。状态、导航、逻辑及动态 UI 已由 React 组件维护。

## 2. 测试与可用性

### 源码和工程

- `npm run audit:parity`：**通过**。五页文字、原始 DOM 标签/ID/链接、家长问卷、样式保真、3 份 PDF、图片/视频 SHA-256 完整比对；五类成人数据、FLOW、11 份讲稿、10 个学生章节标题已比对。
- `npm run typecheck`、`npm run lint`、`npm run build`：通过（请以本分支的最新 CI/实际执行为准）。
- 通过 `DEPLOY_BASE=/personal-ai-web/` 构建，已在独立本地子目录模拟 GitHub Pages，检查 `/personal-ai-web/?view=study`、`/study/#04`、`/adult/#08`、`/about/` 的加载：均为 HTTP 200，未捕获 JS 异常。

### 公网浏览器行为

- HTTPS 预览站独立功能冒烟测试：**12/12 通过，未捕获 JavaScript 页面异常**。覆盖首页无 iframe / 切换、成人五人群和节点、演讲稿、学生导航/快捷键/视频章节/复制、问卷和 PDF。
- Windows Chrome Playwright：**完整 E2E 测试 8/8 通过（49.8 秒）**，包含首页、About、Needs、成人核心和动态交互、学生版两组专项及四尺寸响应式巡检。
- 视觉对照：在 Windows Chrome `prefers-reduced-motion: reduce`、同视口、同首屏，比较旧正式站与新预览站。截图像素变化判定为灰度绝对差 **>25/255**：

| 页面 | 1440px 差异像素比例 | 390px 差异像素比例 |
| --- | ---: | ---: |
| 首页（About 模式） | 0.31% | 0.59% |
| About | 0.23% | 0.25% |
| Needs | 0.00% | 0.00% |
| Study 首屏 | 0.00% | 0.00% |
| Adult 首屏 | 0.03% | 0.07% |

左右并排首屏对照汇总位于 [`docs/visual-review/README.md`](./visual-review/README.md)，对应新旧截图在授权 Windows 设备 `E:\Temp\personal-ai-react-audit-20261028\visual-audit\` 保留。30 次截图均成功，含 1440/390 的新旧对照及 1024/360 的 React 截图，未发现文档级横向溢出。此数值仅对应测试视口及初始显示状态，不表示所有动态状态像素完全一致。

### 已发现并修复的回归

1. 初期缺失三大页面入口导致 `npm run build` 失败：已完成全部入口与组件化迁移。
2. 学生版 `<noscript>` 中的 CSS 被误抽取为全局 CSS，导致 `.bottom-bar` 导航隐藏：已剔除降级 CSS，导航及键盘功能测试恢复通过；保真测试明确忽略只有禁用 JS 才运行的 CSS。
3. React 动态状态/成人讲稿及数据在初次拆分阶段缺失：已迁移，并追加数据保真脚本与 Playwright 交互回归。
4. 家长问卷复制文案标点、动态提示标签：已与原版统一。
5. 首页原有 iframe 嵌套：已替换成隔离样式的同页 React 组件组合。

## 3. 部署、隔离与回滚

- 预览站使用独立 Nginx 虚拟主机 `ai-preview.67.215.236.125.sslip.io`；仅修改该预览站根目录，未修改正式 Nginx 虚拟主机、DNS、GitHub Pages 发布源或 `main`。
- 预览站初次部署备份：`/var/www/ai-animation-preview`（原始未修改旧版仓库）。
- 当前 React 预览目录：`/var/www/ai-react-rebuild-20261028-r2`；前一个 React 构建副本保留在 `/var/www/ai-react-rebuild-20261028`。
- 回滚只需把预览站虚拟主机的 `root` 指向 `/var/www/ai-animation-preview`，运行 `nginx -t` 后 reload。对生产环境无须操作。
- 还没有向 `main` 合并，也没有发布到 `ai.zxyzx.me`。

## 4. 下一阶段动画准备

**可以开始独立动画开发分支，但应保留本次基线版本的 CSS、交互和内容快照。**

- **Motion for React**：适合演示页入场、卡片展开、导航进度和状态切换。应从独立可见元素抽出组件，再渐进引入；勿直接全站替换既有原生动效。
- **Remotion**：适合视频制作、逐句讲解镜头和输出 MP4，不需要把它作为在线页面交互框架。
- **下一轮优先事项**：提取各页的可动节点/交互式演示为明确 JSX 组件，建立动画抽象层（enter/exit/replay/pause/reduced motion），逐页对照视觉回归；不应直接重写整个网站的视觉设计。
- **限制**：部分页面文字/SVG 仍由逐页 HTML 片段作为内容数据加载。现阶段已具备增加动画组件的工程基础，但对大型时间轴或高度可编辑的动态图谱，建议先把目标场景逐步转为完整 JSX 组件。

## 5. 验收边界

当前预览站用于审阅。即使本阶段核心交互与视觉测试通过，也不能代表所有设备、浏览器和所有动态状态都没有细小差异。生产部署与正式分支合并必须在用户明确批准后进行。
