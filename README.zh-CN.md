# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**语言：**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 由 [MyClaw.ai](https://myclaw.ai) 驱动

**[MyClaw.ai](https://myclaw.ai)** 是一个 AI 个人助手平台，为每位用户提供运行在独立服务器上的全功能 AI Agent——具备完整的代码控制权、互联网访问能力和工具集成。它是真正能"做事"的私人 AI，而不只是回答问题。

OpenClaw Guardian 是 MyClaw.ai 生产基础设施孕育的开源项目。我们 7×24 小时运行数千个 AI Agent 实例，Guardian 是保障其稳定运行的加固层。我们将其开源，让所有人受益。

> 🌐 **体验 MyClaw.ai**：[https://myclaw.ai](https://myclaw.ai)

---

## 功能特性

- **自动监控** — 每 30 秒检测 Gateway 状态
- **自动修复** — 异常时执行 `openclaw doctor --fix`（最多 3 次）
- **自动回滚** — 修复失败后自动回滚到上一个稳定的 git commit
- **每日快照** — 每天自动对 workspace 创建 git 备份
- **Discord 告警** — 可选的故障与恢复 Webhook 通知

## 工作流程

```
检测到 Gateway 停止运行
        │
        ▼
  doctor --fix  ──→ 成功? ──→ ✅ 完成
  (最多 3 次)
        │ 全部失败
        ▼
  git 回滚  ──→ 成功? ──→ ✅ 完成
        │ 失败
        ▼
  冷却 300s → 继续监控
```

## ⚡ 一句话部署（OpenClaw 用户）

已经在使用 OpenClaw？直接告诉你的 AI 助手：

> **「帮我安装 openclaw-guardian，加固我的 gateway」**

Agent 会自动完成所有步骤——git 初始化、脚本安装、自动启动。无需打开终端。

---

## 快速开始

```bash
# 1. 初始化 workspace git 仓库
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. 安装
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. 启动
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## 配置项

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `GUARDIAN_WORKSPACE` | `$HOME/.openclaw/workspace` | workspace git 仓库路径 |
| `GUARDIAN_CHECK_INTERVAL` | `30` | 检测间隔（秒） |
| `GUARDIAN_MAX_REPAIR` | `3` | 最大修复次数 |
| `GUARDIAN_COOLDOWN` | `300` | 全部失败后冷却时长（秒） |
| `DISCORD_WEBHOOK_URL` | _(未设置)_ | Discord 告警 Webhook（可选） |

## 与 gw-watchdog 并存

| | gw-watchdog | Guardian |
|---|---|---|
| 检测间隔 | 15s | 30s |
| 动作 | 快速重启 | doctor --fix → 回滚 |
| git 回滚 | ❌ | ✅ |
| Discord 告警 | ❌ | ✅ |
| 每日备份 | ❌ | ✅ |

## 作为 OpenClaw Skill 安装

```bash
clawhub install openclaw-guardian
```

## 许可证

MIT © [MyClaw.ai](https://myclaw.ai)
