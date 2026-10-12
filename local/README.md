# KnowledgeHub AI · Algorithm

运行在自己电脑上的学习资源聚合网站。输入主题，检索 GitHub 项目、网页、PPT/PDF、视频，保存历史与收藏，并使用可配置的 AI 整理学习概览。

**当前版本 0.6.0，Phase 2–6 已实现。** 运行时使用真实 Provider，不混入演示资源。没有密钥、网络失败或 AI 输出无效时会显示具体状态；不会生成假搜索结果。首页推荐主题只是固定选题建议，不是实时热榜。

目标 GitHub 仓库：[Kaneis-git/Algorithm](https://github.com/Kaneis-git/Algorithm)。上传状态与命令见 [GitHub 说明](docs/GITHUB.md)。本机运行不依赖上传成功，也不依赖 ChatGPT 登录。

## Windows 首次使用

1. 安装 [Node.js 24.x](https://nodejs.org/en/download)，建议使用该分支最新版本；安装时保留 npm 和 PATH 选项。
2. 完整解压源码包，进入有 `package.json` 的目录。
3. 双击 `01-setup.cmd`。脚本安装锁定依赖、构建，并在不存在时把 `.env.example` 复制成 `.env.local`。
4. 用记事本编辑 `.env.local`：填写 `BOCHA_API_KEY` 后启用网页、课件及哔哩哔哩索引；填写 `AI_API_KEY` 后启用 AI。`GITHUB_TOKEN` 可选。
5. 双击 `02-start.cmd`，保留命令窗口，打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。导航中的“配置”页面说明每项设置。

没有密钥也能启动网站、使用历史和收藏；GitHub 会尝试匿名搜索。在线搜索需要相应服务可访问。修改 `.env.local` 后重启；修改代码或升级版本后重新运行 `01-setup.cmd`。下一次使用只需 `02-start.cmd`。两个脚本默认仅在本机 3000 端口运行。

更详细的步骤见 [Windows使用说明.txt](Windows使用说明.txt)。首次安装需要联网下载 npm 依赖；页面字体、CSS、JS、SVG 均在本地，不使用外部字体或 CDN。

## 命令行启动

先将 `.env.example` 复制为 `.env.local`，填写自己的配置，再执行：

```bash
npm ci
npm run build
npm start
```

开发模式用 `npm run dev`。Windows PowerShell 若阻止 `npm.ps1`，使用 `npm.cmd` 替代 `npm`。默认打开 [http://127.0.0.1:3000](http://127.0.0.1:3000)。生产启动脚本会固定数据库路径；重建仅清理生成的 standalone 目录，不触碰 `data/`。

## 已实现的阶段

| 阶段 | 功能 |
| --- | --- |
| Phase 2 | GitHub 公开仓库搜索、字段转换、并行聚合、限流/超时/空状态、分类与重试 |
| Phase 3 | 博查或 Tavily 网页搜索，PPT/PPTX/PDF/Slides 识别与去重 |
| Phase 4 | 哔哩哔哩网页索引视频搜索，可选 YouTube Data API；不伪造时长和作者 |
| Phase 5 | SQLite 历史、收藏、收藏页筛选、持久缓存、过期与配置失效、并发请求合并 |
| Phase 6 | 独立 AI 查询扩展、实际扩展检索、引用来源校验、学习概览、中文规则排序与失败回退 |

完整阶段总结、主要改动文件与阶段测试记录见 [docs/PHASES.md](docs/PHASES.md)。

## 服务配置

所有变量写入 `.env.local`，不要加 `NEXT_PUBLIC_` 前缀，不要提交真实密钥。`/settings` 只展示配置是否存在，连通情况以搜索返回状态为准。

| 变量 | 默认值 / 说明 |
| --- | --- |
| `APP_HOST` / `PORT` | `127.0.0.1` / `3000`，用于 `npm start`；双击脚本固定本机 3000 |
| `GITHUB_ENABLED` | `true`；网络不通时可设 `false` |
| `GITHUB_API_URL` / `GITHUB_TOKEN` | 官方 GitHub API；Token 可选，只搜索公开仓库，无需授予私有仓库权限 |
| `WEB_SEARCH_PROVIDER` | `bocha`；可选 `tavily`、`none` |
| `BOCHA_API_KEY` / `BOCHA_API_URL` | 博查密钥 / 官方 `/v1/web-search` 地址 |
| `TAVILY_API_KEY` / `TAVILY_API_URL` | Tavily 密钥 / 官方 `/search` 地址 |
| `VIDEO_SEARCH_PROVIDER` | `bilibili` 复用网页搜索；可选 `youtube`、`none` |
| `YOUTUBE_API_KEY` / `YOUTUBE_API_URL` | YouTube Data API 密钥 / 官方 `/youtube/v3` 基地址 |
| `DATABASE_PATH` | `./data/knowledgehub.db`，相对项目根目录；不使用旧版预留 `DATABASE_URL` |
| `SEARCH_CACHE_TTL_MINUTES` | `60`，范围 0–1440；0 不保存新缓存 |
| `SEARCH_RESULT_LIMIT` | 每类返回上限 `8`，范围 1–20 |
| `SEARCH_TIMEOUT_MS` | 单个上游搜索超时 `12000`，范围 100–30000 毫秒 |
| `AI_ENABLED` | `true`；`false` 关闭 AI，继续使用规则扩展 |
| `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | 默认 DeepSeek，模型 `deepseek-flash`；也可配置兼容 JSON Chat Completions 的服务 |
| `AI_ALLOW_NO_KEY` | `false`；只有 localhost 模型可设 `true` 跳过密钥 |
| `AI_TIMEOUT_MS` | 每次 AI 请求 `20000`，范围 500–45000 毫秒 |
| `EXPANSION_SEARCH_LIMIT` | 每类实际检索 `2` 个词组，范围 1–3；可设 1 降低外部调用量 |

默认配置选择博查与 DeepSeek，但无法保证每个地区、网络或账户均可访问。GitHub、YouTube、Tavily 和资源原站的访问情况由实际网络决定。哔哩哔哩是搜索引擎索引检索，不抓取受保护接口；结果覆盖范围和更新速度由搜索服务决定。PPT/PDF 类型依据链接判断，不代表已下载或验证文件内容。

在线服务可能收费。一次未命中缓存的默认搜索最多发起 8 次搜索请求与 2 次 AI 请求；规则回退不调用额外 AI。原主题始终保留，候选扩展词最多 8 个，实际使用的词组在结果页标注。分类切换不会重新搜索。请求失败不自动循环重试，用户可点击“重新搜索”。

搜索主题发送至配置的搜索服务；AI 总结还会发送最多 12 条资源的标题与搜索摘要。不会发送收藏库、数据库或 API Key 给另一家服务。AI 仅依据摘要，未阅读原始全文；来源链接可供核对。相关度是规则评分，不是准确率。

本机兼容模型示例（先自行启动支持 JSON Chat Completions 的模型服务）：

```dotenv
AI_BASE_URL=http://127.0.0.1:1234/v1
AI_MODEL=你本机加载的模型名称
AI_API_KEY=
AI_ALLOW_NO_KEY=true
```

兼容服务必须接受 `messages`、`response_format: json_object`、`max_tokens`，并返回 `choices[0].message.content`。仅允许 HTTPS 服务地址；localhost 模型/测试服务可使用 HTTP，不允许 URL 内嵌凭据或自动跨地址重定向。

## SQLite 与数据保留

使用 Node.js 24 内置 `node:sqlite` 的 `DatabaseSync`，无需安装数据库服务或编译第三方 SQLite 扩展。该模块在 Node.js 24.15 起标记为 release candidate；项目固定 Node 24 主版本并进行集成测试。

- 第一次访问数据接口时自动建目录、建表与版本迁移。首次构建不创建用户数据库。
- `SearchHistory`：同一主题更新最近时间与次数，最多保留 100 个主题，可在首页清空。
- `Favorite`：按标准化 URL 去重。四类卡片可收藏/取消收藏，`/favorites` 支持分类及文本筛选。
- `SearchCache`：SQLite 持久化、TTL、最多 100 条；凭据/Provider/模型配置变化自动换缓存键。临时失败、部分扩展失败、AI 总结失败不缓存。缺密钥的状态可随成功来源缓存，填入密钥后自动失效。
- 同一主题的并发搜索复用进行中的请求，避免重复消耗上游额度；最多 8 个不同主题同时搜索。
- 缓存或历史写入异常不会丢弃已获取的搜索资源，会显示文件权限提示。

备份时先停止应用，然后复制整个 `data/` 目录。恢复时同样先停止应用，再恢复该目录；SQLite 的 `-wal`、`-shm` 文件若存在应一并保留。更新代码时保留 `.env.local` 和 `data/`。不要把数据库写入 `.next/` 或临时目录。Docker 使用命名数据卷，更新容器保留数据；`docker compose down -v` 会删除数据卷，不用于普通升级。

本项目按你选择的**自己电脑单人使用**场景实现，默认只监听回环地址。没有多用户账户隔离；如未来需要开放公网或多人使用，需要另行加入认证、用户隔离与配额管理。

## API 与模块

| 接口 | 用途 |
| --- | --- |
| `POST /api/search` | JSON `{ "query": "动态规划", "refresh": false }`；规范化后 1–80 字符 |
| `GET /api/history` | 查询本机历史 |
| `DELETE /api/history` | JSON `{ "all": true }` 清空历史 |
| `GET /api/favorites` | 查询收藏 |
| `POST /api/favorites` | JSON `{ "result": <统一资源对象> }` 收藏 |
| `DELETE /api/favorites` | JSON `{ "id": "资源ID" }` 取消收藏 |
| `GET /api/health` | 本机进程存活；不代表所有外部服务都在线 |

核心代码按职责划分：`lib/search/providers/` 负责来源适配；`lib/search/aggregate.ts` 并行聚合与隔离失败；`lib/search/service.ts` 缓存与流程；`lib/ai/` 扩展、总结和排序；`lib/db/store.ts` 数据访问；`types/search.ts` 统一模型。

写接口检查 Origin 和 JSON 大小/类型；第三方响应有超时、2MB 上限、Zod 结构校验；危险链接被移除。页面直接渲染纯文本，不注入上游 HTML。AI 不执行工具或代码，也不能自己生成可点击的来源 URL。

## 验证与已知边界

```bash
npm run check
```

依次执行 ESLint、严格 TypeScript、生产构建、单元与生产 HTTP 集成测试。`npm test` 需先构建；`npm run test:unit` 可单独运行。测试使用隔离临时数据库和本地 HTTP 上游，不需要真实 API Key。GitHub Actions 已配置 Linux 与 Windows 检查矩阵。

当前在 Linux / Node.js 24 环境验证；未在你的 Windows 电脑运行双击脚本，也未执行真实浏览器交互验收、Docker 运行或用户密钥的付费服务实网验收。请在本机填写配置后检查搜索、收藏、重启保留与目标网络连通。测试具体数量及阶段记录见 [PHASES.md](docs/PHASES.md)。

## 官方参考

- [GitHub 仓库搜索 API](https://docs.github.com/en/rest/search/search#search-repositories)
- [博查官方接口与返回示例](https://open.bochaai.com/)
- [Tavily Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search)
- [YouTube Search API](https://developers.google.com/youtube/v3/docs/search/list)
- [DeepSeek JSON 输出](https://api-docs.deepseek.com/guides/json_mode/) / [模型配置](https://api-docs.deepseek.com/quick_start/pricing/)
- [Node.js 24 SQLite](https://nodejs.org/docs/latest-v24.x/api/sqlite.html)
- [Next.js 自托管](https://nextjs.org/docs/app/guides/self-hosting)
