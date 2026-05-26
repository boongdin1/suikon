#!/usr/bin/env bash
# 전체 사이트 빌드 + 캐시 버스팅 + 커밋 + 푸시
# 사용: ./deploy.sh "커밋 메시지"

set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-deploy: 자산 캐시 버스팅 + 서브페이지 재빌드}"

# 1) 서브페이지 빌드 (이 안에서 ?v=YYYYMMDDHHMM 생성)
./build-sub.sh

# 2) 메인 index.html 의 ?v= 도 같은 버전으로 정렬
VERSION="$(date +%Y%m%d%H%M)"
sed -i.bak -E "s/\\?v=[0-9]+/?v=${VERSION}/g" index.html
rm -f index.html.bak

echo ""
echo "메인 + 서브 모두 ?v=${VERSION} 으로 갱신"
echo ""

# 3) git
git add -A
if git diff --cached --quiet; then
  echo "변경 없음. 종료."
  exit 0
fi
git commit -m "$MSG"
git push origin main

echo ""
echo "배포 완료."
