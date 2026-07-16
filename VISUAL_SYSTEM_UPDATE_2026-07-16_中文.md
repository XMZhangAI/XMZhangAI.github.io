# 视觉系统最终更新说明

本次更新对应 2026-07-16 提出的七项修正，并在此基础上从设计师、研究科学家、科技企业高管与大众读者四个视角完成全站审视。

## 1. 三套原创视觉素材

- `public/assets/images/field-notes-atlas-v2.webp`：Field Notes 的研究地图，连接模型内部机制、社会认知与长期世界。
- `public/assets/images/metamind-hypothesis-field-v2.webp`：MetaMind 的多假设、约束收敛、行动与记忆闭环。
- `public/assets/images/metamind-technical-instrument-v2.webp`：技术贡献稿的三阶段计算装置。

素材均为 1920×1080 WebP，并被用于站内卡片、文章头图与 1200×630 分享预览。数值图、研究流程图和交互示例仍使用代码原生实现，避免生成图像改变研究事实。

## 2. 分享预览与站内卡片

- 重制 `og-notes.png`、`og-metamind.png`、`og-metamind-technical.png`。
- Notes、MetaMind dossier 与两篇 field note 卡片采用一致的深色研究视觉语言。
- 图片保持自然比例，使用响应式裁切而不是拉伸。
- 为所有关键图片补充语义化英文替代文本。

## 3. 首页长期轨迹

- Case 03 改为带清晰坐标、图例、数值和失效时刻的轨迹折线图。
- Research Instrument 的第三个互动面板改为可拖动的五步事件追踪。
- 每一步同时显示局部回答质量、关系信任和用户自主性，直接解释“局部回答仍好，但全局轨迹已经恶化”。

## 4. 研究索引

首页 trustworthy code intelligence 卡片现为每项工作分别提供原始索引：

- DevEval
- EvoCodeBench
- CDD / TED
- Seeker

## 5. 技术稿 Figure 1

- 将系统总览、三阶段解释与社会记忆整合成一幅交互图。
- 使用一个具体歧义话语贯穿 hypothesis generation、norm-aware selection、response validation。
- 支持自动播放、暂停、手动阶段选择和键盘左右键操作。
- 遵守 `prefers-reduced-motion`。

## 6. Notation、Capability 与 Evidence

- Notation 默认折叠，点击后展开完整符号与配置。
- Capability profile 改为六行精确对比图，不再出现 Knowledge 柱与数字重叠。
- 每个能力维度增加面向非专业读者的定义。
- 删除图内重复标题和所有 “redrawn / redesigned” 表面说明。
- caption 改为解释研究结果的结构性含义。
- Evidence 的四张结果卡与表格合并为一张信息完整的表，并增加专家盲评行和结果解释。

## 7. 四类视角结论

### 顶级设计师

视觉系统现在使用一致的午夜蓝、认知青和小面积琥珀色；生成艺术负责氛围，原生图表负责事实。重复卡片和无语义装饰被移除。

### 研究科学家

图表保留原始数值、尺度与对照；caption 解释可推断结论而不是制作过程；证据、机制与局限在信息架构上明确分离。

### 科技企业高管

首页能够迅速传达三个产品化研究轴：推理机制、交互认知、长期世界；每个方向同时给出工作系统、量化证据与原始索引。

### 大众读者

歧义话语示例、能力定义和长期轨迹事件使关键思想无需阅读论文也可理解；高级 notation 保留但不再阻断阅读。

## 8. 验收命令

```bash
npm ci
npm run social
PUBLIC_ANALYTICS_ENDPOINT=https://analytics.example.com/collect npm run verify
```

正式发布仍需在 GitHub Actions Variables 中设置真实 `PUBLIC_ANALYTICS_ENDPOINT`。
