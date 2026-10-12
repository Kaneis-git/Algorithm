# 本机版升级说明

版本 0.6.0，开发日期 2026-10-11。基于原 Phase 1 的标准 Next.js 本机导出版继续开发；没有修改原 Sites 在线项目，也没有新发布网站。

## 从 0.1.1 升级

1. 停止旧启动窗口，备份原目录。
2. 完整解压 0.6.0 源码到新目录，或覆盖旧目录的源码文件；保留自己的 `.env.local` 与 `data/`。
3. 对照新版 `.env.example` 更新变量。旧 `WEB_SEARCH_API_KEY/URL`、`VIDEO_SEARCH_API_KEY/URL` 和 `DATABASE_URL` 是未启用的占位变量，不能直接使用：改为博查/Tavily 专用变量、视频 Provider 与 `DATABASE_PATH`。
4. 运行 `01-setup.cmd` 或 `npm ci && npm run build`。
5. 配置密钥，重新运行 `02-start.cmd` 或 `npm start`。

## 升级后的变化

搜索页调用 `POST /api/search`；所有结果都来自配置的真实 Provider。原模拟资源、星数、作者、历史和 AI 总结已从运行链路删除。首页历史来自 SQLite，固定推荐主题保留为选题建议。

SQLite 在第一次访问数据接口时创建 schema v1。数据目录位于项目根目录，生产启动时转换为绝对路径，避免 standalone 的工作目录变化导致数据落入构建目录。构建前只删除 `.next/standalone` 生成目录；不删除数据。

新增收藏页、配置说明页，四类资源卡片增加收藏按钮。排序在扩展查询合并、去重后进行，再取每类结果上限，因此扩展查询结果可以参与排序。AI 总结只引用本次结果中的 ID，对应 URL 由服务端匹配，AI 不直接控制来源链接。

具体阶段文件、验证与边界见 [PHASES.md](PHASES.md)。GitHub 上传独立于本机功能；此前 GitHub 连接返回 403，处理方式见 [GITHUB.md](GITHUB.md)。
