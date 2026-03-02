---
name: openclaw-guardian
description: Deploy and manage a Guardian watchdog process for OpenClaw Gateway. Provides automated health monitoring, self-repair via `doctor --fix`, git-based workspace rollback, daily snapshots, and optional Discord alerting. Use when a user wants to harden their OpenClaw instance against crashes, config corruption, or bad workspace edits — or when setting up Guardian for the first time on a new server/container.
files:
  - scripts/guardian.sh
  - references/setup.md
env_optional:
  - DISCORD_WEBHOOK_URL        # Discord webhook for alerts — no workspace data transmitted; only status messages
  - GUARDIAN_WORKSPACE         # Workspace git repo path (default: $HOME/.openclaw/workspace)
  - GUARDIAN_CHECK_INTERVAL    # Health check interval in seconds (default: 30)
  - GUARDIAN_MAX_REPAIR        # Max doctor --fix attempts before rollback (default: 3)
  - GUARDIAN_COOLDOWN          # Cooldown in seconds after all repairs fail (default: 300)
---

# OpenClaw Guardian

Guardian is a standalone bash watchdog that keeps OpenClaw Gateway alive 24/7.

> **Bundled files:** `scripts/guardian.sh` (main watchdog script), `references/setup.md` (full config reference and systemd patterns).

**Repair ladder:**
1. Detect Gateway down (every 30s)
2. Run `openclaw doctor --fix` (up to 3 attempts)
3. If still down → `git reset --hard` to last stable commit, restart Gateway
4. If all fails → cooldown 300s, resume monitoring
5. Daily automatic git snapshot of workspace

## ⚠️ Before You Start

**`git reset --hard` warning:** The rollback step (Step 3 above) discards all uncommitted changes in your workspace. It only triggers after `doctor --fix` has already failed 3 times — it is the last resort, not the first response. To protect yourself:
- Commit important workspace changes before deploying Guardian
- Or set `GUARDIAN_MAX_REPAIR` to a higher number to delay rollback

**Discord webhook:** If you set `DISCORD_WEBHOOK_URL`, Guardian will POST plain status messages (e.g. "Gateway restarted") to that URL. No workspace files or credentials are transmitted. This variable is entirely optional — leave it unset to disable all outbound network calls.

**File paths touched:** Guardian reads/writes to `~/.openclaw/workspace` (git ops), `~/.openclaw/guardian.sh` (the script itself), and optionally `~/.openclaw/start-gateway.sh` (auto-start integration in Step 4). Review each step before running.

## Setup Steps

### 1. Initialize git (required for rollback)

```bash
cd ~/.openclaw/workspace
git config --global user.email "guardian@example.com"
git config --global user.name "Guardian"
git init && git add -A && git commit -m "initial"
```

Skip if repo already exists. Without git, `doctor --fix` still works; rollback is skipped.

### 2. Install guardian.sh

Copy `scripts/guardian.sh` from this skill to `~/.openclaw/guardian.sh`:

```bash
cp scripts/guardian.sh ~/.openclaw/guardian.sh
chmod +x ~/.openclaw/guardian.sh
```

> The script is bundled in this skill package. You can inspect it before running: `cat scripts/guardian.sh`

### 3. Start Guardian

**Container / no systemd (nohup):**
```bash
nohup ~/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

**Linux VPS with systemd:** See `references/setup.md` → Pattern B.

### 4. Auto-start on container restart (optional)

Add to `~/.openclaw/start-gateway.sh` (before the final `exec` line):
```bash
pkill -f "guardian.sh" 2>/dev/null || true
nohup /home/ubuntu/.openclaw/guardian.sh >> /tmp/openclaw-guardian.log 2>&1 &
```

> Review your `start-gateway.sh` before editing. This step is optional — Guardian works fine without it if you prefer to start it manually.

### 5. Optional: Discord alerts

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

Or add to `start-gateway.sh` as a persistent export.

> Only plain status messages are sent. No workspace data, files, or credentials are transmitted.

## Verify

```bash
pgrep -a -f "guardian.sh"          # confirm process running
tail -f /tmp/openclaw-guardian.log  # watch live logs
```

## Configuration

All settings via environment variables. Defaults work out of the box.
See `references/setup.md` for full variable reference, systemd config, and architecture diagram.

## Notes

- Guardian coexists with `gw-watchdog.sh` — run both for layered resilience
- Rollback targets the 2nd-newest non-auto commit (skips daily-backup, rollback, auto-backup commits)
- Log path: `/tmp/openclaw-guardian.log`
