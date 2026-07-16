# 从零购买域名、接入 GitHub Pages、保留 Stanford 导航与分享预览

## 0. 当前假设：你还没有购买任何域名

下面从注册商账号、查询、付款开始，不预设你已经持有域名。购买前不需要改代码，也不要先把一个尚未属于你的域名填入 GitHub。

推荐优先级：

1. `xuanming.ai`：最短、最自然，适合研究品牌、演讲与长期传播。
2. `xmzhang.ai`：与 GitHub 用户名及 Stanford 路径的识别连续性最好。
3. `xuanmingzhang.ai`：身份最明确，但偏长。
4. `zhangxm.ai`：适合防御性注册并跳转，不建议作为主入口。

域名库存与价格实时变化。文档中的名称是品牌建议，不代表当前一定可购买；必须以付款前的实时搜索结果为准。

## 1. 购买域名：逐屏操作

推荐使用 Cloudflare Registrar：它已经支持 `.ai`，按注册局与 ICANN 成本定价，不额外加价，并直接整合 DNS、DNSSEC 与 SSL。若你更习惯 Namecheap 或 Porkbun，也可以购买后把 DNS 托管到 Cloudflare。

### 第 1 步：创建并保护 Cloudflare 账号

1. 打开 <https://dash.cloudflare.com/sign-up>。
2. 使用长期可控的个人邮箱注册，不要使用将来可能失效的学校或公司邮箱。
3. 验证邮箱。
4. 右上角头像 → **My Profile → Authentication**。
5. 开启双因素认证；优先使用验证器或安全密钥。
6. 保存恢复代码到密码管理器。

### 第 2 步：搜索候选域名

1. Cloudflare Dashboard → **Domain Registration → Register Domains**。
2. 依次搜索：

   ```text
   xuanming.ai
   xmzhang.ai
   xuanmingzhang.ai
   zhangxm.ai
   ```

3. 记录每个可购域名的首次注册总价、注册年限、续费价。
4. `.ai` 的付款年限可能由注册局规则决定；以结算页为准。
5. 不要为了“看起来接近”购买带连字符、数字或难以口述的替代品。

### 第 3 步：购买

1. 若 `xuanming.ai` 可用且续费成本可接受，优先选择它。
2. 添加到购物车。
3. 开启 **Auto-renew**。
4. 确认注册联系人信息准确。
5. 完成付款。
6. 在 **Manage Domains** 中确认状态为 Active。
7. 立即启用 DNSSEC（若控制台未自动启用）。

购买后先记下最终域名。下文用 `xuanming.ai` 举例；如果你购买的是其他域名，将所有 `xuanming.ai` 替换为实际域名。

## 2. 购买后先在 GitHub 验证域名

GitHub 官方建议先验证所有权，再配置 Pages 与 DNS，以降低域名接管风险。

1. GitHub 右上角头像 → **Settings**。
2. 左侧 **Pages**。
3. **Add a domain**，输入 `xuanming.ai`。
4. GitHub 会给出一个 TXT 记录名称和值。
5. Cloudflare → 选择 `xuanming.ai` → **DNS → Records → Add record**。
6. Type 选 `TXT`，Name 与 Content 精确粘贴 GitHub 提供的值。
7. 保存，回到 GitHub 点击 **Verify**。
8. 验证通过后不要删除该 TXT 记录。

## 3. 把 GitHub Pages 设为自定义域名

1. 打开 <https://github.com/XMZhangAI/XMZhangAI.github.io/settings/pages>。
2. `Build and deployment → Source` 选择 **GitHub Actions**。
3. `Custom domain` 输入 `xuanming.ai`，点击 **Save**。
4. 此时 HTTPS 可能暂时不可选，先继续配置 DNS。

注意：本项目使用自定义 GitHub Actions 工作流发布。GitHub 官方说明这种方式不需要仓库里的 `CNAME` 文件；Pages 设置与 DNS 才是有效配置。

## 4. 在 Cloudflare 添加 DNS

第一次接入先全部使用 **DNS only（灰云）**，不要开代理，等 GitHub 签发证书后再评估是否需要代理。

删除 Cloudflare 自动生成、但与你网站无关的根域停车记录，然后添加：

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| CNAME | `www` | `xmzhangai.github.io` | DNS only |

