# KnowledgeHub AI · 在线版

在线入口：https://knowledgehub-ai.kaneism184.chatgpt.site 。日常直接打开或收藏网址，不需要填写本地 IP，不需要让自己的电脑一直运行 Node.js。访问权限沿用站点原来的个人权限。

本目录是 Phase 2–6 在线版：GitHub、网页、PPT/PDF、视频搜索；查询扩展、带来源的 AI 总结、中文规则排序；登录账户的搜索历史、收藏和缓存。没有密钥的服务显示待配置，不返回模拟资源。

## 两个版本

- 本目录：Vinext / Cloudflare Workers + D1；通过 Sites 发布，数据按已登录用户隔离。
- 仓库的 `local/`：标准 Next.js / Node.js 24 + 本机 SQLite；适合在电脑上运行。

两个版本的数据独立，不会自动把本机收藏上传到云端。在线版保留原网址与访问权限；公开 GitHub 源码不等于开放网站访问。

## 运行配置

生产环境的密钥通过 Sites 运行配置设置，不能提交到 GitHub，也不能写入 hosting.json。参数名称见 `.env.example`。

- 默认网页/PPT/哔哩哔哩索引：`BOCHA_API_KEY`；也支持 Tavily。
- 默认 AI：`AI_API_KEY`，`AI_BASE_URL=https://api.deepseek.com`，`AI_MODEL=deepseek-flash`。
- GitHub 公共仓库搜索可匿名使用；`GITHUB_TOKEN` 可选。
- `EXPANSION_SEARCH_LIMIT=2` 表示每类检索两个词组；设为 1 可减少调用量。
- `DB` 是云端 D1 绑定，没有 `DATABASE_PATH`。schema 与迁移在 `db/schema.ts`、`drizzle/`。

外部服务可能计费，搜索会发送主题；AI 总结会发送本次资源的标题与摘要。当前没有配置真实密钥，需要所有者补充后才能验收相应服务。站点 `/settings` 可查看配置状态，不展示密钥。

## 开发与验证

使用 Node.js 24 安装依赖：`npm ci`。运行 `npm run lint`、`npm run typecheck`、`npm test`。构建使用 `npm run build`，产物为 `dist/server/` 与 `dist/client/`。当前构建脚本面向 Linux / Bash；Windows 日常本机使用请选 `local/` 版本。

发布按 Sites 的源码同步、构建、版本保存与部署流程进行。新建部署时由自己的站点生成 hosting.json 中的项目 ID；不要复用他人的站点身份。D1 迁移发布时由平台执行，不在 HTTP 请求中建表。

测试包含 Provider 契约、AI 回退与引用、排序、D1 SQL、用户隔离、缓存过期与输入校验。D1 单元测试用生成的迁移和 SQLite 模拟 D1 statement API，不等同实际浏览器或生产外部 API 验收。
