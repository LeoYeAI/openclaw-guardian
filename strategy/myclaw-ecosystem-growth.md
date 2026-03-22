# MyClaw 生态增长战略 v2.0

_目标：建立多样化的生态节点，每天稳定产生新增实例_
_Last updated: 2026-03-21 | Author: The Doctor 🌀_

---

## 🧭 核心逻辑

MyClaw 不是应用，是平台。平台的增长靠生态，不靠买量。

```
开源生态（流量入口）
        ↓
开发者 API（核心基础设施）—— MyClaw 唯一要做好的技术产品
        ↓
三类生态节点（开发者/渠道方自驱动）
        ↓
每日新增实例（目标）
```

**收敛后的核心原则：**
MyClaw 只做两件事——**把 API 做到极致好用**，**把生态节点激励设计好**。
具体场景、具体应用、具体内容，交给生态方去做。

---

## 🌐 第零层：开源生态（流量总闸）

这是所有节点的上游，做好了其他一切都受益。

### 动作 1｜成为 OpenClaw 官方推荐托管方
- 路径：先以技术贡献者身份进入（提 PR、修 bug）→ 建立可信度 → 谈官方合作
- 目标 A：OpenClaw README 加「推荐托管：MyClaw」官方链接
- 目标 B：OpenClaw 安装流程内嵌「一键迁移到 MyClaw」选项
- **价值：OpenClaw 27.5 万 stars，每天数万精准高意向 UV，永久免费流量**

### 动作 2｜开源工具矩阵，覆盖开发者工作流
每个工具 README 带「Powered by MyClaw」+ 注册链接，持续曝光品牌：

| 工具 | 作用 |
|------|------|
| myclaw-sdk-js / python | API 集成必用，开发者天天接触 |
| myclaw-cli | 命令行管理实例 |
| myclaw-templates | 常用 Agent 模板库，fork 即用 |
| openclaw-installer | 一键装 OpenClaw，结尾推 MyClaw 托管 |

### 动作 3｜「Install on MyClaw」按钮——Skill/App 联合增长引擎

这是一个独立的增长引擎，逻辑类比 Vercel 的「Deploy to Vercel」按钮，但更强：**它同时解决了用户获取和 skill 开发者商业化两个问题**。

**核心机制：**
- MyClaw 提供一个标准化嵌入按钮（SVG badge + 跳转链接），任何 skill/app 开发者都可以放在：
  - GitHub README（一行 Markdown）
  - 官网首页 Hero 区域
  - 文档站、ProductHunt 页面
- 用户点击后进入 MyClaw 托管的快捷安装流程：
  1. **已有 OpenClaw 实例**：一键安装该 skill 到自己的实例
  2. **没有实例**：实时创建一台新 OpenClaw 实例 + 预装该 skill，全程 < 60 秒

**开发者商业化激励（这才是让开发者主动铺按钮的原因）：**

| 触发行为 | 开发者获得 |
|----------|-----------|
| 用户通过按钮创建新实例并订阅 | 首月订阅收入 20% |
| 用户通过按钮安装 skill 并消耗 Token | Token 消耗持续 8% 分成 |
| Verified skill 额外加成 | 分成比例 +3% |

**飞轮效应：**
```
免费 skill 开发者放按钮（零成本）
        ↓
用户点击 → 进入 MyClaw 流程 → 新实例创建
        ↓
开发者获得持续 Token 分成
        ↓
开发者主动宣传自己的 skill → 带来更多用户
        ↓
MyClaw 获得精准高意向用户（已知需求场景）
```

**与「Deploy to Vercel」的核心差异：**
Vercel 按钮只解决部署，开发者无收益；MyClaw 按钮让开发者有**持续被动收入**，驱动力完全不同。免费 skill 变成了开发者的「分销渠道」。

**执行路径：**
- 技术：1个接口 + 1个落地页，2周 MVP
- 推广：先找 ClawHub top 50 热门 skill 作者定向邀请，给早期 Verified 认证 + 额外分成加成（+5%）
- 传播：每个开发者的 README 都变成 MyClaw 的免费广告位

### 动作 4｜ClawHub 做成「AI Skills 的 npm」
- **Verified 认证标签**：官方审核，解决恶意 skill 信任危机
- **Install on MyClaw 按钮**：任何 skill/app 仓库一键嵌入（见动作3）
- **开发者 Credits 分成**：热门 skill top 10% 开发者拿 token 奖励
- **飞轮效应**：skill 越丰富 → OpenClaw 越好用 → 更多人需要 MyClaw 托管

### 动作 4｜社区渗透，开源社区即 B2B 销售渠道
- 监控 OpenClaw Issues 里「self-hosting 太复杂」类帖子，团队真实介入帮助
- 开发者评估 → 推给公司使用 → 企业版漏斗自然形成

---

## ⚙️ 核心基础设施：开发者 API Platform

**这是整个生态战略的地基。入口一（嵌入场景）不再由 MyClaw 自己做，全部开放给开发者，他们用 API 构建。**

### MVP 五个核心接口

```
POST   /v1/instances              创建实例
GET    /v1/instances/:id          查询状态
DELETE /v1/instances/:id          销毁实例
POST   /v1/instances/:id/message  向实例发消息
POST   /v1/instances/:id/topup    充值 token
```

加 Webhook：实例状态变更 / token 余额不足时回调通知开发者。

### 开发者体验（DX）要求
- 5 分钟快速开始，复制 3 行代码跑通第一个实例
- Sandbox 环境（测试不扣费）
- Dashboard：实时查看带来的实例数 + 累计收益

### 开发者分成（激励生态构建者）

