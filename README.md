# 🛡️ OpenClaw Guardian

<div align="center">

<a href="https://myclaw.ai">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" />
</a>

**Languages:**
[English](README.md) · [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

</div>

---

## 🤖 Powered by [MyClaw.ai](https://myclaw.ai)

**[MyClaw.ai](https://myclaw.ai)** is an AI personal assistant platform that gives every user a fully-featured AI agent running on a dedicated server — with complete code control, internet access, and tool integrations. Think of it as your own private AI that can actually *do* things, not just answer questions.

OpenClaw Guardian is an open-source project born from MyClaw.ai's production infrastructure. We run thousands of AI agent instances 24/7, and Guardian is the hardening layer that keeps them alive. We're open-sourcing it so everyone can benefit.

> 🌐 **Try MyClaw.ai**: [https://myclaw.ai](https://myclaw.ai)

---

## Features

- **Auto-monitor** — checks Gateway health every 30 seconds
- **Auto-repair** — runs `openclaw doctor --fix` on failure (up to 3 attempts)
- **Auto-rollback** — resets workspace to last stable git commit if repair fails
- **Daily snapshots** — automatic daily `git commit` of your workspace
- **Discord alerts** — optional webhook notifications on failures and recovery

## How It Works

```
Gateway down detected
        │
        ▼
  doctor --fix  ──→ success? ──→ ✅ Done
  (up to 3x)
        │ all failed
        ▼
  git rollback  ──→ success? ──→ ✅ Done
        │ failed
        ▼
  cooldown 300s → resume monitoring
```

## ⚡ One-Line Deploy (OpenClaw Users)

Already using OpenClaw? Just tell your AI agent:

> **"Help me install openclaw-guardian to harden my gateway"**

Your agent will handle everything automatically — git init, script install, and auto-start. No terminal needed.

---

## Quick Start

```bash
# 1. Initialize git in workspace
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Install
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Start
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `GUARDIAN_WORKSPACE` | `$HOME/.openclaw/workspace` | Workspace git repo path |
| `GUARDIAN_CHECK_INTERVAL` | `30` | Health check interval (seconds) |
| `GUARDIAN_MAX_REPAIR` | `3` | Max repair attempts before rollback |
| `GUARDIAN_COOLDOWN` | `300` | Cooldown after all repairs fail (seconds) |
| `DISCORD_WEBHOOK_URL` | _(unset)_ | Discord webhook for alerts (optional) |

## Works Alongside gw-watchdog

| | gw-watchdog | Guardian |
|---|---|---|
| Check interval | 15s | 30s |
| Action | Fast restart | doctor --fix → rollback |
| Git rollback | ❌ | ✅ |
| Discord alerts | ❌ | ✅ |
| Daily backup | ❌ | ✅ |

## Install as OpenClaw Skill

```bash
clawhub install openclaw-guardian
```

## License

MIT © [MyClaw.ai](https://myclaw.ai)
