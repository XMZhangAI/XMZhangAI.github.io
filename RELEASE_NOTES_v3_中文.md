# v3 最终优化说明

## 保持不变

用户已满意的主页核心视觉系统、Research Instrument、Selected Systems、Publications、Trajectory、MarioLM 页面和全站字体/动效基调均保留，没有进行无关改版。

## 本次实质修改

### 域名与 canonical

- 主域名首选建议：`xuanming.ai`；次选：`xmzhang.ai`。
- 保留 `web.stanford.edu/people/zhangxm`，只把跳转目标改到新主域名。
- `PUBLIC_SITE_URL` 构建变量会自动更新 canonical、Open Graph、sitemap、robots 与结构化数据。

### 外部分享卡

- 重制主页分享卡：加入本人肖像、研究主轴、Qwen 身份及 NeurIPS/ACL/ICLR 证据。
- 重制 MetaMind 专题卡：删除 “two essays”，改为 `Technical contribution + cognitive frontier`。
- 明确展示 `NeurIPS 2025 Spotlight`、`16+ models evaluated / 14 paired comparisons`、`+35.7% real social scenarios` 与三阶段系统。
- 为技术稿和认知稿分别制作独立分享卡。
- 补齐 Open Graph、Twitter/X、图片尺寸/格式/alt、article time 与 Schema.org。

### MetaMind 技术贡献稿

- 根据 46 页原论文重新核验并全英文重写。
- 将内容重构为：问题定义、三阶段架构、数学目标、跨模型/跨任务证据、消融、人类评估、技术意义、局限与下一步。
- 使用论文可核验数字；删除或修正模糊、混合口径和不区分证据层级的表达。
- 使用论文原图与适配网页叙事的指标/结构组件，不把论文图当装饰。

### MetaMind 认知前景稿

- 全英文重写为 research agenda。
- 明确区分 `Observed / Inferred / Hypothesized / Tested next`。
- 把原稿中的三个范式与四个 Beyond/Toward 重新组织为：scaffold、protocol、learned policy、latent state；scale→structure、tokens→state、labels→process、benchmarks→worlds。
- 新增可证伪条件、风险边界和现实校准要求，提高科学可信度。

### Blog 图片

- 所有主图、论文图和方图按原始比例渲染。
- 横图使用 `height:auto`；方图仅在正方形容器内 `object-fit:cover`；论文图 `object-fit:contain`。
- 移除旧文固定高度导致的纵向拉伸。
- Blog 档案、按钮、标题、描述、图注与旧 URL 跳转页全部改为英文。

### CV 与机会入口

- `CV.pdf` 已从源码和生产构建中移除，直接访问返回 404。
- Header 与 Hero 保留 `CV / Opportunities` 入口，跳转到 `/connect/`。
- 页面明确开放：frontier AI industry / research leadership，以及 CS、AI、Cognitive Science、Psychology 顶级 PhD programs。
- 提供邮件模板与 LinkedIn DM；CV 仅按需私下发送。

### 分析后台

- 新增 Cloudflare Worker + D1 第一方后台。
- 采集访问量、访客、会话、来源、UTM、国家/地区、设备、滚动、阅读时长、链接/联系/CV 请求等。
- 新增密码保护仪表盘、7/30/90 天切换、最近事件和 CSV 导出。
- 默认使用加盐访客标识和粗网段；完整 IP 为显式可选项。
- 默认 90 天自动清理；尊重 Do Not Track 和 Global Privacy Control。

## 必须由站点所有者完成的三项外部操作

1. 购买域名并按 `DOMAIN_AND_SHARING_中文.md` 配置 GitHub Pages 与 Stanford 跳转。
2. 按 `ANALYTICS_BACKEND_中文.md` 登录 Cloudflare、创建 D1、设置私密值并部署 Worker。
3. 发布后让 LinkedIn / Facebook 等平台重新抓取分享卡。

## 本地验证结果

- Astro：0 errors、0 warnings、0 hints。
- Worker TypeScript：0 errors。
- 14 个 HTML 页面、137 个本地引用：0 missing。
- HTML validation：0 errors。
- 主页、两篇 MetaMind 长文、档案、Connect、Privacy、MarioLM、四张分享图、robots、sitemap：HTTP 200。
- `/CV.pdf`：HTTP 404（预期行为）。
- 无 Service Worker；无公开 CV；Blog 主页面无中文内容。
