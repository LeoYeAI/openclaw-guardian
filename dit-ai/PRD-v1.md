# Dit.ai 产品规格文档 v1.0

_作者：The Doctor | 日期：2026-03-01_

---

## 一、产品定位

**Dit.ai 是全球AI算力流通协议。**

全球每年有数十亿美元的AI订阅额度被白白浪费——Anthropic Max、Kiro、Antigravity、OpenAI Pro的用户，大量额度每月清零。Dit让这些算力流动起来，成为可交易的商品。

Dit不是撮合平台，不是API代理。Dit是**AI算力的全球做市商**——供应商报底价，买家付顶价，平台掌握定价权，吃中间spread。

---

## 二、核心角色

### 供应商（Provider）
- 拥有AI订阅额度的用户（Anthropic Max、OpenAI Pro、Kiro、Antigravity等）
- 在自己的服务器上部署Dit Adapter
- 向Dit网络报价（每M token底价）
- 按实际成交量后结算收入

### 买家（Buyer）
- 需要AI算力的开发者、企业、MyClaw用户
- 向Dit账户预充值
- 通过统一API接口调用（兼容OpenAI格式）
- 按调用量扣费

### Dit平台
- 维护Gateway路由层
- 掌握黑箱定价权（供应商不知道买家价格，买家不知道供应商底价）
- 管理预付款 + 后结算的资金流
- 不持有任何API key，不直接发起任何API请求

---

## 三、系统架构

```
买家
  │
  ▼
Dit Gateway（统一API入口）
  │  ├── 鉴权（买家API key）
  │  ├── 计费（扣买家余额）
  │  ├── 路由决策（选择最优供应商）
  │  └── 请求转发
  │
  ▼
供应商的Dit Adapter（部署在供应商自己服务器上）
  │  ├── 接收Dit Gateway的路由请求
  │  ├── 用自己的API key和IP发起请求
  │  └── 返回结果给Gateway
  │
  ▼
官方API（Anthropic / OpenAI / Kiro / Antigravity...）
```

**关键原则：**
- Dit平台永远不持有供应商的API key
- 所有对官方的请求，从供应商自己的IP发出
- Dit只是路由层，法律风险隔离清晰

---

## 四、定价机制

### 黑箱做市商模型

```
供应商报价（底价）  →  Dit平台掌握
买家定价（顶价）    →  Dit平台掌握
成交价              →  由Dit平台决定
Spread（差价）      →  Dit平台利润
```

**示例（Claude Opus 4.6）：**
| 角色 | 价格（per M input tokens） |
|------|--------------------------|
| 官方售价 | $15 |
| 供应商报价 | $9 |
| Dit对买家定价 | $12 |
| Dit毛利 | $3（25%毛利率） |

### 定价策略
- 对买家：始终低于官方价格10-20%（竞争力）
- 对供应商：高于其边际成本（吸引力）
- 中间spread随规模扩大而增大（规模效应）

---

## 五、资金流

```
买家预充值 → Dit账户（预付款，立即到账）
     ↓
Dit Gateway计费（按调用实时扣减）
     ↓
供应商月结（后结算，T+7或T+30）
```

**财务优势：**
- 买家预付 → Dit永远是净现金正向
- 供应商后结算 → 浮存金在Dit手中
- 零库存风险（算力即时消耗，不可囤积）

---

## 六、API设计

### 买家侧（兼容OpenAI格式）

```bash
# 买家只需修改base_url，其余代码零改动
curl https://api.dit.ai/v1/chat/completions \
  -H "Authorization: Bearer {DIT_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4.6",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

支持的模型标识符：
- `claude-opus-4.6`
- `claude-sonnet-4.6`
- `gpt-4o`
- `grok-3`
- `deepseek-r2`
- _（随供应商接入动态扩展）_

### 供应商侧（Dit Adapter）

开源轻量代理服务，供应商在自己服务器上部署：

```yaml
# dit-adapter.yml 配置示例
provider:
  id: "your-provider-id"
  secret: "your-dit-secret"

models:
  - id: "claude-opus-4.6"
    api_key: "${ANTHROPIC_API_KEY}"   # 存在供应商本地，不上传Dit
    base_url: "https://api.anthropic.com"
    price_per_m_input: 9.0            # 供应商报价（底价）
    price_per_m_output: 27.0

server:
  port: 8080
  dit_gateway: "https://gateway.dit.ai"
```

---

## 七、路由决策逻辑

Gateway在收到买家请求后，按以下优先级选择供应商：

```
1. 价格最优（在报价范围内选最低底价）
2. 延迟最低（ping值优先）
3. 稳定性（历史成功率 > 99.5%）
4. 负载均衡（单供应商不超过总流量30%）
```

故障转移：供应商响应超时（>5s）自动切换备用供应商，买家无感知。

---

## 八、冷启动策略

### 第一批供应商：MyClaw用户

MyClaw 3000+付费用户是Dit天然的第一批供应商：
- 已有OpenClaw实例（服务器就绪）
- 有Anthropic/OpenAI订阅（额度就绪）
- 通过Dit变现 → 抵扣MyClaw订阅费（强激励）

**MyClaw Dashboard新增入口：**
> "🔌 将你的闲置算力接入Dit网络，开始赚钱"
> 一键部署Dit Adapter → 设置报价 → 完成

### 第一批买家：MyClaw平台本身

MyClaw的API消耗全部路由到Dit：
- Dit立即有真实订单流
- 对供应商有筹码："我们每月有X万次调用量"
- 验证系统稳定性

### 对外开放时间线

```
Week 1-6：MVP开发（Gateway + Adapter + 基础计费）
Week 7-8：MyClaw内测（内部流量切到Dit）
Week 9-12：供应商招募（定向BD + 开源社区）
Week 13+：公测开放
```

---

## 九、MVP功能范围

### 必须有（Phase 1）
- [ ] Dit Gateway：统一API入口，OpenAI格式兼容
- [ ] Dit Adapter：开源，支持Anthropic/OpenAI
- [ ] 基础计费：买家余额充值 + 实时扣减
- [ ] 供应商后结算：月结账单生成
- [ ] 供应商Dashboard：报价设置、收入查看
- [ ] 买家Dashboard：余额充值、用量查看、API key管理

### 暂不做（Phase 2+）
- 供应商评级系统
- 实时竞价机制
- 多货币结算
- 企业合同/发票
- 公开市场（供需可见）

---

## 十、核心护城河

| 护城河 | 说明 |
|--------|------|
| **定价黑箱** | 供需双方均不知对方价格，信息优势永久在平台 |
| **资金结构** | 预付+后结算，浮存金随规模线性增长 |
| **MyClaw冷启动** | 3000+用户既是供给侧又是需求侧，双边同时激活 |
| **协议层去中心化** | 无中央API key，无单点风险，平台难以被封杀 |
| **数据飞轮** | 做市商天然积累最完整供需数据，定价越来越精准 |

---

## 十一、盈利预测

| 阶段 | 月GMV | 毛利率 | 月毛利 |
|------|-------|--------|--------|
| MVP上线 | $10K | 20% | $2K |
| MyClaw切入 | $50K | 22% | $11K |
| 公测3个月 | $200K | 25% | $50K |
| 规模化 | $1M+ | 28%+ | $280K+ |

**盈亏平衡点：月GMV $30K**（假设运营成本$6K/月）

---

_文档版本：v1.0 | 下次更新：产品评审后_
