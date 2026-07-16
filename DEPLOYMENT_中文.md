# GitHub、GitHub Desktop 与 Pages 发布：从当前故障恢复

## 0. 先说明本次故障

截至 2026-07-16，远端仓库 `XMZhangAI/XMZhangAI.github.io` 的 `main` 分支中已经出现 Astro 源码（例如 `package.json`），但缺少：

- `.github/workflows/deploy.yml`；
- `.gitignore`；
- 根目录静态 `index.html`。

第三项本身不是错误：Astro 的入口在 `src/pages/index.astro`，必须经过构建才会生成 `dist/index.html`。真正的问题是第一项——没有工作流，GitHub 就不会构建 Astro，也不会在 Actions 中显示 `Deploy research website`。上一次发布的 Pages artifact 仍可能在线，但新源码不会自动变成新网站。

本版本已经恢复工作流，并在 CI 中依次执行：安装依赖 → 生成社交预览图 → 检查分析后台 → 构建 → 检查所有本地资源 → 发布 `dist/`。

## 1. 最省事的恢复方式：直接合并修复 PR

如果交付消息中包含修复 PR：

1. 打开该 PR。
2. 先看 `Files changed`，确认来源分支属于 `XMZhangAI/XMZhangAI.github.io`。
3. 等待 `build` 检查完成。
4. 点击 **Ready for review**（如果仍是 Draft）。
5. 点击 **Merge pull request** → **Confirm merge**。
6. 打开仓库的 **Settings → Pages**。
7. `Build and deployment → Source` 选择 **GitHub Actions**。
8. 打开 **Actions**，此时应出现 `Deploy research website`。

合并后，如果部署因 `PUBLIC_ANALYTICS_ENDPOINT is empty` 失败，不是网页代码错误，而是网站拒绝再次发布一个“统计静默关闭”的版本。先完成 `ANALYTICS_BACKEND_中文.md`，再在 Actions 中重新运行。

## 2. GitHub Desktop 为什么现在不好用

通常是下列状态叠加造成：

- 本地目录仍指向旧提交或旧分支；
- 把压缩包内容覆盖到一个带有大量未提交改动的旧仓库；
- 复制时漏掉 `.github`、`.gitignore` 等以点开头的目录或文件；
- 远端又通过网页上传产生了新提交，本地与远端同时前进；
- GitHub Desktop 因此无法把这批文件识别为一次干净、可推送的更新。

不要继续在这个混合目录上反复覆盖。最可靠的方法是保留备份后重新克隆。

## 3. GitHub Desktop 干净恢复（无命令行）

### 第 1 步：保留旧目录

1. 完全退出本地预览终端。
2. 在文件管理器中找到旧的 `XMZhangAI.github.io` 文件夹。
3. 重命名为 `XMZhangAI.github.io-OLD-BACKUP`。
4. 暂时不要删除它。

### 第 2 步：从远端重新克隆

1. 打开 GitHub Desktop，确认右上角登录的是 `XMZhangAI`。
2. 点击 **File → Clone repository…**。
3. 在 **GitHub.com** 标签中选择 `XMZhangAI/XMZhangAI.github.io`。
4. `Local path` 选择一个新的空目录；不要选择刚才的备份目录。
5. 点击 **Clone**。
6. 顶部 `Current branch` 选择 `main`。
7. 点击 **Fetch origin**，直到没有待拉取内容。

### 第 3 步：以后如何更新

1. 在 GitHub Desktop 中点击 **Current branch → New branch**。
2. 分支名使用 `content/简短主题`，例如 `content/update-mariolm`。
3. 在新克隆目录中修改源码。
4. 回到 GitHub Desktop，逐项检查 `Changes`。
5. 左下角写清楚 Summary，例如 `Expand MarioLM project dossier`。
6. 点击 **Commit to content/update-mariolm**。
7. 点击 **Publish branch**。
8. 点击 **Create Pull Request**，在网页上合并到 `main`。

这样每次变更都有可审查、可回退的 PR，不需要直接覆盖 `main`。

## 4. 如果必须用本压缩包整体替换

仅在没有修复 PR 时使用。

1. 按第 3 节重新克隆一个干净仓库。
2. 在 GitHub Desktop 新建分支 `rebuild/final-20260716`。
3. 完整解压交付包。
4. 把压缩包根目录中的“内容”复制到新克隆仓库根目录，不要额外套一层文件夹。
5. 必须确认这些文件确实存在：

   ```text
   .github/workflows/deploy.yml
   .gitignore
   package.json
   package-lock.json
   astro.config.mjs
   src/pages/index.astro
   ```

6. 不要复制 `node_modules/`、`.astro/`、`tmp/`。
7. GitHub Desktop 中应看到源码变更以及 `.github/workflows/deploy.yml`。
8. Commit → Publish branch → Create Pull Request。

macOS Finder 默认可能隐藏点文件。按 `Command + Shift + .` 显示隐藏文件。Windows 文件资源管理器可在 **View → Show → Hidden items** 打开隐藏项目。

## 5. 本地一键检查

首次使用需要 Node.js 22.12 或更高版本。

- Windows：双击 `CHECK_WEBSITE_WINDOWS.bat`。
- macOS/Linux：右键或终端运行 `./CHECK_WEBSITE_MAC_LINUX.command`。

手动方式：

```bash
npm install
npm run social
npm run verify
npm run preview:dist
```

浏览器打开终端显示的本地地址。`npm run verify` 必须以以下结果结束：

```text
0 errors
0 warnings
0 missing local references
```

## 6. GitHub Pages 必做设置

1. 仓库 → **Settings → Pages**。
2. `Build and deployment → Source` 选择 **GitHub Actions**。
3. 仓库 → **Settings → Secrets and variables → Actions → Variables**。
4. 在仍使用 GitHub 默认域名时：

   ```text
   PUBLIC_SITE_URL = https://xmzhangai.github.io
   ```

5. 按 `ANALYTICS_BACKEND_中文.md` 部署后台后，再添加：

   ```text
   PUBLIC_ANALYTICS_ENDPOINT = https://你的-worker.workers.dev/collect
   ```

6. 打开 **Actions → Deploy research website → Run workflow → Run workflow**。
7. `build` 与 `deploy` 两个 job 都变绿后再检查线上页面。

## 7. 如何判断是网站故障还是统计故障

- `build` 失败：打开失败步骤的日志，通常是缺变量、后台健康检查或源码检查失败。
- `build` 成功、`deploy` 失败：检查 Settings → Pages 是否选择 GitHub Actions，以及 Pages 权限。
- 网站正常但统计为 0：按 `ANALYTICS_BACKEND_中文.md` 第 0、9、13 节检查页面 meta、Network `/collect`、CORS 与 D1。
- Actions 中完全没有工作流：默认分支仍缺少 `.github/workflows/deploy.yml`，或该文件尚未合并到 `main`。

## 8. 官方操作参考

- GitHub Desktop 克隆仓库：<https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop>
- GitHub Desktop 推送变更：<https://docs.github.com/en/desktop/making-changes-in-a-branch/pushing-changes-to-github-from-github-desktop>
- GitHub Pages 自定义工作流：<https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>

