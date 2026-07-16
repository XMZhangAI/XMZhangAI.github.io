# 第一方分析后台：从零部署与查看数据

## 0. 本次“连续数日为 0”的已确认根因

线上取证结果不是“访客太少”，而是前端根本没有启用采集：

1. 已发布主页的 `<meta name="analytics-endpoint">` 内容为空；
2. GitHub 主分支当时实际使用的 `.github/workflows/deploy.yml` 没有把 `PUBLIC_ANALYTICS_ENDPOINT` 传给 Astro 构建；
3. 因而 `src/scripts/analytics.ts` 在入口判断时直接停止，浏览器不会发出 `/collect` 请求，后台必然始终为 0。

本版已进行三层修复：

- 部署工作流把仓库变量注入构建；
- 生产构建在变量为空、不是 HTTPS、或不以 `/collect` 结尾时直接失败，避免再次“部署成功但统计静默关闭”；
- 上报优先使用可验证的 `fetch + keepalive`，失败后才回退到 `sendBeacon`；请求改用 CORS 简单请求兼容的 `text/plain`，Worker 同时兼容解析。

部署后只需按下面四步验收：

1. 打开主页，右键“查看网页源代码”，搜索 `analytics-endpoint`。`content` 必须是完整的 `https://.../collect`，不能是空字符串。
2. 打开浏览器开发者工具 Console，运行：

   ```js
   document.documentElement.dataset.analytics
   ```

   正常应返回 `active`。若返回 `privacy-disabled`，当前浏览器开启了 Do Not Track 或 Global Privacy Control；换一个未开启该信号的测试环境。若返回 `unconfigured`，说明发布包仍未注入端点。
3. 在 Network 面板搜索 `collect`，刷新页面。应看到 `POST` 请求并返回 `202`。
4. 打开 Worker 的 `/admin`，点击 `Refresh`；应出现 `page_view`。再滚动和点击链接，应继续出现 `scroll_depth` 与 `link_click`。

这四个信号分别验证：构建注入、前端启用、跨域传输、D1 入库。不要只看最后一个数字判断故障位置。

本仓库已经包含完整后台：`optional/analytics-worker/`。它适用于 GitHub Pages 静态站，不需要把主页迁移到动态服务器。

启用后可查看：

- 页面浏览量、近似独立访客、会话数；
- 每日趋势、热门页面、来源域名、UTM 活动；
- 国家、地区、城市和 Cloudflare 节点；
- 浏览器 User-Agent、语言、视窗、屏幕尺寸；
- 滚动 25% / 50% / 75% / 90%；
- 有效阅读时长与页面停留时长；
- 论文、代码、项目、引用、联系和 CV 请求点击；
- 最近 100 条访问事件；
- 7 / 30 / 90 天切换和 CSV 导出；
- 每日自动删除超过保留期限的数据。

通用模板 `wrangler.toml.example` 默认只记录稳定加盐访客标识、每日加盐标识、IPv4 `/24` 或 IPv6 `/48` 粗网段。按照本项目对 IP 访问记录的要求，随包保留的现有 `wrangler.toml` 已设置 `STORE_RAW_IP = "true"`；公开隐私页也已同步说明，见第 10 节。

## 1. 需要准备什么

1. 一个 Cloudflare 账号；免费计划即可开始。
2. Node.js 22.12 或更高版本。
3. 本压缩包完整解压后的目录。
4. 约 15–25 分钟。

## 2. 安装后台依赖

打开终端，进入：

```bash
cd optional/analytics-worker
npm install
```

检查：

```bash
npm run typecheck
```

应无 TypeScript 错误。

## 3. 登录 Cloudflare

```bash
npx wrangler login
```

浏览器会打开 Cloudflare 授权页面。选择账号并同意。完成后回到终端。

验证：

```bash
npx wrangler whoami
```

## 4. 创建 D1 数据库

```bash
npx wrangler d1 create xmz-analytics
```

