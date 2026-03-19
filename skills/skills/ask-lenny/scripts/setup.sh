#!/usr/bin/env bash
# lenny-wisdom setup script
# Downloads Lenny's Podcast data and builds the search index.
#
# Usage:
#   bash setup.sh [--data-dir /path/to/data]
#
# After running, the skill is ready to use.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$SKILL_DIR/data"
SOURCE_DIR="$DATA_DIR/source"

# Parse args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --data-dir) DATA_DIR="$2"; SOURCE_DIR="$DATA_DIR/source"; shift ;;
        *) echo "Unknown arg: $1"; exit 1 ;;
    esac
    shift
done

echo "🎙️  lenny-wisdom setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check dependencies
if ! command -v python3 &>/dev/null; then
    echo "❌ python3 is required. Please install it first."
    exit 1
fi
if ! command -v git &>/dev/null; then
    echo "❌ git is required. Please install it first."
    exit 1
fi

# Step 1: Clone or update the data repo
echo ""
echo "[1/3] Fetching Lenny's data..."
mkdir -p "$DATA_DIR"

if [ -d "$SOURCE_DIR/.git" ]; then
    echo "     → Updating existing repo..."
    cd "$SOURCE_DIR" && git pull --quiet
else
    echo "     → Cloning from GitHub..."
    git clone --depth 1 --quiet \
        https://github.com/LennysNewsletter/lennys-newsletterpodcastdata.git \
        "$SOURCE_DIR"
fi

PODCAST_COUNT=$(ls "$SOURCE_DIR/podcasts/"*.md 2>/dev/null | wc -l | tr -d ' ')
NEWSLETTER_COUNT=$(ls "$SOURCE_DIR/newsletters/"*.md 2>/dev/null | wc -l | tr -d ' ')
echo "     → $PODCAST_COUNT podcasts, $NEWSLETTER_COUNT newsletters downloaded"

# Step 2: Build index
echo ""
echo "[2/3] Building search index (this takes ~10 seconds)..."
python3 "$SCRIPT_DIR/build_index.py" "$SOURCE_DIR" "$DATA_DIR"

# Step 3: Done
echo ""
echo "[3/3] ✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎙️  lenny-wisdom is ready!"
echo ""
echo "Try asking:"
echo '  @lenny 用户激活率低，怎么办？'
echo '  @lenny AI 产品定价有哪些真实案例？'
echo '  @lenny what did Bret Taylor say about agents?'
echo ""
echo "Data location: $DATA_DIR"
echo "To upgrade to full archive (289 episodes), replace $SOURCE_DIR"
echo "with data from https://lennysdata.com and re-run this script."
