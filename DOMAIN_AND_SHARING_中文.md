# 域名、Stanford 定向与外部缩略图：完整设置指南

## 1. 域名结论

域名有明显优化空间。`xmzhangai.github.io` 适合作为稳定的 GitHub Pages 基础地址，但不应长期承担主要品牌入口。

推荐优先级：

1. **`xuanming.ai`**：首选。最短、最易记，适合研究品牌、演讲、论文署名和长期对外传播。
2. **`xmzhang.ai`**：次选。与 GitHub 用户名 `XMZhangAI`、Stanford 路径 `zhangxm` 的识别连续性最好，但口头传播略弱。
3. **`xuanmingzhang.ai`**：最明确但偏长，可作为防御性域名或首选不可用时的备选。
4. **`zhangxm.ai`**：适合防御性注册并跳转，不建议作为公众主域名。

不要使用 `xuanmingzhang.com`：截至本次核查，它已经由另一位同名研究者使用，容易造成身份混淆。

域名是否可购买会实时变化。最终购买前必须在 Cloudflare Registrar、Namecheap、Porkbun 等注册商页面再次确认。

## 2. 推荐的最终入口结构

```text
xuanming.ai                         主站与唯一 canonical
www.xuanming.ai                     跳转至主站
xmzhangai.github.io                 GitHub Pages 自动兼容入口
web.stanford.edu/people/zhangxm     Stanford 机构入口，定向到主站
analytics.xuanming.ai/admin         私有分析后台（购买域名后可配置）
```

搜索引擎和分享卡统一把 `xuanming.ai` 作为 canonical；Stanford URL 保留机构背书和历史可达性，但不产生一份重复内容。

## 3. 购买域名后的 GitHub Pages 设置

以下以 `xuanming.ai` 为例。

### 第 1 步：设置仓库文件

1. 把 `public/CNAME.example` 重命名为 `public/CNAME`。
2. 删除文件内的说明行，只保留：

```text
xuanming.ai
```

3. GitHub 仓库 → **Settings → Secrets and variables → Actions → Variables**。
4. 新建变量：

```text
Name:  PUBLIC_SITE_URL
Value: https://xuanming.ai
```

本仓库的 `astro.config.mjs`、canonical、sitemap、robots 和分享图绝对地址都会在构建时自动使用这个域名，不再需要逐文件替换。

### 第 2 步：设置 DNS

如果使用 Cloudflare DNS：

1. 添加根域记录，使 `xuanming.ai` 指向 `XMZhangAI.github.io`。Cloudflare 支持根域 CNAME flattening。
2. 添加 `www` 的 CNAME，目标同样为 `XMZhangAI.github.io`。
3. 第一次配置时先选择 **DNS only**，等 GitHub 证书签发并确认无误后再决定是否启用代理。
4. 不要设置通配符 DNS（`*`），以免产生域名接管风险。

若注册商不支持根域 CNAME flattening，请严格按照 GitHub Pages 当前官方文档为 apex domain 设置其最新 A/AAAA 记录，不要从旧教程复制可能过期的 IP。

### 第 3 步：在 GitHub 开启域名

1. 仓库 → **Settings → Pages**。
2. **Custom domain** 填入 `xuanming.ai`。
3. 等待 DNS check 通过。
4. 等待 TLS 证书签发；可能需要数分钟到数小时。
5. 勾选 **Enforce HTTPS**。
6. 重新运行一次 `Deploy research website` Action。

### 第 4 步：确认跳转

依次检查：

```text
https://xuanming.ai/
https://www.xuanming.ai/
https://xmzhangai.github.io/
```

三者最终都应到达主域名，地址栏显示 HTTPS，页面样式与图片完整。

## 4. 保留 Stanford 定向导航

不要删除 `web.stanford.edu/people/zhangxm`。它继续作为机构身份入口，只需要把目标从 GitHub Pages 地址改成新主域名。

如果该 Stanford 目录使用静态 `index.html`，替换为：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Xuanming Zhang</title>
    <link rel="canonical" href="https://xuanming.ai/">
    <meta http-equiv="refresh" content="0;url=https://xuanming.ai/">
    <script>location.replace('https://xuanming.ai/' + location.search + location.hash)</script>
  </head>
  <body>
    <p>Continue to <a href="https://xuanming.ai/">Xuanming Zhang's research website</a>.</p>
  </body>
</html>
```

这样 Stanford 地址仍然可点击、可引用，同时不会留下过时的第二套主页。

## 5. 本版分享缩略图

本仓库已提供独立的 1200×630 PNG：

```text
Homepage                 public/assets/meta/og-home-2026.png
Field Notes              public/assets/meta/og-notes.png
MetaMind dossier         public/assets/meta/og-metamind.png
Technical contribution  public/assets/meta/og-metamind-technical.png
Cognitive frontier       public/assets/meta/og-metamind-cognitive.png
```

每个页面均包含：

- Open Graph 标题、描述、图片、图片类型、尺寸和 alt；
- Twitter/X large image card；
- 绝对 canonical 和绝对图片 URL；
- 文章发布日期、修改日期和作者信息；
- Schema.org Person / Article 数据。

MetaMind 卡片不再使用 “two essays” 这类模糊标签，而是直接表达：

- `NeurIPS 2025 Spotlight`；
- `Technical contribution + cognitive frontier`；
- `16+ model backbones`；
- `+35.7% real social scenarios`；
- `infer → refine → validate` 的技术结构。

## 6. 发布后让外部平台重新抓取

外部平台会缓存旧卡片。部署成功后：

1. 先在浏览器直接打开分享图 URL，确认 HTTP 200 和图片可见。
2. 使用 LinkedIn Post Inspector 重新抓取主页与两篇文章。
3. 使用 Facebook Sharing Debugger 点击 **Scrape Again**。
4. 在 Slack、Discord 或即时通讯工具中，可先用带版本参数的链接测试，例如：

```text
https://xuanming.ai/?preview=20260713
```

5. 不要频繁改回旧图片文件名；本版主页使用新的 `og-home-2026.png` 路径用于主动刷新缓存。

## 7. 最终检查清单

- [ ] 主域名 HTTPS 正常；
- [ ] `www`、GitHub Pages 和 Stanford 地址均定向到主域名；
- [ ] 页面源代码中的 `og:image` 是完整 HTTPS URL；
- [ ] 分享图为 1200×630、PNG、文件小于 5 MB；
- [ ] LinkedIn / Facebook 调试器能看到新卡；
- [ ] 分析后台的 `ALLOWED_ORIGINS` 已加入新域名；
- [ ] GitHub Actions 变量 `PUBLIC_SITE_URL` 已设置。
