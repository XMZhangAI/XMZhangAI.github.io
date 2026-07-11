# GitHub Pages 发布：逐步说明

## A. 推荐方式：Git + GitHub Actions

新版仓库已包含 `.github/workflows/deploy.yml`。每次推送到 `main`，GitHub 会自动安装依赖、检查、构建并发布 `dist/`。

### 第 1 步：安装工具

- Git：<https://git-scm.com/downloads>
- 可选 GitHub Desktop：<https://desktop.github.com/>

### 第 2 步：克隆现有仓库

```bash
git clone https://github.com/XMZhangAI/XMZhangAI.github.io.git
cd XMZhangAI.github.io
git switch -c rebuild-v2
```

### 第 3 步：替换旧站

先备份仓库。然后在克隆目录中执行：

```bash
git rm -r .
```

这条命令只删除当前仓库已经跟踪的旧站文件，不会删除 `.git` 历史。随后把本压缩包内的全部内容复制到克隆目录根部。

不要复制：

- `node_modules/`
- 本压缩包外部产生的临时文件

必须复制隐藏目录：

- `.github/`
- `.nojekyll`
- `.gitignore`

### 第 4 步：本地验证

```bash
npm install
npm run build
npm run preview:dist
```

### 第 5 步：提交并推送

```bash
git add -A
git commit -m "feat: rebuild research website"
git push -u origin rebuild-v2
```

进入 GitHub 仓库网页，点击 “Compare & pull request”，先建立 Draft PR。确认预览和文件变化后再合并到 `main`。

### 第 6 步：设置 Pages

1. 仓库 → Settings。
2. 左侧 → Pages。
3. Build and deployment → Source。
4. 选择 **GitHub Actions**。
5. 仓库 → Actions → `Deploy research website`。
6. 等待 build 与 deploy 都变成绿色。

发布地址：<https://xmzhangai.github.io/>

### 第 7 步：第一次发布后清缓存

访问：

```text
https://xmzhangai.github.io/reset-cache.html
```

点击清除按钮，然后硬刷新一次。新版不再注册 Service Worker，后续不会重复发生旧 CSS 与新 HTML 混用。

## B. 自定义域名

建议顺序：

1. `xuanming.ai`
2. `xmzhang.ai`
3. `xuanmingzhang.ai`

购买前必须在域名注册商确认实际可用性。

购买并在 GitHub 验证域名后：

1. 将 `public/CNAME.example` 重命名为 `public/CNAME`。
2. 文件内容改为实际域名，例如 `xuanming.ai`。
3. 将 `astro.config.mjs` 的 `site` 改为 `https://xuanming.ai`。
4. 将 `public/sitemap.xml`、`public/robots.txt` 和长文 canonical 中的旧域名替换为新域名。
5. 提交并推送。
6. Settings → Pages → Custom domain，输入域名。
7. DNS 生效后启用 Enforce HTTPS。

## C. 流量分析与 IP

默认版本没有启用任何分析，不发送访问数据。

最低维护方案：Cloudflare Web Analytics。它适合页面访问量、来源与性能指标。

需要论文、项目、CV 点击和近似独立访问量时，使用 `optional/analytics-worker/`：

1. 创建 Cloudflare 账号。
2. 安装 Wrangler：`npm install -g wrangler`。
3. 进入 `optional/analytics-worker/`。
4. 创建 D1 数据库并执行 `schema.sql`。
5. 设置 `IP_SALT` 与 `ALLOWED_ORIGIN` secret。
6. 部署 Worker。
7. 将 Worker URL 写入 `src/layouts/SiteLayout.astro` 的 `analytics-endpoint` meta。

参考 Worker 不保存原始 IP；仅生成每日轮换的加盐哈希。不要在没有明确隐私政策与保留期限的情况下启用原始 IP 存储。
