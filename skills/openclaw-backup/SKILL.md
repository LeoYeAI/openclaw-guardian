---
name: openclaw-backup
description: "Backup and restore all OpenClaw configuration, agent memory, skills, and workspace data. Use when the user wants to create a snapshot of their OpenClaw instance, schedule periodic backups, restore from a backup, migrate to a new server, or protect against data loss. Handles backup creation, cron scheduling, and full restore with dry-run preview."
---

# OpenClaw Backup Skill

Backs up all critical OpenClaw data to a single `.tar.gz` archive and restores it to any OpenClaw instance.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/backup.sh [output-dir]` | Create a backup archive (default output: `/tmp/openclaw-backups/`) |
| `scripts/restore.sh <archive.tar.gz> [--dry-run]` | Restore from archive; always use `--dry-run` first |
| `scripts/schedule.sh [--interval daily\|weekly\|hourly] [--output-dir <dir>]` | Set up system cron for automatic backups |

## What Gets Backed Up

See `references/what-gets-saved.md` for the full breakdown.

**Key items:** workspace (MEMORY.md, skills, agent files), openclaw.json (incl. bot tokens & API keys), credentials/channel pairing state, system skills, cron jobs, guardian scripts, identity.

**NOT included:** logs, binary media files, node_modules.

**Security:** archive is `chmod 600` — contains bot tokens and API keys. Store securely.

## Common Workflows

### One-time backup

```bash
chmod +x scripts/backup.sh
bash scripts/backup.sh /tmp/openclaw-backups
```

### Restore (always dry-run first)

```bash
chmod +x scripts/restore.sh
bash scripts/restore.sh /tmp/openclaw-backups/openclaw-backup_20260302_083400.tar.gz --dry-run
bash scripts/restore.sh /tmp/openclaw-backups/openclaw-backup_20260302_083400.tar.gz
```

### Schedule daily auto-backup via OpenClaw cron

Use the `cron` tool to add a daily isolated job:

```json
{
  "name": "daily-openclaw-backup",
  "schedule": { "kind": "cron", "expr": "0 3 * * *", "tz": "UTC" },
  "payload": {
    "kind": "agentTurn",
    "message": "Run a backup using the openclaw-backup skill. Output dir: /tmp/openclaw-backups",
    "timeoutSeconds": 120
  },
  "sessionTarget": "isolated"
}
```

Or use the schedule script for system cron:

```bash
bash scripts/schedule.sh --interval daily --output-dir /tmp/openclaw-backups
```

### Migrate to new instance

1. Create backup on old instance: `bash scripts/backup.sh ~/backups`
2. Transfer archive to new server: `scp ~/backups/openclaw-backup_*.tar.gz user@newserver:`
3. On new server: `bash scripts/restore.sh openclaw-backup_*.tar.gz --dry-run` then apply
4. Re-pair Telegram/messaging channels (credentials not transferred)

## Notes

- Backup auto-prunes to keep last 7 archives
- Restore auto-saves a pre-restore snapshot before overwriting anything
- After restore: re-pair all messaging channels (tokens not included for security)
- For references on what is/isn't backed up: read `references/what-gets-saved.md`