这些是 GitHub Pages 当前官方记录。不要添加 `*` 通配符记录；GitHub 明确警告它会增加域名接管风险。

可选 IPv6 记录：

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

DNS 最多可能需要 24 小时传播，通常会更快。

## 5. 设置网站的 canonical 域名

1. 仓库 → **Settings → Secrets and variables → Actions → Variables**。
2. 新建或更新：

   ```text
   Name:  PUBLIC_SITE_URL
   Value: https://xuanming.ai
   ```

3. Actions → **Deploy research website → Run workflow**。
4. 等 `build` 与 `deploy` 变绿。

该变量会统一 canonical、Open Graph、Twitter Card、Schema.org、sitemap 与 robots 中的绝对 URL。

## 6. 开启 HTTPS 并验收跳转

1. 回到仓库 **Settings → Pages**。
2. 等待 DNS check 通过与证书签发。
3. 勾选 **Enforce HTTPS**。
4. 依次打开：

   ```text
   https://xuanming.ai/
   https://www.xuanming.ai/
   https://xmzhangai.github.io/
   ```

5. 最终地址栏应统一显示 `https://xuanming.ai/`，且没有证书警告。
6. 查看页面源代码，搜索 `canonical` 与 `og:image`，都应使用新域名。

如果证书 24 小时后仍未签发：确认 Cloudflare 为 DNS only、没有冲突的 A/AAAA/CNAME 记录，并重新在 Pages 保存一次 Custom domain。

## 7. 保留 Stanford 机构入口

不要删除 `https://web.stanford.edu/people/zhangxm`。它保留为可信的机构导航，只把目标改成新的主域名。

如果该目录由静态 `index.html` 控制，使用：

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

上传后测试 Stanford 地址，确认 query 与 hash 也会保留。Stanford URL 是入口，不是第二份网站；主站内容只维护一份。

## 8. 同步分析后台允许域名

打开 `optional/analytics-worker/wrangler.toml`，把新域名加入：

```toml
ALLOWED_ORIGINS = "https://xmzhangai.github.io,https://xuanming.ai,https://www.xuanming.ai,http://127.0.0.1:4173,http://localhost:4321"
```

然后在 `optional/analytics-worker/` 目录重新执行：

```bash
npm run deploy
```

如果漏掉这一步，新域名上的 `/collect` 会被 CORS 拒绝，统计再次显示为 0。

## 9. 本版分享预览图

所有卡片都是 1200×630 PNG，并配有 Open Graph 与 Twitter/X metadata：

```text
Homepage                 public/assets/meta/og-home-2026.png
Field Notes              public/assets/meta/og-notes.png
MetaMind dossier         public/assets/meta/og-metamind.png
Technical contribution  public/assets/meta/og-metamind-technical.png
Cognitive frontier       public/assets/meta/og-metamind-cognitive.png
MarioLM dossier          public/assets/meta/og-mariolm.png
```

发布后先直接打开每张图片 URL，确认 HTTP 200。外部平台可能缓存旧图，可使用：

1. LinkedIn Post Inspector；
2. Facebook Sharing Debugger 的 **Scrape Again**；
3. Slack/Discord/即时通讯中使用一次带版本参数的测试链接，例如 `?preview=20260716`。

## 10. 最终检查清单

- [ ] 域名确实已购买并开启自动续费；
- [ ] GitHub 账号 Pages 中域名已验证；
- [ ] 仓库 Pages Source 为 GitHub Actions；
- [ ] Custom domain 保存成功；
- [ ] 四条 A 与 `www` CNAME 正确且先为 DNS only；
- [ ] `PUBLIC_SITE_URL` 已改为新域名；
- [ ] `PUBLIC_ANALYTICS_ENDPOINT` 已设置；
- [ ] Worker `ALLOWED_ORIGINS` 已加入新域名；
- [ ] Enforce HTTPS 已开启；
- [ ] GitHub、`www` 与 Stanford 入口都到达主域名；
- [ ] canonical、sitemap 与分享图 URL 都使用主域名；
- [ ] LinkedIn 等平台能抓取新版卡片。

## 11. 官方参考

- Cloudflare `.ai` 注册支持：<https://developers.cloudflare.com/changelog/post/2025-03-27-ai-domains-available/>
- GitHub Pages 自定义域名：<https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>
- Cloudflare DNS 记录：<https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/>
