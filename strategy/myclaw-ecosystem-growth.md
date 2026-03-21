# MyClaw 生态增长战略 v1.0

_目标：建立多样化的生态节点，每天稳定产生新增实例_
_Last updated: 2026-03-21 | Author: The Doctor 🌀_

---

## 🧭 核心逻辑

```
开源生态（最上层漏斗）
        ↓
三大商业化入口（转化层）
        ↓
每日新增实例（目标）
```

不依赖单一渠道。每个节点独立产生实例，节点越多，日增越稳定，抗风险能力越强。

---

## 🌐 第零层：开源生态（流量总闸）

### O1｜成为 OpenClaw 官方推荐托管方
- 以技术贡献者身份进入社区（提 PR、修 bug、做文档）
- 目标：OpenClaw README 出现「推荐托管：MyClaw」官方链接
- 终极目标：OpenClaw 安装流程内嵌「一键迁移到 MyClaw」选项
- **价值：OpenClaw 27.5 万 stars，每天数万 UV，精准高意向**

### O2｜开源工具矩阵
每个工具 README 带「Powered by MyClaw」+ 注册链接：

| 工具 | 定位 |
|------|------|
| myclaw-cli | 命令行管理实例，开发者每天用 |
| myclaw-sdk-js / python | API 集成必用 |
| myclaw-templates | 常用 Agent 模板，fork 即用 |
| openclaw-installer | 一键装 OpenClaw，结尾推 MyClaw 托管 |
| myclaw-bench（已有）| 测评显示最佳模型跑在 MyClaw 上 |

### O3｜ClawHub 做成「AI Skills 的 npm」
- **Verified 认证**：MyClaw 官方审核标签，解决恶意 skill 信任问题
- **「Deploy to MyClaw」按钮**：任何 GitHub skill 仓库一键部署
- **开发者 Credits 分成**：热门 skill top 10% 开发者拿 MyClaw token 奖励
- **飞轮**：skill 越多 → OpenClaw 越好用 → 更多人需要 MyClaw 托管

### O4｜开源社区作为 B2B 销售渠道
- 监控 OpenClaw Issues 里的「部署太复杂」类帖子
- 团队介入回复，顺带提 MyClaw 托管方案（真实帮助，不是广告）
- 开发者 → 推给公司用 → 企业版漏斗

---

## 🔌 入口一：嵌入型（Embedded MyClaw）

**定位：让 MyClaw 变成别人产品的 AI 基础设施层**

### 产品形态：Embed SDK

```js
import { MyClaw } from '@myclaw/embed'
MyClaw.init({ apiKey: 'xxx', plan: 'starter' })
MyClaw.createInstance({ userId: user.id })
```

### 三个优先场景

| 场景 | 目标平台 | 用户价值 |
|------|----------|----------|
| 建站工具插件 | Webflow / Framer / WordPress | 网站自动获得 AI 客服/助手 |
| Shopify App | 200 万+ 商家 | 智能店铺运营助手 |
| Notion/Obsidian 插件 | 知识工作者 | 笔记库变成会思考的 Agent |

### 商业结构
```
合作方向用户收 $X
MyClaw 批发价 = 零售价 7 折
差价归合作方 → 合作方有动力主动推
```

---

## 🛠️ 入口二：开发者 API（MyClaw Developer Platform）

**定位：AI Agent 基础设施的 Stripe**

### MVP 五个核心接口

```
POST   /v1/instances              创建实例
GET    /v1/instances/:id          查询状态
DELETE /v1/instances/:id          销毁实例
POST   /v1/instances/:id/message  向实例发消息
POST   /v1/instances/:id/topup    充值 token
```

加 Webhook：实例状态变更 / token 余额不足回调。

### 开发者分成体系

| 月带量 | 订阅分成（首月）| Token 分成（持续）|
|--------|----------------|------------------|
| 1-9 个 | 15% | 无 |
| 10-99 个 | 20% | 5% |
| 100-499 个 | 30% | 8% |
| 500+ | 定制 | 定制 |

Token 持续分成是核心钩子——开发者的用户越活跃，开发者赚得越多，主动优化用户深度使用。

