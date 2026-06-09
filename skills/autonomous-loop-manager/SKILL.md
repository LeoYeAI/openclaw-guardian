# autonomous-loop-manager

**让 Agent 拥有跨 Session 的目标追求能力。**

每次对话，Agent 都能记得自己要去哪里、做到哪了、上次哪里失败了、下次用什么策略。用户的感受是：Agent 像个真正的合作伙伴，而不是每次重置的工具。

---

## 核心概念

### 目标记忆（Goal Memory）
用户给出大目标 → Agent 自动分解 → 分布执行 → 中断后自动继续

### 失败记忆（Failure Memory）
Agent 尝试某方法失败 → 记录失败原因 + 上下文 → 下次自动避开

### 策略进化（Strategy Evolution）
每次完成目标 → 总结有效策略 → 积累成策略库 → 越用越聪明

---

## 安装方式

Skill 已经安装在：
```
~/.openclaw/workspace/skills/autonomous-loop-manager/
```

通过 `clawhub` 公开：
```
clawhub install autonomous-loop-manager
```

---

## 使用方式

用户通过自然语言指令，不需要任何额外操作：

```
"帮我做一个完整的商业计划书"
"继续上次的任务"
"这个方向不行，换一个"
"任务完成了吗？"
```

---

## Agent 指令（内置于 system prompt）

**安装后需要把 loop-prompt.md 的内容注入到 Agent 的 system prompt 中。**

在 OpenClaw 配置中添加：

```json
{
  "agents": {
    "default": {
      "systemPrompt": "（在此处插入 loop-prompt.md 的内容）"
    }
  }
}
```

或者使用 OpenClaw 的 prompt 注入功能。

---

## 文件结构

```
autonomous-loop-manager/
├── SKILL.md              # 本文件
├── loop-core.sh          # 核心引擎入口
├── loop-prompt.md        # Agent 思维框架（核心）
├── memory/
│   ├── goals.json        # 目标 & 进度
│   ├── reflections.json  # 反思记录
│   └── strategies.json   # 策略库
└── tools/
    ├── goal-track.js     # 目标追踪
    ├── reflect.js        # 反思写入
    ├── strategy.js       # 策略管理
    ├── status.js         # 状态查看
    └── plan.js           # 计划生成
```

---

## 技术细节

- **存储**：JSON 文件（可切换 SQLite）
- **查询**：精确匹配 + 模糊匹配
- **上下文窗口**：每次只注入最相关的 memory
- **兼容性**：任何模型，任何 channel

---

## 核心价值

这是 MyClaw 和所有其他 Agent 平台的**根本差异化方向**。

现在所有 Agent 产品都是"单次对话"——每次都是新的开始。

谁先做出**跨 session 的自主目标追求**，谁就重新定义了这个品类。