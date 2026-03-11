#!/usr/bin/env bash
# OpenClaw Ultra Scraping — one-shot setup
# Installs Scrapling with all extras into /opt/scrapling-venv

set -e

VENV="/opt/scrapling-venv"
SCRAPLING_BIN="$VENV/bin/scrapling"

if [ -f "$SCRAPLING_BIN" ]; then
  echo "✅ Scrapling already installed at $VENV"
  "$VENV/bin/python3" -c "import scrapling; print(f'  Version: {scrapling.__version__}')" 2>/dev/null || true
  exit 0
fi

echo "🔧 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq python3.12-venv python3-full \
  libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libcairo2 libpango-1.0-0 libasound2t64 2>/dev/null

echo "🐍 Creating virtualenv at $VENV..."
python3 -m venv "$VENV"

echo "📦 Installing Scrapling (all extras)..."
"$VENV/bin/pip" install --quiet "scrapling[all]"

echo "🌐 Installing browsers..."
"$VENV/bin/scrapling" install

echo "✅ Setup complete!"
"$VENV/bin/python3" -c "import scrapling; print(f'  Scrapling {scrapling.__version__} ready')"
