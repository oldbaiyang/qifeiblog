#!/usr/bin/env bash
# scripts/deploy.sh — sync content, build, and deploy to Cloudflare Pages.
#
# Reads CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from .env.local
# (git-ignored). Other env vars in .env.local are NOT exported, so wrangler
# only sees what it needs.
#
# Usage:
#   ./scripts/deploy.sh             # sync vault + build + deploy
#   ./scripts/deploy.sh --no-build  # deploy existing out/ without rebuilding
#   ./scripts/deploy.sh --push      # also git push origin main after deploy
#   ./scripts/deploy.sh -h          # help

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"
PROJECT="qifeiblog"

# ---- arg parsing ----
DO_BUILD=1
DO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --push)     DO_PUSH=1 ;;
    -h|--help)
      sed -n '2,14p' "$0"
      exit 0 ;;
    *) echo "[error] unknown arg: $arg" >&2; exit 2 ;;
  esac
done

cd "$ROOT_DIR"

# ---- load CF secrets from .env.local ----
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[error] $ENV_FILE not found — copy .env.example to .env.local and fill in CLOUDFLARE_* values" >&2
  exit 1
fi

# Only export CLOUDFLARE_* keys; ignore comments, blank lines, and other vars.
# `set -a` auto-exports any assignment made while it's active.
set -a
# shellcheck disable=SC1090
source <(grep -E '^[[:space:]]*CLOUDFLARE_' "$ENV_FILE" | sed 's/^[[:space:]]*//')
set +a

: "${CLOUDFLARE_API_TOKEN:?[error] CLOUDFLARE_API_TOKEN missing in .env.local}"
: "${CLOUDFLARE_ACCOUNT_ID:?[error] CLOUDFLARE_ACCOUNT_ID missing in .env.local}"

# ---- step 1: sync + build ----
if [[ "$DO_BUILD" -eq 1 ]]; then
  echo "[1/3] ./publish.sh (sync vault + build)"
  ./publish.sh
else
  echo "[1/3] skip build (--no-build); deploying existing out/"
  [[ -d out ]] || { echo "[error] out/ missing; run without --no-build first" >&2; exit 1; }
fi

# ---- step 2: deploy ----
echo "[2/3] wrangler pages deploy out --project-name=$PROJECT --branch=main"
npx wrangler pages deploy out --project-name="$PROJECT" --branch=main --commit-dirty=true

# ---- step 3: optional git push ----
if [[ "$DO_PUSH" -eq 1 ]]; then
  echo "[3/3] git push origin main"
  git push origin main
fi

echo
echo "[done] deployed. production: https://$PROJECT.pages.dev  custom: https://blog.aqifei.top"