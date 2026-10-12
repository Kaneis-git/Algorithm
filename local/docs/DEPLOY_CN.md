# 中国大陆本机运行

本项目按你选择的“在自己电脑运行”交付。Node.js 24 + npm 即可，不需要购买服务器、域名，也不需要把网站发布到 GitHub Pages。GitHub 用于保存源码，网站由电脑上的 Node.js 进程运行。

## 本机步骤

完整解压，双击 `01-setup.cmd`，按根目录 `.env.example` 配置 `.env.local`，再双击 `02-start.cmd`。浏览器打开 http://127.0.0.1:3000 。修改密钥后关闭启动窗口，再重新启动。

服务默认仅本机可访问。不要将自己电脑的 `127.0.0.1` 地址发给他人作为网站链接；它总是指向访问者自己的电脑。

网页样式、脚本、图标、字体不依赖海外 CDN。首次安装仍需从 npm 下载依赖；真实搜索和 AI 需要你配置的上游服务能联网访问。国内默认选项为博查网页搜索、哔哩哔哩网页索引和 DeepSeek；GitHub 来源可以单独失败或关闭，不影响其余来源。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 找不到 Node/npm | 安装 Node.js 24.x，保留 npm 和 PATH，重新打开脚本 |
| npm 安装超时 | 检查电脑能否访问 npm registry；可使用组织提供的可信 registry，保留 lockfile，不删除依赖校验 |
| PowerShell 提示脚本受限 | 命令使用 `npm.cmd`，或使用随包 `.cmd` 脚本 |
| 本机网站打不开 | 启动窗口是否仍在运行、是否端口冲突、是否已完成构建 |
| 网页/PPT/视频显示待配置 | 填写默认的 `BOCHA_API_KEY` 后重启；或配置 Tavily |
| AI 显示待配置 | 填写 `AI_API_KEY`、检查 `AI_BASE_URL` 和 `AI_MODEL` 后重启 |
| 认证失败 / 限流 | 检查相应账户密钥、额度；降低 `EXPANSION_SEARCH_LIMIT`，不要反复刷新 |
| GitHub 超时 | 检查目标网络；必要时 `GITHUB_ENABLED=false`，其余搜索继续可用 |
| 资源链接打不开 | 原站连通性与网站本机运行是独立的；可查看其他来源 |
| 收藏/历史保存失败 | 项目应位于有写入权限的用户目录，检查 `DATABASE_PATH` 和剩余磁盘空间 |
| 更新后看到旧页面 | 重新运行安装构建脚本并重启；新版本构建已清理旧 standalone 页面缓存 |

## 可选 Docker 本机运行

只有已安装 Docker、确实选择容器方式时才使用。不是 Windows 双击运行的前置条件。

```bash
cp .env.example .env.local
# 编辑 .env.local 后执行：
docker compose up -d --build
```

打开 http://127.0.0.1:3000 。容器使用 `DATABASE_PATH=/app/data/knowledgehub.db` 与命名卷持久化。更新执行 `docker compose up -d --build`。普通停止用 `docker compose down`；不要加 `-v`，以免删除数据。

Dockerfile 支持 `NODE_IMAGE` 和 `NPM_REGISTRY` 构建参数，可改为组织提供的可信源。也可在同架构 Linux 构建机执行 `docker build -t knowledgehub-ai:0.6.0 .` 与 `docker save` 后传输镜像。不要把 Windows 的 node_modules 复制到 Linux。

本次没有发布公网服务；Nginx 配置仅为保留的参考模板。公网/多人部署需要另行设计认证与用户数据隔离。
