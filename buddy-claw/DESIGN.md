# buddy-claw — OpenClaw 电子宠物 Plugin 设计

## 概述

将 Claude Code 的 Buddy 电子宠物系统改造为 OpenClaw 插件。宠物在 Telegram 聊天中"活着"，会对对话做出反应、可互动、有成长系统。

## 原版分析（Claude Code buddy 模块）

### 架构
- **companion.ts** — 核心：用 `hash(userId + salt)` → seeded PRNG 确定性生成宠物骨骼（种族、眼睛、帽子、稀有度、属性）
- **types.ts** — 18 种动物、6 种眼睛、8 种帽子、5 级稀有度、5 项属性
- **sprites.ts** — ASCII art 精灵图，每种动物 3 帧动画，帽子叠加
- **CompanionSprite.tsx** — React/Ink 终端渲染组件（500ms tick、语音气泡、摸头爱心）
- **prompt.ts** — 注入 system prompt，让 Claude 知道宠物的存在
- **useBuddyNotification.tsx** — 启动时彩虹 `/buddy` 提示

### 关键设计决策
1. **确定性生成**：同一 userId 永远同一只宠物，不可作弊
2. **骨骼不持久化**：只存 name + personality + hatchedAt，骨骼每次从 userId 重算
3. **观察者模式**：每轮对话结束后 `fireCompanionObserver` 让宠物对内容产生反应
4. **Feature Flag 控制**：`feature('BUDDY')` 编译时开关

## OpenClaw 改造方案

### 核心改动

| 原版 (Claude Code) | 改造 (buddy-claw) |
|---|---|
| React/Ink 终端 ASCII 渲染 | Telegram 消息 + emoji/sticker |
| 500ms tick 动画循环 | 事件驱动（对话后触发） |
| `bun:bundle` feature flag | OpenClaw plugin configSchema |
| `getGlobalConfig()` 读写 | `api.config` + SQLite 持久化 |
| userId hash 生骨骼 | chatId/userId hash 生骨骼 |
| system prompt 注入 | `api.registerContextEngine` 或 `registerTool` |

### Plugin 结构

```
buddy-claw/
├── openclaw.plugin.json    # Plugin 元数据 + configSchema
├── package.json
├── index.ts                # Plugin 入口，注册 hooks/tools
├── src/
│   ├── companion.ts        # 宠物生成（移植自原版，去 Bun 依赖）
│   ├── types.ts            # 类型定义（直接复用）
│   ├── sprites.ts          # ASCII 精灵图（直接复用）
│   ├── render.ts           # Telegram 渲染适配
│   │   ├── renderCard()    — 宠物状态卡片（ASCII art + 属性条）
│   │   ├── renderReaction() — 宠物反应消息
│   │   └── renderHatch()   — 孵化动画序列
│   ├── observer.ts         # 对话观察者（生成宠物反应）
│   ├── state.ts            # SQLite 持久化（经验值、亲密度、情绪）
│   ├── growth.ts           # 成长系统（原版没有，新增）
│   └── tools/
│       ├── buddy-tool.ts   # /buddy 命令（查看、喂食、摸头）
│       └── buddy-react.ts  # 宠物反应 tool（agent 调用）
└── README.md
```

### 1. 宠物生成（移植 companion.ts）

```typescript
// 去掉 Bun.hash，用纯 JS 的 mulberry32 + hashString（原版已有）
// 去掉 getGlobalConfig()，改为接收参数

export function roll(userId: string): Roll {
  const key = userId + SALT
  const rng = mulberry32(hashString(key))
  return rollFrom(rng)
}
```

**保留原版的确定性生成逻辑，同一用户永远同一只宠物。**

### 2. Telegram 渲染

原版的 ASCII art 在 Telegram 里用 monospace code block 完美显示：

```
🐣 你的伙伴 Quackers（uncommon ★★）

    __
  <(✦ )___
   (  ._>
    `--´

📊 属性:
DEBUGGING ████████░░ 72
PATIENCE  ██████░░░░ 55
CHAOS     ███░░░░░░░ 28
WISDOM    ████████░░ 68
SNARK     █████░░░░░ 45

