#!/usr/bin/env bash
# publish.sh — 从 Obsidian vault 同步博客文章到 content/posts/，构建静态站点，可选 git 推送。
#
# 用法：
#   ./publish.sh            # 同步 + npm run build
#   ./publish.sh --push     # 同步 + build + git commit + git push
#   ./publish.sh --no-build # 仅同步（调试用）
#   ./publish.sh -h         # 帮助

set -euo pipefail

# ---- 可配置 ----
VAULT_BLOG="/Users/zcy/dev/github/obsidian_vault/qifeiblog"
VAULT_DRAFTS="/Users/zcy/dev/github/obsidian_vault/004-发布/qifeiblog"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${SCRIPT_DIR}/content/posts"
INCOMPLETE="${SCRIPT_DIR}/content/.incomplete"

# ---- rsync 排除规则 ----
RSYNC_EXCLUDES=(
  --exclude=".obsidian/"
  --exclude=".trash/"
  --exclude=".*.swp"
  --exclude="*草稿*"
  --exclude="*未完成*"
  --exclude="发布流程.md"
)

# ---- 解析参数 ----
DO_BUILD=1
DO_PUSH=0
for arg in "$@"; do
  case "$arg" in
    --push)       DO_PUSH=1 ;;
    --no-build)   DO_BUILD=0 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# ---- 步骤 1：准备目标 ----
mkdir -p "$DEST" "$INCOMPLETE"

# ---- 步骤 2：从 vault 同步 ----
sync_one() {
  local src="$1"
  if [[ ! -d "$src" ]]; then
    echo "[skip] $src 不存在"
    return 0
  fi
  echo "[sync] $src -> $DEST"
  rsync -av --delete "${RSYNC_EXCLUDES[@]}" "$src/" "$DEST/"
}

sync_one "$VAULT_BLOG"
sync_one "$VAULT_DRAFTS"

# ---- 步骤 3：把 frontmatter 不全的草稿移到 .incomplete/ ----
shopt -s nullglob
moved=0
for f in "$DEST"/*.md; do
  if grep -q "这里写摘要" "$f" || grep -qE 'date:.*\{\{' "$f"; then
    echo "[incomplete] $(basename "$f") -> .incomplete/"
    mv "$f" "$INCOMPLETE/"
    moved=$((moved + 1))
  fi
done
shopt -u nullglob

post_count=$(ls -1 "$DEST"/*.md 2>/dev/null | wc -l | tr -d ' ')
incomplete_count=$(ls -1 "$INCOMPLETE"/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "[sync] 完成。已发布：$post_count 篇，未完成：$incomplete_count 篇（移出 $moved 篇）"

# ---- 步骤 4：构建 ----
if [[ "$DO_BUILD" -eq 1 ]]; then
  echo "[build] npm run build"
  (cd "$SCRIPT_DIR" && npm run build)
  echo "[build] 产物在 out/ 目录"
fi

# ---- 步骤 5：可选 git 推送 ----
if [[ "$DO_PUSH" -eq 1 ]]; then
  echo "[git] 添加并提交"
  (
    cd "$SCRIPT_DIR"
    git add content/posts/ out/ .gitignore 2>/dev/null || git add content/posts/
    if git status --short | grep -q .; then
      git commit -m "sync: $(date +%Y-%m-%d) 同步博客 ($post_count 篇)"
    else
      echo "[git] 没有变更"
    fi
  )
  echo "[git] push"
  (cd "$SCRIPT_DIR" && git push origin main)
fi

echo "[done] publish.sh 完成"
