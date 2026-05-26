#!/usr/bin/env bash
# 서브페이지 빌드 — _partials/* + _content/<page>.html → <path>/index.html
# 사용: ./build-sub.sh

set -euo pipefail
cd "$(dirname "$0")"

VERSION="$(date +%Y%m%d%H%M)"

HEAD_RAW="$(cat _partials/head.html)"
HEAD="${HEAD_RAW//\{\{VERSION\}\}/$VERSION}"
HEADER="$(cat _partials/header.html)"
FOOTER="$(cat _partials/footer.html)"

# 페이지 매핑 (path | title | description | content basename)
build_page() {
  local path="$1"
  local title="$2"
  local desc="$3"
  local content="$4"

  local content_file="_content/${content}.html"
  if [ ! -f "$content_file" ]; then
    echo "  [skip] $content_file 없음 — $path"
    return
  fi
  local body
  body="$(cat "$content_file")"

  mkdir -p "$path"
  local out="$path/index.html"

  cat > "$out" <<HTML
<!DOCTYPE html>
<html lang="ko">
<head>
${HEAD}
    <meta name="description" content="${desc}">
    <title>${title}</title>
</head>
<body class="sub-page">
    <div id="wrap">
${HEADER}

        <main id="main">
${body}
        </main>

${FOOTER}
    </div>
    <script src="/assets/js/sub.js?v=${VERSION}"></script>
</body>
</html>
HTML

  echo "  [ok] $out"
}

build_page "company/greeting"     "인사말 | 수익온"            "수익온 인사말 — 자동매매의 새로운 기준을 만드는 (주)써밋랩스 대표 김지혜의 인사말입니다."   "greeting"
build_page "company/vision"       "비전 | 수익온"              "수익온의 비전과 핵심가치 — 성장의 지속성, 사용자 중심, 신뢰와 공유."                          "vision"
build_page "company/location"     "오시는길 | 수익온"          "수익온 본사 위치 — 경기도 남양주시 덕송1로55번길 8 엠브릭 203호."                              "location"
build_page "company/certificates" "인증내역 | 수익온"          "수익온은 검증된 알고리즘과 엄격한 기준으로 신뢰받는 자동매매 파트너입니다."                  "certificates"
build_page "service/stock"        "주식 프로그램 | 수익온"     "수익온 주식 자동매매 — 7단계 정형화된 프로세스로 안정적인 운용을 제공합니다."                 "stock"
build_page "service/coin"         "코인 프로그램 | 수익온"     "수익온 코인 자동매매 — 온체인 데이터 기반의 양방향 리스크 관리."                              "coin"
build_page "support/inquiry"      "안내 및 문의 | 수익온"      "수익온 고객지원 — 전화·이메일·카카오톡 안내."                                                  "inquiry"
build_page "support/notice"       "공지사항 | 수익온"          "수익온의 새로운 소식과 안내를 확인하세요."                                                      "notice"
build_page "support/notice/view"  "공지사항 상세 | 수익온"     "수익온 공지사항 상세 내용."                                                                    "notice-view"
build_page "community/news"       "수익온 뉴스 | 수익온"       "수익온 보도자료 및 미디어 노출 모음."                                                          "news"
build_page "community/news/view"  "뉴스 상세 | 수익온"         "수익온 보도자료 상세 내용."                                                                    "news-view"
build_page "remote"               "원격지원 | 수익온"          "전문 기술 지원팀의 원격 데스크 서비스를 이용하세요."                                            "remote"
build_page "partnership"          "제휴문의 | 수익온"          "수익온은 새로운 가치를 함께 만들 제휴 파트너를 기다리고 있습니다."                            "partnership"
build_page "trial"                "무료체험 신청 | 수익온"     "수익온 무료체험 신청 — 검증된 자동매매 시스템을 직접 경험해 보세요."                          "trial"
build_page "tos"                  "이용약관 | 수익온"          "수익온 서비스 이용약관 — (주)써밋랩스가 제공하는 자동매매 서비스 이용에 관한 권리·의무를 규정합니다." "tos"
build_page "privacy"              "개인정보처리방침 | 수익온"  "수익온 개인정보처리방침 — (주)써밋랩스는 「개인정보 보호법」을 준수하며 이용자의 개인정보를 보호합니다." "privacy"

echo ""
echo "버전: ?v=${VERSION}"
