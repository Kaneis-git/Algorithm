# Algorithm · KnowledgeHub AI

**日常直接访问：[KnowledgeHub AI 在线版](https://knowledgehub-ai.kaneism184.chatgpt.site)。** 可将网址加入浏览器收藏夹，Windows 也可双击仓库中的 `open-online.url`，无需填写本地 IP，也不需要自己的电脑运行服务器。在线站点沿用原来的个人访问权限。

本仓库包含 Phase 2–6 的两个完整版本。

| 目录 | 使用方式 | 数据保存 |
| --- | --- | --- |
| [online/](online/README.md) | Sites 在线托管，Vinext / Cloudflare Workers | D1，按登录账户隔离 |
| [local/](local/README.md) | 自己电脑运行，Next.js / Node.js 24 | 本机 SQLite |

两版均提供 GitHub、网页、PPT/PDF、视频检索、历史、收藏、缓存、查询扩展、来源引用和学习概览。没有配置密钥的来源显示待配置；实际使用需要服务可访问。网页与哔哩哔哩索引默认使用博查，AI 默认使用 DeepSeek；在线版和本机版分别配置密钥，数据互不自动同步。

## 自己电脑使用

进入 `local/`，首次双击 `01-setup.cmd` 安装并构建；按 [Windows 使用说明](local/Windows使用说明.txt) 配置服务，再双击 `02-start.cmd`。脚本默认仅在本机提供服务。只想直接使用网址时，不需要安装本机版。

## 开发与部署

- 本机版：进入 `local/`，使用 Node.js 24，执行 `npm ci`、`npm run check`、`npm start`。
- 在线版：进入 `online/`，在 Linux / Bash 下执行 `npm ci`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。发布遵循 Sites 的源码同步、版本保存与部署流程。
- 导出源码已移除在线站点的专属 `project_id`；自行新建站点时使用平台生成的新标识。不能把在线版当作无需认证的裸 Worker 部署，因为数据接口依赖 Sites 的认证入口。
- GitHub Actions 在仓库根目录检查两版；本机版覆盖 Linux / Windows，在线版覆盖 Linux。CI 只验证代码，不部署网站或调用付费服务。
- 不提交 `.env.local`、真实密钥、用户数据库、依赖或构建产物。模板为两版各自的 `.env.example`。

## 验证记录

本机版此前完整检查通过，30 项测试通过，见 [阶段记录](local/docs/PHASES.md)。本次在线版类型检查、Lint、17 项测试、Worker 构建及 Wrangler 发布包 dry-run 通过，见 [在线验证记录](online/docs/VERIFICATION.md)。未进行实际浏览器交互、用户 Windows 电脑运行或付费服务密钥验收。

在线版于 2026-10-11 发布到上方原网址，沿用个人权限。本站能否从你的网络访问，以实际访问结果为准。

源码仓库：[Kaneis-git/Algorithm](https://github.com/Kaneis-git/Algorithm)。获取与更新方式见 [GITHUB.md](GITHUB.md)。
