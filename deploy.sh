#!/usr/bin/env bash
set -euo pipefail

# ─── Build locally, push to ECS, restart PM2 ───────────────────────────────
# Usage:  ./deploy.sh
# Prerequisites:
#   - .env.production has production NEXT_PUBLIC_* values
#   - SSH key-based auth to root@8.213.50.173 works
#   - rsync installed locally

REMOTE_HOST="8.213.50.173"
REMOTE_USER="root"
REMOTE_DIR="/var/www/lubbx"
SSH_KEY=""

# ─── 1. Build ───────────────────────────────────────────────────────────────
echo "==> 1/6  Building project (from .env.production)..."
pnpm build:prod 2>&1

# ─── 2. Ensure remote directory exists ──────────────────────────────────────
echo "==> 2/6  Creating remote directory structure..."
ssh ${SSH_KEY:+-i "$SSH_KEY"} "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}/apps/web/.next/{standalone,static}"

# ─── 3. Rsync standalone output ────────────────────────────────────────────
echo "==> 3/6  Syncing standalone output to ECS..."
rsync -avz --delete \
  apps/web/.next/standalone/ \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/apps/web/.next/standalone/"

# ─── 4. Rsync static files ─────────────────────────────────────────────────
echo "==> 4/6  Syncing static files to ECS..."
rsync -avz \
  apps/web/.next/static/ \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/apps/web/.next/static/"

# ─── 5. Rsync ecosystem config ─────────────────────────────────────────────
echo "==> 5/6  Syncing ecosystem.config.js..."
rsync -avz \
  ecosystem.config.js \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/ecosystem.config.js"

# ─── 6. Remote: symlink + restart ──────────────────────────────────────────
echo "==> 6/6  Recreating symlink and restarting PM2..."
ssh ${SSH_KEY:+-i "$SSH_KEY"} "${REMOTE_USER}@${REMOTE_HOST}" bash -s <<'REMOTESCRIPT'
  set -euo pipefail
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  mkdir -p /var/www/lubbx
  cd /var/www/lubbx

  # Recreate static symlink (rsync --delete removes it each time)
  ln -sf /var/www/lubbx/apps/web/.next/static \
         /var/www/lubbx/apps/web/.next/standalone/apps/web/.next/static

  # Restart app (delete + start picks up ecosystem changes)
  pm2 delete lubbx-web 2>/dev/null || true
  pm2 start ecosystem.config.js
  pm2 save

  echo "==> Done. App restarted successfully."
REMOTESCRIPT

echo "==> Deploy complete!"
