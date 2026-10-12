# Phase 2–6 开发记录

阶段顺序：每个阶段实现、代码检查、测试、Lint、类型检查、生产构建与 standalone 启动回归后再进入下一阶段。外部 API 由本地 HTTP fixture 验证适配契约；没有用户 API Key，不代表已经完成付费服务实网验收。

## Phase 2：GitHub 搜索（完成）
- 实现真实公开仓库搜索、统一数据模型、Promise.allSettled 聚合、来源状态、服务端密钥、超时/限流/响应大小限制、输入校验、重试、客户端分类切换。
- 主要文件：`lib/search/providers/github.ts`、`lib/search/{aggregate,http,normalize,errors}.ts`、`lib/{api,config}.ts`、`app/api/search/route.ts`、`app/search/page.tsx`、`components/search/{SearchWorkbench,SearchTabs,SearchResults}.tsx`、`types/search.ts`、`tests/{search.test.ts,http.test.mjs}`。
- 删除运行时 Mock 搜索和 Mock 总结；代码检查发现旧 standalone route-cache 可保留旧页面，新增 `scripts/clean-standalone.mjs` 在构建前清理生成目录。
- 验证：`npm run check` 通过；3 单元测试 + 8 生产 HTTP 测试；含启动、静态资源、中文、HTML 转义、异常降级、敏感信息不泄露、400/403/413/415/404。
- 下一阶段：网页、PPT/PDF 搜索。

## Phase 3：网页与课件（完成）
- 实现博查/Tavily 官方 API 适配、HTML 片段转纯文本、链接去追踪与去重、PPT/PPTX/PDF/Slides 分类；普通网页不会因标题带 PPT 就被当作文件。
- 主要文件：`lib/search/providers/{web,ppt}.ts`、`lib/search/aggregate.ts`、`types/search.ts`、`tests/{web.test.ts,http.test.mjs}`。
- 验证：Lint、类型检查、生产构建通过；6 单元测试 + 9 生产 HTTP 测试通过。补测网页和 PDF 从上游到生产 API 的完整字段映射。
- 下一阶段：视频搜索。

## Phase 4：视频（完成）
- 默认通过已配置的网页搜索服务检索哔哩哔哩视频；校验真实视频 URL，禁止伪装域名与普通搜索页混入。提供 YouTube Data API 可选适配。
- 不伪造作者、时长、缩略图、日期。卡片采用本地样式作为视觉占位。
- 主要文件：`lib/search/providers/video.ts`、`lib/search/aggregate.ts`、`components/cards/VideoCard.tsx`、`tests/{video.test.ts,http.test.mjs}`。
- 验证：完整 `npm run check` 通过，8 单元测试 + 10 生产 HTTP 测试。覆盖视频 URL、字段、非法域名、YouTube schema。
- 下一阶段：SQLite 历史、收藏与缓存。

## Phase 5：SQLite（完成）
- 增加自动迁移的 SearchHistory / Favorite / SearchCache 表，参数化 SQL、WAL、忙等待、历史上限与缓存容量/TTL。
- 真实搜索历史、收藏切换、独立收藏页筛选；缓存命中、手动刷新、配置指纹失效、同一请求合并与部分失败不缓存。数据库异常保留搜索结果并显示提示。
- `npm start` 在 standalone 更改工作目录前固定数据库绝对路径；Docker 提供持久卷。
- 主要文件：`lib/db/store.ts`、`lib/search/{service,schemas}.ts`、`app/api/{favorites,history}/route.ts`、`app/favorites/page.tsx`、`components/favorites/*`、`components/search/SearchHistory.tsx`、`scripts/start.mjs`、`Dockerfile`、`compose.yaml`、`tests/store.test.ts`。
- 验证：完整 `npm run check` 通过，10 单元测试 + 11 生产 HTTP 测试；包含关闭重开后的历史/收藏保留、URL 去重、TTL 到期、HTTP 增删收藏和缓存命中。
- 下一阶段：独立 AI 扩展、总结、规则排序。

## Phase 6：AI 与排序（完成）
- 独立 `expandQuery.ts`、`summarize.ts`、`rank.ts` 和 Chat Completions 客户端。支持 DeepSeek 或兼容 JSON 模式的服务，也可接 localhost 模型。
- AI 输出 4–8 个扩展候选，保留原主题；默认每类实际搜索前 2 个词组。页面标注已搜索词组。未配置、禁用或失败时明确回退为规则扩展，不冒充 AI。
- 合并、去重后对全部候选排序，再取每类上限，防止扩展结果在排序前被截掉。排序结合中文分词、标题/摘要、来源、更新日期与有限的星数权重；不把评分展示为准确率。
- 总结只读取本次最多 12 条标题/摘要；结构校验、截断检查、引用 ID 存在性校验，来源 URL 由服务端匹配。AI 失败保留搜索结果。
- 新增 `/settings`、完整 `.env.example`、Windows 配置/升级说明；更新 Linux/Windows CI 矩阵。
- 主要文件：`lib/ai/{client,expandQuery,summarize,rank}.ts`、`lib/search/{aggregate,service}.ts`、`types/search.ts`、`components/search/{AISummary,SearchWorkbench}.tsx`、`app/settings/page.tsx`、`.env.example`、`tests/{ai.test.ts,http-client.test.ts,http.test.mjs}`。
- 第一轮完整验证：16 单元测试 + 12 生产 HTTP 测试通过。最终增加缓存刷新/并发合并与历史删除验证后，**16 单元测试 + 14 生产 HTTP 测试，共 30 项通过**。

## 最终验收记录

环境：Linux、Node.js v24.19.0、npm 11.9.0。`npm run check` 完整通过：ESLint 无错误、TypeScript strict 通过、standalone 生产构建通过、30 项测试通过。完整日志见 `VERIFICATION.txt`。

额外启动验证：开发模式成功启动；首页、搜索、收藏、配置、健康与历史接口通过 HTTP 检查；关闭所有外部 Provider 时的明确禁用状态通过。生产模式由集成测试每次自动启动并关闭。

代码检查还确认：
- 上游 URL 不来自搜索参数；不自动重定向携带密钥的请求；输入、JSON 体积、响应体积与时间受限。
- 服务端密钥未出现在返回内容/配置页面；源码包不含真实密钥、数据库、依赖或构建目录。
- SQLite 参数绑定、URL 去重、重开保留、配置缓存键变更、TTL、同主题并发复用及刷新绕过缓存均有测试。
- 双击脚本保持 ASCII + CRLF，中文说明 UTF-8 BOM + CRLF；依赖清单与 lockfile 一致。
- 不依赖原 Sites 内部身份/登录，不修改原在线项目。

验证边界：本地 HTTP fixture 覆盖适配协议和错误路径，不等同付费 API 的真实账户验收。未提供用户 API Key，因此没有进行博查/Tavily/YouTube/AI 的实网调用验证。没有在用户 Windows 电脑执行双击脚本，没有浏览器交互/视觉验收，没有构建运行 Docker；首次阶段验收时，CI 矩阵已配置但尚未在 GitHub 执行。

下一步只需用户在电脑上填写 `.env.local`，运行安装/启动脚本，在真实网络搜索一个主题、收藏并重启确认保留。

2026-10-12 仓库整理更新：GitHub 连接已取得 Algorithm 仓库写入权限。本机版放在 `local/`，在线版放在 `online/`，根目录提供两版使用说明和 CI 工作流。此前 403 是首次上传时的历史记录；当前获取和更新方式见 [GITHUB.md](GITHUB.md)。
