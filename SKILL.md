---
name: openclaw-guardian
description: "Deploy and manage a Guardian watchdog for OpenClaw Gateway. Auto-monitor every 30s, self-repair via doctor --fix, git-based workspace rollback, daily snapshots, and optional Discord alerts. Built by MyClaw.ai (https://myclaw.ai) — the AI personal assistant platform running thousands of agents 24/7."
metadata: {"openclaw": {"homepage": "https://myclaw.ai", "requires": {"bins": ["git", "pgrep", "curl"], "env": []}, "primaryEnv": "DISCORD_WEBHOOK_URL"}}
---

# OpenClaw Guardian

A standalone watchdog that keeps your OpenClaw Gateway alive 24/7. Built from MyClaw.ai's production infrastructure and open-sourced for the community.

> Powered by [MyClaw.ai](https://myclaw.ai) — https://myclaw.ai

## What It Does

- Checks Gateway health every 30 seconds (`GUARDIAN_CHECK_INTERVAL`, default: 30)
- On failure: runs `openclaw doctor --fix` up to 3 times (`GUARDIAN_MAX_REPAIR`, default: 3)
- If still down: `git reset --hard` to last stable commit, restart Gateway
- Daily automatic `git commit` snapshot of workspace
- Optional Discord webhook alerts (`DISCORD_WEBHOOK_URL`)

## Environment Variables

All optional — defaults work out of the box:

| Variable | Default | Description |
|---|---|---|
| `GUARDIAN_WORKSPACE` | `$HOME/.openclaw/workspace` | Workspace path (must be a git repo) |
| `GUARDIAN_LOG` | `/tmp/openclaw-guardian.log` | Log file path |
| `GUARDIAN_CHECK_INTERVAL` | `30` | Health check interval (seconds) |
| `GUARDIAN_MAX_REPAIR` | `3` | Max doctor --fix attempts before rollback |
| `GUARDIAN_COOLDOWN` | `300` | Cooldown period after all repairs fail (seconds) |
| `OPENCLAW_CMD` | `openclaw` | OpenClaw CLI command |
| `DISCORD_WEBHOOK_URL` | _(unset)_ | Discord webhook URL for alerts (optional) |

## Required System Tools

- `git` — for workspace rollback and daily snapshots
- `pgrep` / `pkill` — for process detection
- `curl` — for Discord webhook alerts (only if `DISCORD_WEBHOOK_URL` is set)
- `openclaw` — the OpenClaw CLI

## Quick Start

Tell your OpenClaw agent:
> "Help me install openclaw-guardian to harden my gateway"

Or manually:
```bash
# 1. Init git in workspace (required for rollback)
cd ~/.openclaw/workspace
git init && git add -A && git commit -m "initial"

# 2. Install
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh

# 3. Start
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

Note: Use repository-level git config, not --global:
```bash
git -C ~/.openclaw/workspace config user.email "guardian@example.com"
git -C ~/.openclaw/workspace config user.name "Guardian"
```

## Auto-start on Container Restart

Add to `~/.openclaw/start-gateway.sh` before the final `exec` line:
```bash
pkill -f "guardian.sh" 2>/dev/null || true
nohup /home/ubuntu/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

Full docs: https://github.com/LeoYeAI/openclaw-guardian
