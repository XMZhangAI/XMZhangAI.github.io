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

首选 `xuanming.ai`，次选 `xmzhang.ai`。不要使用已被另一位同名研究者占用的 `xuanmingzhang.com`。

本版已把域名改为构建变量：购买后无需逐文件替换 canonical、sitemap 或 Blog 链接。完整 DNS、GitHub Pages、HTTPS、Stanford 定向和外部分享卡刷新步骤见：

[DOMAIN_AND_SHARING_中文.md](DOMAIN_AND_SHARING_中文.md)

## C. 流量分析与 IP

默认没有填写采集地址，因此不会发送访问数据。仓库已包含 Cloudflare Worker + D1 的完整后台、密码保护仪表盘、CSV 导出、访客/会话/阅读行为记录、粗网段与可选完整 IP。

严格按以下文档操作：

[ANALYTICS_BACKEND_中文.md](ANALYTICS_BACKEND_中文.md)