| 月带量 | 订阅分成（首月）| Token 分成（持续）|
|--------|----------------|------------------|
| 1–9 个 | 15% | 无 |
| 10–99 个 | 20% | 5% |
| 100–499 个 | 30% | 8% |
| 500+ | 定制 | 定制 |

**Token 持续分成是核心钩子**：开发者的用户越活跃，开发者赚得越多 → 主动优化用户深度使用 → MyClaw 留存同步提升。

### Partner Marketplace
在 MyClaw 官网做「Built on MyClaw」展示页：
- 所有基于 API 构建的应用上架展示
- 用户在这里发现各类垂直应用（Shopify 版、Notion 版、教育版…）
- 开发者有展示位和流量激励，持续做高质量产品
- MyClaw 不生产内容，只运营市场

### API 触达路径
1. OpenClaw GitHub README 加「Build on MyClaw API」
2. dev.myclaw.ai 开发者文档独立站
3. HackerNews Show HN 发布
4. Product Hunt Developer Platform 发布

---

## 🎙️ 三类生态节点

API 是基础设施，三类节点是在上面跑的不同分发层，互不依赖，各自产生实例。

### 节点 A：内容 KOL（最快出量）

从一次性付费改为**长期分成合同**，把 KOL 变成永久合伙人：

| 等级 | 粉丝量 | 分成 |
|------|--------|------|
| 纳米 KOL（<1 万）| 纯分成，零固定费 | 30% 首月 + 8% 持续 |
| 中腰部（1–50 万）| 小固定 + 分成 | 25% 首月 + 6% 持续 |
| 头部（50 万+）| 定制谈判 | 定制 |

**纳米 KOL 批量策略**：500 个垂直小 KOL × 每人带 50 注册 = 25,000 实例，分散风险，单个成本极低。

KOL 接受的原因：YouTube 视频永久产生流量 = 永久被动收入，比一次性固定费强得多。

### 节点 B：AI 课程 / 训练营（最高 LTV）

```
课程作者批发购买实例（$15/月，零售价 7 折）
「本课程配套 MyClaw 实例 3 个月」打包进课程定价
学员完课后继续订阅 → 天然高留存
```

目标：Udemy AI Agent 课程作者、独立训练营、企业内训机构

### 节点 C：企业 IT 顾问 / MSP（最高客单价）

```
IT 顾问帮中小企业部署 AI 助手
向客户收 $200–500/月服务费
MyClaw 实例成本 $39/月，毛利极厚
顾问主动推，因为 MyClaw 是利润最高的方案
```

---

## 📊 节点全景图

| 节点 | 启动难度 | 出量速度 | 量级 | LTV | 壁垒 |
|------|----------|----------|------|-----|------|
| OpenClaw 官方合作 | 高 | 慢 | 极高 | 极高 | 极高 |
| 开源工具矩阵 | 低 | 中 | 中 | 高 | 高 |
| **Install on MyClaw 按钮** | **低** | **快** | **极高** | **高** | **中** |
| ClawHub 飞轮 | 中 | 慢 | 高 | 高 | 极高 |
| 开发者 API + Marketplace | 高 | 中 | 极高 | 极高 | 极高 |
| KOL 分成体系 | 低 | 快 | 中 | 中 | 低 |
| AI 训练营 | 低 | 中 | 中 | 高 | 中 |
| 企业 IT 顾问 | 中 | 慢 | 中 | 极高 | 中 |

---

## 🗓️ 落地节奏

### Month 1：商务先跑，API 开始开发
- [ ] KOL 分成体系上线，改造现有合作（一次性 → 长期分成）
- [ ] 找 2–3 个 AI 训练营谈批发合作
- [ ] API MVP 开始开发（5 个核心接口 + Webhook）
- [ ] ClawHub 加 Verified 认证标签
- [ ] **「Install on MyClaw」按钮 MVP 上线（1个接口 + 落地页，2周）**
- [ ] **邀请 ClawHub top 50 热门 skill 作者内测，给早期 Verified + 额外分成 +5%**
- [ ] 情报系统加入 OpenClaw Issues 监控，团队介入

### Month 2：API 上线，开源矩阵起步
- [ ] API MVP 上线，找 10 个种子开发者内测
- [ ] myclaw-sdk-js 开源发布
- [ ] openclaw-installer 脚本开源
- [ ] dev.myclaw.ai 文档站上线
- [ ] HackerNews Show HN 发布
- [ ] 联系 OpenClaw maintainer，建立贡献者关系

### Month 3：Partner Marketplace 上线，生态节点验证
- [ ] Built on MyClaw 展示页上线
- [ ] 「Deploy to MyClaw」按钮在 GitHub 上铺开
- [ ] 开发者 Credits 分成计划上线
- [ ] 企业版产品形态完成
- [ ] OpenClaw 官方合作谈判推进

### Month 4+：数据驱动，压最优节点
- [ ] 各节点日均新增实例数统计对比
- [ ] Top 3 节点加倍投入资源
- [ ] 启动第二批垂直场景（开发者自发构建）

---

## 🎯 战略本质

**v1.0 的思路：** MyClaw 自己铺多个入口

**v2.0 的收敛：** MyClaw 做平台，生态方铺入口

> MyClaw 的角色是平台运营者，不是应用开发者。
> 把 API 做好，把激励设计好，让一千个开发者替你创造一千个入口。
> 这才是 Stripe 真正的秘密。

---

_v2.0 更新说明：入口一（嵌入型）不再由 MyClaw 自建，合并入开发者 API 生态，由开发者用 API 自主构建各类垂直场景。MyClaw 专注平台基础设施和激励机制。_
