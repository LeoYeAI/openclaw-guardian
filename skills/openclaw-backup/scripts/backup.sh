#!/usr/bin/env bash
# openclaw-backup: Create a full backup of OpenClaw data
# Usage: backup.sh [output-dir]
#   output-dir: where to save the .tar.gz (default: /tmp/openclaw-backups)

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_DIR="${1:-/tmp/openclaw-backups}"
BACKUP_NAME="openclaw-backup_${TIMESTAMP}"
WORK_DIR="/tmp/${BACKUP_NAME}"
OPENCLAW_HOME="${HOME}/.openclaw"

# ── Colors ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

echo ""
echo "🦞 OpenClaw Backup — ${TIMESTAMP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p "$OUTPUT_DIR" "$WORK_DIR"

# ── 1. Workspace (memory, skills, agent files) ────────────────────────────
info "Backing up workspace..."
WORKSPACE_DIR="${OPENCLAW_HOME}/workspace"
if [ -d "$WORKSPACE_DIR" ]; then
  mkdir -p "${WORK_DIR}/workspace"
  # Exclude large binary files and node_modules
  rsync -a \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.tar.gz' \
    --exclude='*.skill' \
    --exclude='*.zip' \
    --exclude='*.png' \
    --exclude='*.jpg' \
    --exclude='*.jpeg' \
    --exclude='*.gif' \
    --exclude='*.webp' \
    --exclude='*.mp4' \
    --exclude='*.mp3' \
    "$WORKSPACE_DIR/" "${WORK_DIR}/workspace/"
  info "  workspace → $(du -sh ${WORK_DIR}/workspace | cut -f1)"
else
  warn "  workspace directory not found, skipping"
fi

# ── 2. Gateway config (openclaw.json) ────────────────────────────────────
info "Backing up Gateway config..."
CONFIG_FILE="${OPENCLAW_HOME}/openclaw.json"
if [ -f "$CONFIG_FILE" ]; then
  mkdir -p "${WORK_DIR}/config"
  cp "$CONFIG_FILE" "${WORK_DIR}/config/openclaw.json"
  # Also backup the bak if it exists
  [ -f "${CONFIG_FILE}.bak" ] && cp "${CONFIG_FILE}.bak" "${WORK_DIR}/config/openclaw.json.bak"
  info "  openclaw.json → $(wc -c < ${WORK_DIR}/config/openclaw.json) bytes"
else
  warn "  openclaw.json not found, skipping"
fi

# ── 3. System-level skills (~/.openclaw/skills/) ─────────────────────────
info "Backing up system skills..."
SYSTEM_SKILLS_DIR="${OPENCLAW_HOME}/skills"
if [ -d "$SYSTEM_SKILLS_DIR" ] && [ -n "$(ls -A ${SYSTEM_SKILLS_DIR} 2>/dev/null)" ]; then
  mkdir -p "${WORK_DIR}/skills/system"
  rsync -a "$SYSTEM_SKILLS_DIR/" "${WORK_DIR}/skills/system/"
  info "  system skills → $(ls ${WORK_DIR}/skills/system | wc -l | tr -d ' ') items"
else
  warn "  no system skills found"
fi

# ── 4. Identity & credentials (strip secrets, keep structure) ────────────
info "Backing up identity info..."
IDENTITY_DIR="${OPENCLAW_HOME}/identity"
if [ -d "$IDENTITY_DIR" ]; then
  mkdir -p "${WORK_DIR}/identity"
  # Copy device.json (non-sensitive); skip auth tokens
  [ -f "${IDENTITY_DIR}/device.json" ] && \
    cp "${IDENTITY_DIR}/device.json" "${WORK_DIR}/identity/device.json"
  info "  identity → device.json"
fi

# ── 5. Guardian & watchdog scripts ───────────────────────────────────────
info "Backing up guardian scripts..."
mkdir -p "${WORK_DIR}/scripts"
for f in guardian.sh gw-watchdog.sh start-gateway.sh; do
  [ -f "${OPENCLAW_HOME}/${f}" ] && cp "${OPENCLAW_HOME}/${f}" "${WORK_DIR}/scripts/${f}"
done
info "  scripts → $(ls ${WORK_DIR}/scripts | tr '\n' ' ')"

# ── 6. Cron jobs snapshot ────────────────────────────────────────────────
info "Backing up cron state..."
CRON_DIR="${OPENCLAW_HOME}/cron"
if [ -d "$CRON_DIR" ]; then
  mkdir -p "${WORK_DIR}/cron"
  rsync -a "$CRON_DIR/" "${WORK_DIR}/cron/"
  info "  cron → $(ls ${WORK_DIR}/cron | wc -l | tr -d ' ') files"
fi

# ── 7. Manifest ──────────────────────────────────────────────────────────
cat > "${WORK_DIR}/MANIFEST.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "timestamp": "${TIMESTAMP}",
  "hostname": "$(hostname)",
  "openclaw_home": "${OPENCLAW_HOME}",
  "openclaw_version": "$(openclaw --version 2>/dev/null | head -1 || echo 'unknown')",
  "created_by": "openclaw-backup skill v1.0",
  "contents": {
    "workspace": true,
    "gateway_config": true,
    "system_skills": true,
    "identity_device": true,
    "guardian_scripts": true,
    "cron_jobs": true
  },
  "notes": "Credentials and auth tokens are NOT included for security. Re-pair channels after restore."
}
EOF

# ── 8. Package ───────────────────────────────────────────────────────────
echo ""
info "Packaging backup..."
ARCHIVE="${OUTPUT_DIR}/${BACKUP_NAME}.tar.gz"
tar -czf "$ARCHIVE" -C "/tmp" "$BACKUP_NAME"
rm -rf "$WORK_DIR"

ARCHIVE_SIZE=$(du -sh "$ARCHIVE" | cut -f1)
info "Backup saved: ${ARCHIVE}"
info "Size: ${ARCHIVE_SIZE}"

# ── 9. Prune old backups (keep last 7) ───────────────────────────────────
BACKUP_COUNT=$(ls "${OUTPUT_DIR}"/openclaw-backup_*.tar.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 7 ]; then
  info "Pruning old backups (keeping last 7)..."
  ls -t "${OUTPUT_DIR}"/openclaw-backup_*.tar.gz | tail -n +8 | xargs rm -f
  info "  Removed $((BACKUP_COUNT - 7)) old backup(s)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup complete: ${BACKUP_NAME}.tar.gz"
echo "   To restore: restore.sh ${ARCHIVE}"
echo ""
