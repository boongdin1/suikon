#!/usr/bin/env bash
# 캐시 버스팅 + git 커밋 + 푸시
# 사용: ./deploy.sh "커밋 메시지"

set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-deploy: 자산 캐시 버스팅 + 페이지 갱신}"
VERSION="$(date +%Y%m%d%H%M)"

# 모든 페이지의 ?v=숫자 패턴을 새 버전으로 일괄 갱신
find . -name "index.html" -not -path "./node_modules/*" -not -path "./.git/*" -print0 \
  | xargs -0 sed -i.bak -E "s/\\?v=[0-9]+/?v=${VERSION}/g"
find . -name "*.bak" -delete

echo "?v=${VERSION} 으로 갱신 완료"
echo ""

git add -A
if git diff --cached --quiet; then
  echo "변경 없음. 종료."
  exit 0
fi
git commit -m "$MSG"
git push origin main

echo ""
echo "배포 완료."
