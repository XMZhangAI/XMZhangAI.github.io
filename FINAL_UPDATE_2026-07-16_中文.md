# 最终更新说明（2026-07-16）

## 本轮完成

1. MarioLM 项目档案依据公开技术文档整体重建，不再是项目摘要：补全四层世界模型、L1–L6 依赖矩阵、事件链、用户模拟器、MarioEval → MarioOpt、HRD、EFPO、LCGD、初步证据、边界与后续路线，并加入可交互轨迹诊断台。
2. Stanford NLP Group 经历统一为：`Human-centered AI and social reasoning under uncertainty.`
3. MetaMind 口径统一为：完整研究覆盖 `16+ models`；图中展示论文 Figure 2 与 Table 6 可直接成对比较的 `14` 个模型。没有臆造另外两个数据点。
4. STSS 全称查证并改为论文原始名称：`Social Tasks in Sandbox Simulation`。
5. 能力图图例改为与图中一致的点状编码，并补齐六个能力维度定义。
6. 认知稿统一使用名词 `self-evolution`、形容词 `self-evolving`、动词 `self-evolve`；补入从 self-play 到持久更新、因果复测的逻辑桥梁。
7. 外部前沿研究锚点更新为 2025–2026 的 OpenAI agentic reasoning / harness engineering、Anthropic agent evaluation、AlphaEvolve、Darwin Gödel Machine、Hyperagents、Genie 3、AgentSociety 与大模型群体社会规范研究。唯一较早的外部引用是 MetaMind 实际使用的 2024 STSS 原始基准，保留用于准确归因。
8. 新增 MarioLM 专属 1200×630 分享卡；CI 每次发布前自动重新生成全部社交预览图。
9. 恢复并增强 `.github/workflows/deploy.yml`：PR 先验证，合并到 `main` 后才部署；正式部署会检查分析端点、Worker/D1 健康和 CORS。
10. GitHub Desktop 与域名说明从当前真实故障和“尚未购买域名”开始重写。

## 本地验证结果

```text
Astro diagnostics: 0 errors / 0 warnings / 0 hints
Static routes: 9
HTML files checked: 14
Local references checked: 140
Missing references: 0
Social cards: 7 × 1200×630
CV: private
Service worker: absent
```

## 发布前仍需由账号持有人完成

1. Cloudflare Worker 的三个 secret：`IP_SALT`、`ADMIN_USER`、`ADMIN_PASSWORD`。
2. GitHub Actions variable：`PUBLIC_ANALYTICS_ENDPOINT`。
3. Settings → Pages → Source：`GitHub Actions`。
4. 若购买域名，再设置 `PUBLIC_SITE_URL`、Pages Custom domain、DNS 与 Worker `ALLOWED_ORIGINS`。

这些项目涉及个人账号、密码或付款，代码不能替代账号持有人操作；对应逐屏步骤见：

- `DEPLOYMENT_中文.md`
- `ANALYTICS_BACKEND_中文.md`
- `DOMAIN_AND_SHARING_中文.md`

