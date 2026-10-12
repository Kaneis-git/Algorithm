# 本机版与 GitHub 仓库

本机版位于 [Kaneis-git/Algorithm](https://github.com/Kaneis-git/Algorithm) 的 `local/` 目录；同一仓库的 `online/` 保存在线版。

获取完整仓库后，进入本机版目录：

```bash
git clone https://github.com/Kaneis-git/Algorithm.git
cd Algorithm/local
```

Windows 用户按本目录的 [使用说明](../Windows使用说明.txt) 操作。命令行安装、构建、启动与服务配置见 [README](../README.md)。

两个版本共用仓库根目录的 Git 历史，不需要在 `local/` 中再次 `git init`。提交两版修改时回到 `Algorithm` 根目录；获取更新、提交命令与连接授权记录见 [仓库说明](../../GITHUB.md)。

`.env.local`、`data/`、依赖和构建文件不提交。首次阶段验收的 GitHub 403 记录属于 2026-10-11 的历史状态；2026-10-12 已确认连接具有 Algorithm 仓库写入权限。
