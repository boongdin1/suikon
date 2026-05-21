#!/usr/bin/env bash
# 자산 버전 쿼리스트링(?v=...)을 현재 시각으로 일괄 갱신
# 사용: ./bump-version.sh  (그 뒤 git commit && push)

set -euo pipefail
cd "$(dirname "$0")"

VERSION="$(date +%Y%m%d%H%M)"

# index.html 내 ?v=숫자 패턴을 새 버전으로 치환
sed -i.bak -E "s/\\?v=[0-9]+/?v=${VERSION}/g" index.html
rm -f index.html.bak

echo "버전 갱신: ?v=${VERSION}"