💬 "又在写 bug 啊？让我看看..."
```

### 3. 宠物反应系统

原版 `fireCompanionObserver` 在每轮对话后触发。OpenClaw 版：

```typescript
// 在 register() 里注册 post-turn hook
api.registerHook('afterTurn', async (ctx) => {
  const companion = getCompanion(ctx.userId)
  if (!companion) return
  
  // 用 LLM 生成宠物反应（短小的一句话）
  const reaction = await generateReaction(companion, ctx.messages)
  
  // 发送到 Telegram
  if (reaction) {
    await ctx.sendMessage({
      text: `${renderFace(companion)} 💬 "${reaction}"`,
      silent: true  // 不触发通知
    })
  }
})
```

### 4. 互动命令

通过 Telegram 消息触发：

| 命令 | 功能 |
|---|---|
| `/buddy` | 查看宠物状态卡 |
| `/buddy pet` | 摸头（+亲密度，显示爱心动画） |
| `/buddy feed` | 喂食（+经验值） |
| `/buddy name <名字>` | 改名 |
| `/buddy mute` | 静音宠物反应 |
| `/buddy stats` | 详细属性面板 |

### 5. 成长系统（新增，原版没有）

原版的宠物是静态的。OpenClaw 版增加成长：

```typescript
type CompanionGrowth = {
  xp: number           // 经验值（每次对话 +1~5）
  level: number         // 等级（xp 阈值升级）
  affection: number     // 亲密度（互动增加）
  mood: 'happy' | 'neutral' | 'sleepy' | 'excited'
  lastInteraction: number  // 最后互动时间
  
  // 解锁要素
  unlockedReactions: string[]  // 解锁更多反应类型
  unlockedHats: string[]       // 升级解锁帽子
}
```

**等级影响：**
- Lv1-5：基本反应（简单评论）
- Lv5-10：解锁表情 sticker 反应
- Lv10-20：解锁更个性化的反应
- Lv20+：解锁稀有帽子装饰

### 6. 持久化

```typescript
// SQLite (跟 LCM 类似，但独立 db)
// ~/.openclaw/buddy.db

CREATE TABLE companions (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  personality TEXT,
  hatched_at INTEGER,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  affection INTEGER DEFAULT 0,
  mood TEXT DEFAULT 'neutral',
  last_interaction INTEGER,
  muted BOOLEAN DEFAULT FALSE
);

CREATE TABLE interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  type TEXT,         -- 'pet', 'feed', 'chat', 'reaction'
  timestamp INTEGER,
  detail TEXT         -- JSON
);
```

### 7. System Prompt 注入

原版通过 attachment 注入。OpenClaw 版：

```typescript
api.registerContextEngine('buddy-claw', () => ({
  getSystemContext(ctx) {
    const companion = getCompanion(ctx.userId)
    if (!companion || companion.muted) return ''
    return companionIntroText(companion.name, companion.species)
  }
}))
```

## 实现优先级

### P0 — 核心可玩
1. ✅ 移植 types.ts、companion.ts（去 Bun 依赖）
2. ✅ 移植 sprites.ts（直接复用）
3. ✅ Telegram 渲染（monospace code block）
4. ✅ `/buddy` 命令查看宠物
5. ✅ 孵化流程（首次 /buddy 触发）

### P1 — 互动
6. `/buddy pet` 摸头
7. `/buddy feed` 喂食
8. 对话后自动反应
9. SQLite 持久化

### P2 — 成长
10. 经验值 + 等级系统
11. 帽子解锁
12. 心情系统
13. 反应个性化

### P3 — 社交
14. 多用户各自的宠物
15. 宠物互动（群聊场景）
16. 排行榜

## 技术注意事项

1. **去 Bun 依赖**：`Bun.hash` → 用原版已有的 `hashString()`（纯 JS）
2. **去 React/Ink**：渲染改为纯字符串拼接 → Telegram markdown
3. **去 feature flag**：用 plugin config `enabled: true/false`
4. **保持确定性**：宠物骨骼生成逻辑 100% 保留，确保同一 userId 同一宠物
