#!/usr/bin/env bash
# ============================================
# Playlist Generator Vue - Server Deployment
# ============================================
# Runs ON the server, from inside a git clone of this repository.
# It pulls the latest main, builds the production bundle and syncs the
# result into the web root.
#
# Usage:
#   ./deploy.sh                 # deploy to the default target below
#   ./deploy.sh /custom/path    # deploy to a custom target
#   DEPLOY_TARGET=/x ./deploy.sh
#
# Requirements on the server: git, node (>=20.19 or >=22.12), npm, rsync.
set -euo pipefail

# --- Configuration ----------------------------------------------------------
TARGET="${1:-${DEPLOY_TARGET:-/var/www/kodinitools.com/playlist_generator}}"
BRANCH="${DEPLOY_BRANCH:-main}"

# Always operate from the repository this script lives in.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Playlist Generator Deployment ==="
echo "Repo:   $SCRIPT_DIR"
echo "Branch: $BRANCH"
echo "Target: $TARGET"
echo ""

# --- Step 1: Get the latest code -------------------------------------------
echo "[1/4] Fetching latest '$BRANCH'..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

# --- Step 2: Install dependencies ------------------------------------------
echo "[2/4] Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# --- Step 3: Production build ----------------------------------------------
echo "[3/4] Building production bundle..."
npm run build

if [ ! -f dist/index.html ]; then
  echo "ERROR: build did not produce dist/index.html — aborting." >&2
  exit 1
fi

# --- Step 4: Publish to the web root ---------------------------------------
echo "[4/4] Syncing dist/ -> $TARGET ..."
mkdir -p "$TARGET"

# --delete removes stale files (old hashed assets) from the target so it
# mirrors the fresh build exactly. The target folder must be dedicated to
# this app (nothing else lives there).
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "$TARGET/"
else
  echo "rsync not found, falling back to rm + cp..."
  rm -rf "${TARGET:?}/"*
  cp -r dist/. "$TARGET/"
fi

echo ""
echo "=== Deployment finished! ==="
echo "Live at: https://kodinitools.com/playlist_generator/"
