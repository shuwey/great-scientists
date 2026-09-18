#!/usr/bin/env bash
# 把本站点同步到 Cloudflare Pages（项目 great-scientists / great-scientists-caq.pages.dev）
#
# 为什么要 staging 目录，而不是直接部署项目根：
#   `wrangler pages deploy` **没有 --exclude 参数**，过滤只能靠一个干净的暂存目录；
#   而项目根里混着 miniapp/（小程序工程）、tools/（构建脚本）、.git/、.workbuddy/、
#   .wbapp_*（发布缓存），都不该上传。
#
# 用法：bash tools/deploy_cloudflare.sh
set -euo pipefail

PROJECT=great-scientists
SRC="/Users/shuwei/WorkBuddy/读懂牛顿"
STAGE="/Users/shuwei/WorkBuddy/读懂牛顿-验证产物/_cf_staging"
SITE="https://great-scientists-caq.pages.dev"

# wrangler 通常不在 PATH，用 npx 缓存里那份（避免每次 npx 重新下载）
W=$(ls -d "$HOME"/.npm/_npx/*/node_modules/.bin/wrangler 2>/dev/null | head -1)
if [ -z "$W" ]; then
  echo "✗ 找不到 wrangler。先跑一次：npx wrangler --version" >&2
  exit 1
fi

cd "$SRC"
SHA=$(git rev-parse --short HEAD)
MSG=$(git log -1 --pretty=%s)

echo "▶ 同步到 Cloudflare Pages / $PROJECT"
echo "  来源 $SRC"
echo "  提交 $SHA  $MSG"

mkdir -p "$STAGE"
rsync -a --delete \
  --exclude 'miniapp/' --exclude 'tools/' --exclude '.git/' \
  --exclude '.workbuddy/' --exclude '.wbapp_*' --exclude '.gitignore' \
  --exclude '.DS_Store' \
  "$SRC/" "$STAGE"/

echo "  暂存 $(du -sh "$STAGE" | cut -f1) / $(find "$STAGE" -type f | wc -l | tr -d ' ') 个文件"

# 上传进度是动画字符，滤掉以免刷屏（grep 无匹配会返回 1，加 || true 防 set -e 中断）
CI=1 NO_COLOR=1 "$W" pages deploy "$STAGE" \
  --project-name "$PROJECT" --branch main \
  --commit-hash "$SHA" --commit-message "$MSG" 2>&1 |
  { grep -vE '^[│┌┐└┘├┤┬┴─]|^$' || true; } | tail -6

echo
echo "▶ 回测（数字应与本地逐项一致）"
echo "    E2E_BASE=$SITE node tools/check_china.js"
echo "    期望：348 节点 / 348 卡片 / 960 名词标记 / 最窄 232px / 0 报错"
echo "    另测真 404：curl -s -o /dev/null -w '%{http_code}\\n' --noproxy '*' $SITE/nope-xyz"
