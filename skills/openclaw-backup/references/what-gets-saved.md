# OpenClaw Backup — What Gets Saved

## Backed Up ✅

| Component | Path | Why |
|---|---|---|
| **Workspace** | `~/.openclaw/workspace/` | Agent memory, MEMORY.md, skills, USER.md, SOUL.md, all custom files |
| **Gateway config** | `~/.openclaw/openclaw.json` | Models, channels, plugins, gateway settings |
| **System skills** | `~/.openclaw/skills/` | Installed skills (find-skills, etc.) |
| **Cron jobs** | `~/.openclaw/cron/` | Scheduled tasks |
| **Identity** | `~/.openclaw/identity/device.json` | Device identity (non-sensitive) |
| **Scripts** | `guardian.sh`, `gw-watchdog.sh`, `start-gateway.sh` | Auto-restart and guardian logic |

## NOT Backed Up ❌ (by design)

| Component | Reason |
|---|---|
| Credentials & auth tokens | Security — re-pair channels after restore |
| `openclaw.log` | Runtime log, not needed for restore |
| Media files (images/audio) | Too large, easily regenerated |
| `node_modules/` | Reinstall with npm |
| `.git/` | Source control managed separately |
| Binary assets (png/jpg/mp4) | Size; regenerate as needed |

## Post-Restore Checklist

1. **Re-pair messaging channels** (Telegram, WhatsApp, Signal) — tokens not transferred
2. **Verify API keys** in `openclaw.json` — check `models` section has valid keys
3. **Run gateway status**: `openclaw gateway status`
4. **Test channel connection**: send a test message
5. **Review MEMORY.md** to confirm agent identity is intact

## Restore to a New Instance

```bash
# On the NEW machine (after installing OpenClaw):
curl -o restore.sh https://raw.githubusercontent.com/.../restore.sh  # or copy the script
chmod +x restore.sh
./restore.sh /path/to/openclaw-backup_TIMESTAMP.tar.gz --dry-run   # preview first
./restore.sh /path/to/openclaw-backup_TIMESTAMP.tar.gz             # apply
```

Then re-pair your messaging channels as usual.