终端会返回 `database_id`。复制这串 ID。

然后：

1. 把 `wrangler.toml.example` 复制为 `wrangler.toml`。
2. 打开 `wrangler.toml`。
3. 把 `REPLACE_WITH_D1_DATABASE_ID` 替换为刚才的 ID。

Windows PowerShell：

```powershell
Copy-Item wrangler.toml.example wrangler.toml
```

macOS / Linux：

```bash
cp wrangler.toml.example wrangler.toml
```

## 5. 初始化数据库表

```bash
npx wrangler d1 execute xmz-analytics --remote --file=schema.sql
```

看到执行成功后，可检查：

```bash
npx wrangler d1 execute xmz-analytics --remote --command="SELECT name FROM sqlite_master WHERE type='table';"
```

应看到 `events`。

## 6. 设置三个私密值

### 6.1 IP 加盐

生成随机值：

macOS / Linux：

```bash
openssl rand -hex 32
```

Windows PowerShell：

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

复制输出，然后：

```bash
npx wrangler secret put IP_SALT
```

按提示粘贴。输入不会显示，这是正常的。

### 6.2 后台用户名

```bash
npx wrangler secret put ADMIN_USER
```

可填写只有你知道的用户名，不建议使用 `admin`。

### 6.3 后台密码

```bash
npx wrangler secret put ADMIN_PASSWORD
```

使用密码管理器生成至少 20 位随机密码。

这些值不会写入代码仓库。

## 7. 配置允许访问主页的域名

打开 `wrangler.toml`：

```toml
ALLOWED_ORIGINS = "https://xmzhangai.github.io,http://127.0.0.1:4173,http://localhost:4321"
```

购买自定义域名后，改为：

```toml
ALLOWED_ORIGINS = "https://xmzhangai.github.io,https://xuanming.ai,https://www.xuanming.ai,http://127.0.0.1:4173,http://localhost:4321"
```

不要使用 `*`。只允许自己的站点向后台写入事件。

## 8. 部署后台

```bash
npm run deploy
```

成功后会得到类似：

```text
https://xmz-research-analytics.<your-subdomain>.workers.dev
```

先打开：

```text
https://xmz-research-analytics.<your-subdomain>.workers.dev/health
```

   应返回（`database: "ready"` 表示 Worker 与 D1 绑定都可用）：

```json
{"ok":true,"service":"xmz-research-analytics","database":"ready"}
```

采集地址是在末尾加 `/collect`：

```text
https://xmz-research-analytics.<your-subdomain>.workers.dev/collect
```

## 9. 让主页开始发送数据

### GitHub Actions 发布

1. GitHub 仓库 → **Settings**。
2. **Secrets and variables → Actions → Variables**。
3. 点击 **New repository variable**。
4. 填写：

```text
Name:  PUBLIC_ANALYTICS_ENDPOINT
Value: https://xmz-research-analytics.<your-subdomain>.workers.dev/collect
```

5. 保存。
6. 仓库 → **Actions → Deploy research website → Run workflow**。

新版 workflow 会在构建时把地址写入页面。没有设置该变量时，发布会明确失败并指出变量缺失，不再生成统计被静默关闭的线上版本。

### 本地测试

在主页仓库根目录复制 `.env.example` 为 `.env`，填写：

```text
PUBLIC_ANALYTICS_ENDPOINT=https://xmz-research-analytics.<your-subdomain>.workers.dev/collect
```

然后：

```bash
npm run build
npm run preview:dist
```

访问几页、滚动、点击论文链接，再进入后台检查。

## 10. 如何查看流量、IP 与浏览记录

打开：

```text
https://xmz-research-analytics.<your-subdomain>.workers.dev/admin
```

浏览器会弹出用户名/密码框。输入第 6 节设置的 `ADMIN_USER` 和 `ADMIN_PASSWORD`。

仪表盘功能：

