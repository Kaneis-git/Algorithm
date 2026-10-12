# 获取和更新 GitHub 源码

源码仓库：[Kaneis-git/Algorithm](https://github.com/Kaneis-git/Algorithm)，默认分支 `main`。

- `online/`：在线版，Sites / Cloudflare Workers / D1。
- `local/`：本机版，Next.js / Node.js 24 / SQLite。
- `open-online.url`：Windows 在线网站快捷方式。
- `.github/workflows/ci.yml`：两版代码检查，上传代码不会自动重新部署在线网站。

## 获取代码

```bash
git clone https://github.com/Kaneis-git/Algorithm.git
cd Algorithm
```

也可在仓库页面选择 **Code → Download ZIP** 并完整解压。自己的电脑使用请进入 `local/`，按其中的 Windows 使用说明操作；直接访问在线版不需要下载或安装。

## 更新代码

先提交或妥善保存自己的修改，再在仓库根目录执行 `git pull --ff-only`。本机版更新后保留 `local/.env.local` 和 `local/data/`，重新运行安装构建脚本，再启动。不要把用户数据放进生成的构建目录。

提交自己的代码修改时，在 `Algorithm` 根目录执行：

```bash
git status
git add .
git diff --cached --stat
git commit -m "Update KnowledgeHub AI"
git push origin main
```

提交前确认没有真实环境变量文件、密钥或数据库。两版的 `.env.example` 是配置模板，可以提交。Git 登录使用正常的浏览器授权或本机凭据管理器，不把 Token 写进代码或远程地址。

## 授权记录

2026-10-11 的首次上传因 GitHub 返回 `403 Resource not accessible by integration` 未能写入。2026-10-12 已确认 ChatGPT Codex Connector 安装在 Kaneis-git 账号下，Algorithm 仓库写入权限可用。后续若更改应用的仓库访问范围，需要继续包含 Algorithm。
