---
name: myclaw-backup
description: "Backup and restore all OpenClaw configuration, agent memory, skills, and workspace data. Use when the user wants to create a snapshot of their OpenClaw instance, schedule periodic backups, restore from a backup, migrate to a new server, download a backup file locally, upload a backup file from another machine, or protect against data loss. Includes a built-in HTTP server for browser-based download/upload/restore without needing cloud storage."
---

# OpenClaw Backup Skill

Backs up all critical OpenClaw data to a single `.tar.gz` archive and restores it to any OpenClaw instance. Includes a built-in HTTP server for browser-based backup management — download backups to your laptop, upload from another machine, restore with one click.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/backup.sh [output-dir]` | Create a backup archive (default: `/tmp/openclaw-backups/`) |
| `scripts/restore.sh <archive.tar.gz> [--dry-run]` | Restore from archive; always use `--dry-run` first |
| `scripts/serve.sh start [--port 7373] [--token TOKEN]` | Start HTTP server for browser-based management |
| `scripts/serve.sh stop\|status\|url` | Stop/check server |
| `scripts/schedule.sh [--interval daily\|weekly\|hourly]` | Set up system cron for automatic backups |

## What Gets Backed Up

See `references/what-gets-saved.md` for full breakdown.

**Includes:** workspace, openclaw.json (bot tokens + API keys), credentials, channel pairing state, agent config + session history, devices, identity, cron jobs, guardian scripts.

**Excludes:** logs, binary media, node_modules.

**Security:** archive is `chmod 600`. Contains credentials — keep secure.

## Common Workflows

### One-time backup

```bash
bash scripts/backup.sh /tmp/openclaw-backups
```

### Restore (always dry-run first)

```bash
bash scripts/restore.sh /tmp/openclaw-backups/openclaw-backup_TIMESTAMP.tar.gz --dry-run
bash scripts/restore.sh /tmp/openclaw-backups/openclaw-backup_TIMESTAMP.tar.gz
```

### Start HTTP server (download/upload via browser)

```bash
bash scripts/serve.sh start --port 7373 --token mysecrettoken
# → Opens: http://localhost:7373/?token=mysecrettoken
# → Web UI: create backup, download .tar.gz, upload, restore
```

**HTTP API endpoints:**
- `GET  /`                    — Web UI (browser)
- `GET  /backups`             — List backups (JSON)
- `POST /backup`              — Trigger new backup
- `GET  /download/:filename`  — Download a backup file
- `POST /upload`              — Upload a backup (multipart, field: `backup`)
- `POST /restore/:filename`   — Restore; add `?dry_run=1` for preview
- `GET  /health`              — Health check (no auth)

All endpoints require `?token=xxx` or `Authorization: Bearer xxx` (except `/health`).

### Migrate to a new instance

**On old machine:**
```bash
bash scripts/serve.sh start --port 7373 --token mytoken
# note the URL
```

**On new machine (after installing OpenClaw):**
```bash
# Download the backup
curl -O "http://OLD_IP:7373/download/openclaw-backup_TIMESTAMP.tar.gz?token=mytoken"

# Or upload via browser at http://NEW_IP:7373

# Restore
bash scripts/restore.sh openclaw-backup_TIMESTAMP.tar.gz --dry-run
bash scripts/restore.sh openclaw-backup_TIMESTAMP.tar.gz
# All channels reconnect automatically — no re-pairing needed
```

### Schedule daily auto-backup via OpenClaw cron

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

## Future: MyClaw Cloud Backup

The HTTP API is designed to be compatible with a future MyClaw cloud backup service. When available, replace the local server URL with the MyClaw API endpoint — the upload/download/restore flow stays identical.