- 顶部卡片：Page views、Visitors、Sessions、Engaged minutes、CV requests、Link clicks；
- `7 days / 30 days / 90 days`：切换时间范围；
- Page views over time：每日趋势；
- Top pages / Referrers / Countries / Events / Campaigns：排行；
- Recent event stream：精确时间、事件、页面、国家、网段/IP、来源和访客标识；
- `Export CSV`：下载最多 50,000 条当前时间范围内的数据。

当 `STORE_RAW_IP = "false"` 时，`Network / IP` 显示粗网段，例如：

```text
203.0.113.0/24
2001:db8:abcd::/48
```

同时保存不可逆的加盐访客标识，用于计算 7/30/90 天的近似独立访客，但后台不会显示真实 IP。

### 当前项目的完整 IP 配置

当前随包的现有配置已经开启完整 IP，并设定 90 天自动删除；若你希望恢复隐私优先模式，把该值改为 `false` 后重新部署 Worker。

1. 打开 `wrangler.toml`，确认当前值：

```toml
STORE_RAW_IP = "true"
RETENTION_DAYS = "90"
```

2. 主页 `/privacy/` 已说明会收集请求 IP；如果你修改配置，也要同步修改公开说明。
3. 若要关闭完整 IP，改为：

```toml
STORE_RAW_IP = "false"
```

4. 修改后重新部署：

```bash
npm run deploy
```

仪表盘会显示 `exact IP enabled` 警告，最近访问和 CSV 中将出现完整 IP。已开启后不要公开后台 URL、截图或 CSV。

## 11. 推荐：用 Cloudflare Access 再加一层保护

Basic Auth 已经内置。购买域名后，建议再把 Worker 绑定到：

```text
analytics.xuanming.ai
```

然后在 Cloudflare Zero Trust：

1. **Access controls → Applications**。
2. **Create new application → Self-hosted and private**。
3. Hostname 填 `analytics.xuanming.ai`。
4. Policy 只允许你的邮箱。
5. 保存。

这样访问 `/admin` 时先通过 Cloudflare 邮箱验证，再输入后台密码，形成双层保护。

注意：若 Access 保护整个域名，公开主页无法调用 `/collect`。正确做法是让 Access 只保护 `/admin*` 与 `/api/*`，或给采集端单独使用 `collect.xuanming.ai`。

## 12. 数据保留与手动查询

默认每天 03:17 UTC 自动删除 90 天以前的数据。修改：

```toml
RETENTION_DAYS = "90"
```

手动看最近记录：

```bash
npx wrangler d1 execute xmz-analytics --remote --command="SELECT occurred_at,event_name,path,country,network_prefix FROM events ORDER BY id DESC LIMIT 20;"
```

手动删除某日期以前的数据：

```bash
npx wrangler d1 execute xmz-analytics --remote --command="DELETE FROM events WHERE occurred_at < '2026-06-01T00:00:00.000Z';"
```

删除不可恢复，先使用仪表盘导出 CSV。

## 13. 故障排查

### 后台显示 0

1. 查看线上页面源代码，搜索 `analytics-endpoint`。
2. 确认其内容是完整 `/collect` URL。
3. 确认 GitHub Actions 在设置变量之后重新构建。
4. 确认 `ALLOWED_ORIGINS` 包含浏览器地址栏的精确 origin。
5. 如果浏览器启用了 Do Not Track / Global Privacy Control，本站会尊重设置，不发送事件。

### 浏览器控制台出现 CORS 403

`ALLOWED_ORIGINS` 少了当前域名，或 `http` / `https`、`www` 不一致。修改并重新 `npm run deploy`。

### `/admin` 一直要求密码

重新设置：

```bash
npx wrangler secret put ADMIN_USER
npx wrangler secret put ADMIN_PASSWORD
npm run deploy
```

### 数据库结构错误

确认执行的是：

```bash
npx wrangler d1 execute xmz-analytics --remote --file=schema.sql
```

不要省略 `--remote`，否则只初始化了本地开发数据库。