### 触达路径
1. OpenClaw GitHub README 加「Build on MyClaw」
2. dev.myclaw.ai 开发者文档独立站
3. HackerNews Show HN 发布
4. Product Hunt Developer Platform 发布

---

## 🎙️ 入口三：渠道合作（Partner Program）

**定位：让有流量的人跟 MyClaw 的 LTV 绑定**

### 渠道 A：YouTube / 内容 KOL

专属邀请码 + 长期分成：

| 等级 | 粉丝量 | 合作方式 | 分成 |
|------|--------|----------|------|
| 纳米 KOL | <1 万 | 纯分成零固定费 | 30% 首月 + 8% 持续 |
| 中腰部 | 1-50 万 | 小固定 + 分成 | 25% 首月 + 6% 持续 |
| 头部 | 50 万+ | 定制谈判 | 定制 |

纳米 KOL 策略：找 500 个垂直小 KOL，每人带 50 注册 = 25,000 实例。

### 渠道 B：AI 课程 / 训练营
```
课程作者批发购买实例（$15/月）
「本课程配套 MyClaw 实例 3 个月」打包进课程
学员完课继续用 → 高留存
```
目标：Udemy AI Agent 课程作者、独立训练营、企业内训机构

### 渠道 C：企业 IT 顾问 / MSP
```
IT 顾问帮客户部署 AI 助手
向客户收 $200-500/月服务费
MyClaw 实例成本 $39/月，毛利极厚
顾问主动推，因为利润最高
```

---

## 📊 各节点对比

| 节点 | 启动难度 | 出量速度 | 量级 | LTV | 壁垒 |
|------|----------|----------|------|-----|------|
| OpenClaw 官方合作 | 高 | 慢 | 极高 | 极高 | 极高 |
| 开源工具矩阵 | 低 | 中 | 中 | 高 | 高 |
| ClawHub 飞轮 | 中 | 慢 | 高 | 高 | 极高 |
| 嵌入型 SDK | 中 | 慢 | 高 | 高 | 高 |
| 开发者 API | 高 | 中 | 极高 | 极高 | 极高 |
| KOL 分成体系 | 低 | 快 | 中 | 中 | 低 |
| AI 训练营 | 低 | 中 | 中 | 高 | 中 |
| 企业 IT 顾问 | 中 | 慢 | 中 | 极高 | 中 |

---

## 🗓️ 落地节奏

### Month 1：商务先跑，技术并行启动
- [ ] KOL 分成体系上线，改造现有合作关系
- [ ] 找 2-3 个 AI 训练营谈批发合作
- [ ] API 平台 MVP 开始开发（5 个核心接口）
- [ ] ClawHub 加 Verified 认证标签
- [ ] 情报系统加入 OpenClaw Issues 监控

### Month 2：API 平台上线，开源矩阵起步
- [ ] API MVP 上线，OpenClaw 社区找 10 个种子开发者内测
- [ ] myclaw-sdk-js 开源发布
- [ ] openclaw-installer 脚本开源
- [ ] HackerNews Show HN 发布
- [ ] 联系 OpenClaw maintainer，建立贡献者关系

### Month 3：嵌入型首个场景，生态节点验证
- [ ] Shopify App 或 Webflow 插件上线（选一个先打透）
- [ ] Embed SDK 发布
- [ ] 「Deploy to MyClaw」按钮在 GitHub 上铺开
- [ ] 开发者 Credits 分成计划上线
- [ ] 企业版产品形态设计完成

### Month 4+：数据驱动，集中资源压最优节点
- [ ] 各节点日均新增实例数统计对比
- [ ] Top 3 节点加倍投入
- [ ] OpenClaw 官方合作谈判推进

---

## 🎯 核心判断

短期靠 SEM 买流量，中期靠渠道分成，长期靠生态壁垒。

当生态节点足够多、足够多样时：
- 某个渠道波动 → 其他渠道补位
- 竞品高价抢 SEM → 生态流量不受影响
- 用户在生态里深度集成 → 迁移成本极高

> Google SEM 买来的是用户。生态建立的是护城河。用户可以被抢走，生态位不能。
