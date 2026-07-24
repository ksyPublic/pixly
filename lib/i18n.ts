"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

export type Locale = "ko" | "en";

// Visible UI strings. Per-conversion SEO meta (titles/descriptions in
// lib/conversions.ts) stays English on purpose — it targets English search.
const DICT = {
  ko: {
    "nav.convert": "변환",
    "nav.compress": "압축",
    "nav.crop": "자르기",
    "nav.video": "영상",
    "nav.about": "소개",
    "nav.pdf": "PDF 도구",
    "nav.tools": "도구",
    "nav.info": "정보",
    "nav.menu": "메뉴 열기",
    "nav.close": "메뉴 닫기",

    "home.eyebrow": "업로드 없이 · 내 기기 안에서 안전하게",
    "home.h1a": "사진 변환도 자르기도,",
    "home.h1b": "몇 초면 끝나요",
    "home.sub":
      "아이폰 사진(HEIC)이나 PNG·JPG처럼 형식이 서로 달라 번거로웠던 이미지를 클릭 몇 번으로 원하는 형식으로 바꿔요. 설치도 회원가입도 필요 없고, 파일은 내 기기 밖으로 나가지 않아요.",
    "home.ctaBrowse": "변환 도구 둘러보기",
    "home.ctaCrop": "사진 자르기",
    "home.heroReassure": "워터마크 없음 · 개수 제한 없음 · 100% 브라우저에서 처리",
    "home.formatsLabel": "이런 형식을 다뤄요",
    "home.why": "왜 Pixly일까요",
    "home.whySub": "누구나 부담 없이 쓸 수 있게 만들었어요.",
    "home.popular": "자주 쓰는 변환",
    "home.popularSub": "가장 많이 찾는 변환을 모았어요.",
    "home.all": "전체 변환 도구 {n}개",
    "home.toolsReassure": "파일은 내 기기 밖으로 나가지 않아요",
    "home.howto": "사용법은 아주 간단해요",
    "home.new": "새 기능",
    "home.cropTitle": "똑똑한 자동 자르기",
    "home.cropDesc":
      "상품 사진이나 인물 사진을 불러오면 중요한 부분을 알아서 찾아 원하는 비율로 잘라드려요. 직접 세밀하게 다듬고 바로 저장하세요.",
    "home.cropCta": "지금 써보기 →",

    "benefit.heic-to-jpg": "아이폰 사진을 어디서나 열리는 형식으로",
    "benefit.png-to-webp": "화질은 그대로, 용량은 가볍게",
    "benefit.heic-to-png": "아이폰 사진을 손실 없이 또렷하게",
    "benefit.webp-to-jpg": "어디서나 열리는 사진으로 되돌리기",
    "benefit.png-to-jpg": "용량 줄여서 공유하기 좋게",
    "benefit.avif-to-jpg": "최신 형식을 익숙한 사진으로",

    "trust.private": "안전해요",
    "trust.privateSub": "사진이 서버에 올라가지 않아요",
    "trust.nosignup": "가입이 필요 없어요",
    "trust.nosignupSub": "바로 사용할 수 있어요",
    "trust.unlimited": "제한이 없어요",
    "trust.unlimitedSub": "크기도 개수도 자유롭게",
    "trust.instant": "빠르게 끝나요",
    "trust.instantSub": "내 기기에서 바로 처리돼요",

    "step.1t": "사진 고르기",
    "step.1d": "바꾸고 싶은 사진을 끌어다 놓거나 클릭해서 선택하세요.",
    "step.2t": "자동으로 변환",
    "step.2d": "복잡한 설정 없이 내 기기 안에서 바로 처리돼요.",
    "step.3t": "저장하기",
    "step.3d": "바뀐 파일을 내려받으면 끝이에요. 아무것도 전송되지 않아요.",

    "conv.dropOpen": "{fmt} 파일을 놓거나 클릭해서 선택",
    "conv.dropSub": "브라우저에서 즉시 변환 · 업로드 없음",
    "conv.quality": "품질",
    "conv.modeQuality": "품질",
    "conv.modeSize": "용량 맞추기",
    "conv.sizeShort": "용량",
    "conv.targetSize": "목표 용량",
    "conv.converted": "{done}/{total} 변환됨",
    "conv.advanced": "고급 설정",
    "conv.advancedSub": "바꾸면 올린 파일 전체에 다시 적용돼요",
    "conv.resize": "크기 조절",
    "conv.resizeNone": "원본 크기 유지",
    "conv.resizeWidth": "너비 맞추기 (px)",
    "conv.resizeHeight": "높이 맞추기 (px)",
    "conv.resizeDims": "너비 × 높이 (px)",
    "conv.resizePercent": "퍼센트로 (%)",
    "conv.width": "너비",
    "conv.height": "높이",
    "conv.percent": "퍼센트",
    "conv.background": "배경색",
    "conv.backgroundHint": "투명한 부분을 채울 색이에요 (JPG는 투명을 담지 못해요).",
    "conv.autoOrient": "자동 회전 보정",
    "conv.autoOrientHint": "EXIF 방향값대로 사진을 바로 세워요.",
    "conv.stripMetadata": "메타데이터 제거",
    "conv.stripMetadataHint": "EXIF·GPS 위치·색상 프로필을 지워 용량을 줄이고 개인정보를 보호해요.",
    "conv.lossless": "무손실 압축",
    "conv.losslessHint": "화질 손실 없이 WebP로 저장해요. 그래픽·스크린샷에 좋고, 사진은 오히려 용량이 커질 수 있어요.",
    "conv.losslessBadge": "무손실",
    "conv.preset": "프리셋",
    "conv.presetNone": "불러오기…",
    "conv.presetSave": "저장",
    "conv.presetName": "프리셋 이름",
    "conv.presetCancel": "취소",
    "conv.reset": "초기화",
    "conv.clear": "모두 지우기",
    "conv.converting": "변환 중…",
    "conv.download": "다운로드",
    "conv.downloadAll": "전체 ZIP 다운로드 ({n})",
    "conv.zipping": "압축하는 중…",
    "conv.unsupported": "지원하지 않는 파일 형식입니다.",

    // Detail-page chrome shared by converter / compress / PDF landings.
    "badge.privateT": "100% 비공개",
    "badge.privateD": "파일이 기기 안에 머물러요",
    "badge.nosignupT": "가입 불필요",
    "badge.nosignupD": "계정도 이메일도 필요 없어요",
    "badge.unlimitedT": "제한 없음",
    "badge.unlimitedD": "개수·용량 제한이 없어요",
    "detail.safeHeading": "안전한가요?",
    "detail.relatedTools": "관련 도구",

    // Converter detail pages ({from}/{to} = FORMATS labels).
    "conv.h1": "{from} → {to} 변환기",
    "conv.intro":
      "{from} 파일을 {to} 형식으로 무료로 변환하세요. 모든 과정이 브라우저 안에서 처리되고, 이미지는 서버에 올라가지 않아요.",
    "conv.whyHeading": "{from} → {to} 변환, 왜 필요할까요?",
    "conv.safeBody":
      "네. 대부분의 온라인 변환기와 달리 Pixly는 파일을 업로드하지 않아요. 모든 처리가 브라우저에 내장된 이미지 엔진으로 기기 안에서 이뤄지기 때문에 사진이 서버에 닿을 일이 없어요. 덕분에 빠르고, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
    "conv.relatedConverters": "관련 변환기",

    // Compress landing.
    "compress.h1": "온라인 이미지 압축",
    "compress.intro":
      "브라우저 안에서 처리되는 무료 이미지 압축이에요. JPG, PNG, HEIC, WebP 사진을 원하는 목표 용량에 딱 맞게 줄여보세요. 파일은 서버에 올라가지 않아요.",
    "compress.whyHeading": "이미지를 왜 압축하나요?",

    "compress.dropOpen": "이미지를 놓거나 클릭해서 선택",
    "compress.dropSub": "브라우저에서 바로 용량을 줄여요 · 업로드 없음",
    "compress.format": "출력 형식",
    "compress.working": "압축하는 중…",
    "compress.compressed": "{done}/{total} 압축됨",
    "compress.overTarget": "목표 용량보다 큼 (최소 품질)",

    "video.h1": "영상을 웹용으로 변환",
    "video.intro":
      "MP4 같은 영상을 브라우저에서 바로 웹용 가벼운 WebM·MP4로 압축하거나, 짧은 클립은 GIF로 만들어요. 업로드도 회원가입도 없고, 파일은 기기 밖으로 나가지 않아요.",
    "video.whyHeading": "왜 웹용으로 변환하나요?",

    "vid.dropOpen": "영상을 놓거나 클릭해서 선택",
    "vid.dropSub": "브라우저에서 바로 변환해요 · 업로드 없음",
    "vid.format": "출력 형식",
    "vid.hintWebm": "웹 표준 · 용량이 가장 작아요",
    "vid.hintMp4": "어디서나 재생 · 호환성 최고",
    "vid.hintGif": "짧은 클립을 움직이는 이미지로",
    "vid.formatUnavailable": "이 브라우저에선 안 돼요",
    "vid.quality": "품질",
    "vid.quality.low": "가볍게",
    "vid.quality.medium": "보통",
    "vid.quality.high": "고화질",
    "vid.gifNote": "GIF는 짧은 클립에 좋아요. 최대 {sec}초 · 너비 {px}px까지 담고, 더 길거나 크면 자동으로 줄여요. 소리는 담기지 않아요.",
    "vid.advancedSub": "새로 변환하는 영상부터 적용돼요.",
    "vid.fps": "초당 프레임",
    "vid.fpsHint": "FPS (1–30). 높일수록 부드럽지만 용량이 커져요.",
    "vid.queued": "대기 중",
    "vid.reconvert": "다시 변환",
    "vid.remove": "제거",
    "vid.notVideo": "영상 파일이 아니에요.",
    "vid.probeError": "영상을 읽을 수 없어요. 다른 파일로 시도해 주세요.",
    "vid.unsupportedTarget": "이 브라우저에선 이 형식으로 변환할 수 없어요. 다른 형식을 골라 보세요.",
    "vid.convertError": "변환에 실패했어요. 다른 형식이나 설정으로 다시 시도해 보세요.",
    "vid.noSupportTitle": "이 브라우저는 영상 변환을 지원하지 않아요",
    "vid.noSupportBody": "최신 Chrome이나 Edge에서 열어 주세요.",

    "pdf.tools": "PDF 도구",
    "pdf.homeTitle": "PDF 도구",
    "pdf.homeSub":
      "이미지를 하나의 PDF로 묶거나, PDF를 이미지로 되돌려요 — 모두 브라우저 안에서 처리돼요.",
    "pdf.cardJpgToPdf": "JPG 사진을 하나의 PDF로 합치기",
    "pdf.cardPngToPdf": "PNG 이미지를 하나의 PDF로 합치기",
    "pdf.cardPdfToJpg": "PDF의 각 페이지를 JPG로 저장",
    "pdf.cardPdfToPng": "PDF의 각 페이지를 PNG로 저장",

    "pdf.dropImages": "{fmt} 이미지를 놓거나 클릭해서 선택",
    "pdf.dropImagesSub": "브라우저에서 하나의 PDF로 합쳐요 · 업로드 없음",
    "pdf.dropPdf": "PDF를 놓거나 클릭해서 선택",
    "pdf.dropPdfSub": "브라우저에서 이미지로 변환해요 · 업로드 없음",

    "pdf.pageSize": "페이지 크기",
    "pdf.sizeFit": "이미지에 맞춤",
    "pdf.sizeA4": "A4",
    "pdf.sizeLetter": "레터",
    "pdf.orientation": "방향",
    "pdf.orientAuto": "자동",
    "pdf.portrait": "세로",
    "pdf.landscape": "가로",
    "pdf.margin": "여백",
    "pdf.marginNone": "없음",
    "pdf.marginSmall": "좁게",
    "pdf.marginLarge": "넓게",

    "pdf.resolution": "해상도",
    "pdf.resStandard": "표준",
    "pdf.resHigh": "고화질",
    "pdf.resMax": "최대",

    "pdf.makePdf": "PDF 만들기",
    "pdf.making": "PDF 만드는 중…",
    "pdf.downloadPdf": "PDF 다운로드",
    "pdf.imageCount": "이미지 {n}개",
    "pdf.reorderHint": "PDF를 만들기 전에 화살표로 순서를 바꿀 수 있어요.",
    "pdf.moveUp": "위로 이동",
    "pdf.moveDown": "아래로 이동",
    "pdf.remove": "제거",

    "pdf.rendering": "변환하는 중…",
    "pdf.readingPdf": "PDF 읽는 중…",
    "pdf.renderedPages": "{done}/{total}쪽",
    "pdf.page": "{n}쪽",
    "pdf.errRender":
      "이 PDF를 읽지 못했어요. 손상되었거나 비밀번호가 걸려 있을 수 있어요.",
    "pdf.errBuild": "PDF를 만들지 못했어요. 파일을 확인한 뒤 다시 시도해 주세요.",

    "footer.compress": "용량 줄이기",
    "footer.tagline": "© 2026 Pixly · 브라우저 안에서 안전하게 쓰는 이미지 도구.",
    "footer.about": "소개",
    "footer.privacy": "개인정보",
    "footer.contact": "문의",

    "crop.dropOpen": "이미지를 놓거나 클릭해서 선택",
    "crop.dropSub": "상품이나 인물 사진이 잘 맞아요 · 업로드 없음",
    "crop.smart": "스마트 크롭",
    "crop.smartBusy": "피사체 찾는 중…",
    "crop.replace": "이미지 교체",
    "crop.saveAs": "저장 형식",
    "crop.download": "크롭 다운로드",
    "crop.reset": "초기화",
    "crop.rotateL": "왼쪽 회전",
    "crop.rotateR": "오른쪽 회전",
    "crop.flipH": "좌우 반전",
    "crop.flipV": "상하 반전",
    "crop.straighten": "수평 보정",
    "crop.free": "자유",
    "crop.straightenAria": "수평 보정 각도",
    "crop.straightenReset": "수평 보정 초기화",

    "cropPage.h1": "스마트 이미지 자르기",
    "cropPage.intro":
      "사진을 불러온 뒤 원하는 비율로 자르고, 회전하거나 수평을 맞춰보세요. ‘스마트 크롭’을 누르면 Pixly가 상품이나 얼굴처럼 중요한 부분을 찾아 자동으로 맞춰드려요. 모든 작업은 내 기기 안에서 처리되고, 사진은 어디에도 올라가지 않아요.",
    "cropPage.f1t": "피사체 인식",
    "cropPage.f1d": "상품이나 얼굴을 자동으로 찾아요",
    "cropPage.f2t": "원하는 비율",
    "cropPage.f2d": "1:1, 4:5, 16:9 등 자유롭게",
    "cropPage.f3t": "완전히 안전",
    "cropPage.f3d": "사진이 기기 밖으로 나가지 않아요",
    "cropPage.howH2": "이미지를 자르는 방법",
    "cropPage.s1": "위 상자에 이미지를 끌어다 놓거나 클릭해서 선택하세요.",
    "cropPage.s2":
      "비율을 고르거나, 모서리와 변에 있는 8개의 손잡이를 끌어 직접 잘라요.",
    "cropPage.s3":
      "90° 회전, 좌우·상하 반전, 수평 보정 슬라이더로 기울어진 사진을 바로잡으세요. 결과는 실시간으로 보여요.",
    "cropPage.s4":
      "‘스마트 크롭’을 누르면 중요한 부분에 맞춰 자동으로 잘라줘요. 필요하면 직접 다듬으세요.",
    "cropPage.s5":
      "형식을 고르고 저장하면 회전·수평 보정·반전·자르기가 원본 화질 그대로 반영돼요. 아무것도 업로드되지 않아요.",
    "cropPage.whatH2": "스마트 크롭이 뭔가요?",
    "cropPage.whatP":
      "대부분의 도구는 사진 가운데를 그대로 잘라요. 스마트 크롭은 사진의 윤곽·명암·피부톤을 살펴 정말 중요한 부분을 찾고, 그 위치를 중심으로 잡아줘요. 상품 사진, 프로필 사진, 썸네일처럼 피사체가 가운데에 있지 않을 때 특히 편리해요.",
    "cropPage.privH2": "안전한가요?",
    "cropPage.privP":
      "네. 자르기와 피사체 인식 모두 내 기기의 브라우저 안에서 처리돼요. 사진이 서버로 전송되지 않아서, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",

    "about.h1": "Pixly 소개",
    "about.lead":
      "Pixly는 누구나 무료로 쓸 수 있는, 프라이버시 중심의 브라우저 기반 이미지 도구입니다. 설치도 회원가입도 없이, 모든 작업이 당신의 브라우저 안에서 이뤄집니다.",
    "about.p1":
      "저희는 단순한 원칙에서 출발했습니다. 당신의 사진은 당신의 것입니다. 대부분의 온라인 이미지 도구는 파일을 서버에 올려 처리하지만, Pixly는 그러지 않습니다. 변환부터 자르기까지 모든 과정이, 브라우저에 이미 들어 있는 이미지 엔진을 이용해 당신의 기기 안에서 처리됩니다.",
    "about.doTitle": "무엇을 할 수 있나요",
    "about.do":
      "Pixly는 일상에서 자주 필요한 이미지 작업을 한곳에 모았습니다.",
    "about.toolConvert": "형식 변환",
    "about.toolConvertDesc":
      "HEIC·PNG·JPG·WebP·AVIF·GIF 등 널리 쓰이는 형식 사이를 오가는 27가지 변환을 지원합니다.",
    "about.toolCompress": "용량 압축",
    "about.toolCompressDesc": "원하는 파일 크기에 맞춰 이미지를 가볍게 줄여 줍니다.",
    "about.toolCrop": "스마트 자르기",
    "about.toolCropDesc":
      "사진에서 중요한 부분을 알아서 찾아 원하는 비율로 잘라 줍니다.",
    "about.toolPdf": "PDF 변환",
    "about.toolPdfDesc":
      "여러 이미지를 하나의 PDF로 묶거나, PDF를 다시 이미지로 풀어냅니다.",
    "about.doNote": "계정도, 워터마크도, 파일 개수나 크기 제한도 없습니다.",
    "about.privacyTitle": "모든 처리는 브라우저 안에서",
    "about.privacy":
      "당신이 선택한 파일은 어떤 서버에도 업로드되지 않습니다. 이미지가 인터넷을 오갈 일이 없어 더 빠르고, 저희를 포함해 그 누구도 파일을 보거나 저장하지 않습니다. 페이지를 한 번 불러온 뒤에는 인터넷 연결이 끊겨도 도구가 그대로 동작합니다.",
    "about.freeTitle": "어떻게 무료로 유지되나요",
    "about.free":
      "Pixly는 방해되지 않는 광고로 운영됩니다. 이미지를 처리하는 서버가 없어 운영 비용이 낮은 덕분에, 모든 기능을 모두에게 무료로 제공할 수 있습니다.",
    "about.closing":
      "Pixly는 작지만 꾸준히 나아지는 도구입니다. 빠르고, 정직하며, 프라이버시를 지키는 이미지 도구를 계속 만들어 가겠습니다.",

    "privacy.h1": "개인정보 처리방침",
    "privacy.updated": "최종 업데이트: 2026",
    "privacy.imagesTitle": "당신의 이미지",
    "privacy.imagesA": "Pixly는 이미지를 전적으로 브라우저 안에서 처리합니다. 선택한 파일은 ",
    "privacy.imagesStrong": "어떤 서버에도 절대 업로드되지 않습니다.",
    "privacy.imagesB":
      " 파일은 전송되거나 저장되지 않으며, 저희를 포함해 그 누구도 볼 수 없습니다. 페이지를 닫거나 새로고침하면 사라집니다.",
    "privacy.analyticsTitle": "분석",
    "privacy.analytics":
      "어떤 변환기가 인기 있는지 같은 전체 사용 현황을 파악하기 위해, 개인정보를 존중하는 분석 도구를 사용할 수 있습니다. 이 데이터는 익명이며 당신의 이미지나 파일명을 포함하지 않습니다.",
    "privacy.adsTitle": "광고",
    "privacy.adsA":
      "Pixly는 서비스를 무료로 유지하기 위해 광고를 표시합니다. Google을 포함한 제3자 광고 제공업체는 이 사이트와 다른 사이트의 이전 방문 기록을 바탕으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다. 맞춤 광고는 ",
    "privacy.adsLink": "Google 광고 설정",
    "privacy.adsB": "에서 해제할 수 있습니다.",
    "privacy.contactTitle": "문의",
    "privacy.contactA": "개인정보에 관해 궁금한 점이 있으신가요? ",
    "privacy.contactLink": "문의 페이지",
    "privacy.contactB": "를 통해 연락 주세요.",

    "contact.h1": "문의",
    "contact.p1":
      "질문, 버그 제보, 또는 Pixly가 지원했으면 하는 형식이 있으신가요? 언제든 알려주세요.",
    "contact.emailLabel": "이메일:",
    "contact.reply": "보통 며칠 안에 답장드립니다.",

    // FAQ page chrome. The Q&A itself lives in app/faq/faqData.ts (one source
    // shared by the visible page and the FAQPage JSON-LD).
    "faq.h1": "자주 묻는 질문",
    "faq.intro":
      "Pixly를 쓰면서 가장 많이 궁금해하시는 점을 모았어요. 짧게 답하자면 — 파일은 서버에 올라가지 않고, 모든 기능은 무료이며, 회원가입도 필요 없어요.",
    "faq.relatedLabel": "관련 도구",
    "faq.stillTitle": "찾는 답이 없나요?",
    "faq.stillA": "궁금한 점이 더 있다면 언제든 ",
    "faq.stillLink": "문의 페이지",
    "faq.stillB": "로 물어봐 주세요.",

    // 404 / error pages.
    "nf.code": "404",
    "nf.title": "페이지를 찾을 수 없어요",
    "nf.desc": "찾으시는 페이지가 없거나 주소가 바뀌었어요. 아래에서 다시 시작해 보세요.",
    "nf.home": "홈으로 돌아가기",
    "nf.browse": "변환 도구 둘러보기",
    "err.title": "문제가 발생했어요",
    "err.desc": "예상치 못한 오류가 생겼어요. 파일은 안전하게 기기 안에 남아 있어요. 다시 시도해 주세요.",
    "err.retry": "다시 시도",
    "err.home": "홈으로 돌아가기",
  },
  en: {
    "nav.convert": "Convert",
    "nav.compress": "Compress",
    "nav.crop": "Crop",
    "nav.video": "Video",
    "nav.about": "About",
    "nav.pdf": "PDF tools",
    "nav.tools": "Tools",
    "nav.info": "Info",
    "nav.menu": "Open menu",
    "nav.close": "Close menu",

    "home.eyebrow": "No uploads · safe on your own device",
    "home.h1a": "Convert and crop images,",
    "home.h1b": "in just seconds",
    "home.sub":
      "Turn tricky formats like HEIC, PNG and JPG into whatever you need with a couple of clicks. No install, no sign-up — and your files never leave your device.",
    "home.ctaBrowse": "Browse converters",
    "home.ctaCrop": "Crop a photo",
    "home.heroReassure": "No watermark · No limits · 100% in your browser",
    "home.formatsLabel": "Works with",
    "home.why": "Why Pixly",
    "home.whySub": "Built so anyone can use it, with zero friction.",
    "home.popular": "Popular conversions",
    "home.popularSub": "The conversions people reach for most.",
    "home.all": "All {n} tools",
    "home.toolsReassure": "Your files never leave your device",
    "home.howto": "It couldn't be simpler",
    "home.new": "New",
    "home.cropTitle": "Smart auto-crop",
    "home.cropDesc":
      "Drop in a product shot or portrait and Pixly finds what matters, then crops it to any ratio you like. Fine-tune by hand and save in one click.",
    "home.cropCta": "Try it now →",

    "benefit.heic-to-jpg": "iPhone photos that open anywhere",
    "benefit.png-to-webp": "Same look, much smaller file",
    "benefit.heic-to-png": "iPhone photos, sharp and lossless",
    "benefit.webp-to-jpg": "Back to a photo that opens everywhere",
    "benefit.png-to-jpg": "Lighter files, easy to share",
    "benefit.avif-to-jpg": "New format into a familiar photo",

    "trust.private": "Safe & private",
    "trust.privateSub": "Photos are never uploaded",
    "trust.nosignup": "No sign-up",
    "trust.nosignupSub": "Start using it right away",
    "trust.unlimited": "No limits",
    "trust.unlimitedSub": "Any size, any number",
    "trust.instant": "Fast",
    "trust.instantSub": "Runs right on your device",

    "step.1t": "Pick a photo",
    "step.1d": "Drag in the image you want to change, or click to choose one.",
    "step.2t": "It converts automatically",
    "step.2d": "No fiddly settings — it's handled right on your device.",
    "step.3t": "Save it",
    "step.3d": "Download the new file and you're done. Nothing was ever sent.",

    "conv.dropOpen": "Drop {fmt} files here, or click to browse",
    "conv.dropSub": "Converted instantly in your browser · never uploaded",
    "conv.quality": "Quality",
    "conv.modeQuality": "Quality",
    "conv.modeSize": "Target size",
    "conv.sizeShort": "Size",
    "conv.targetSize": "Target size",
    "conv.converted": "{done}/{total} converted",
    "conv.advanced": "Advanced settings",
    "conv.advancedSub": "Changes re-apply to every file you've added",
    "conv.resize": "Resize",
    "conv.resizeNone": "Keep original size",
    "conv.resizeWidth": "Fit to width (px)",
    "conv.resizeHeight": "Fit to height (px)",
    "conv.resizeDims": "Width × Height (px)",
    "conv.resizePercent": "By percentage (%)",
    "conv.width": "Width",
    "conv.height": "Height",
    "conv.percent": "Percent",
    "conv.background": "Background",
    "conv.backgroundHint": "Fills transparent areas (JPG can't store transparency).",
    "conv.autoOrient": "Auto-orient",
    "conv.autoOrientHint": "Rotate photos upright using their EXIF orientation.",
    "conv.stripMetadata": "Strip metadata",
    "conv.stripMetadataHint": "Removes EXIF, GPS location, and color profiles — smaller files, more privacy.",
    "conv.lossless": "Lossless",
    "conv.losslessHint": "Encode WebP with no quality loss. Great for graphics and screenshots; photos may get larger.",
    "conv.losslessBadge": "Lossless",
    "conv.preset": "Preset",
    "conv.presetNone": "Load…",
    "conv.presetSave": "Save",
    "conv.presetName": "Preset name",
    "conv.presetCancel": "Cancel",
    "conv.reset": "Reset",
    "conv.clear": "Clear all",
    "conv.converting": "Converting…",
    "conv.download": "Download",
    "conv.downloadAll": "Download all as ZIP ({n})",
    "conv.zipping": "Zipping…",
    "conv.unsupported": "Unsupported file type.",

    // Detail-page chrome shared by converter / compress / PDF landings.
    "badge.privateT": "100% private",
    "badge.privateD": "Files stay on your device",
    "badge.nosignupT": "No sign-up",
    "badge.nosignupD": "No account, no email",
    "badge.unlimitedT": "Unlimited",
    "badge.unlimitedD": "No file-count or size caps",
    "detail.safeHeading": "Is it safe?",
    "detail.relatedTools": "Related tools",

    // Converter detail pages ({from}/{to} = FORMATS labels).
    "conv.h1": "{from} to {to} Converter",
    "conv.intro":
      "Free {from} → {to} conversion that runs entirely in your browser. Your images are never uploaded to a server.",
    "conv.whyHeading": "Why convert {from} to {to}?",
    "conv.safeBody":
      "Yes. Unlike most online converters, Pixly never uploads your files. All processing happens locally using your browser's built-in image engine, so your photos never touch a server — which also makes it fast and works offline once loaded.",
    "conv.relatedConverters": "Related converters",

    // Compress landing.
    "compress.h1": "Compress Images Online",
    "compress.intro":
      "Free image compression that runs entirely in your browser. Shrink JPG, PNG, HEIC or WebP photos to an exact target size — your files are never uploaded to a server.",
    "compress.whyHeading": "Why compress images?",

    "compress.dropOpen": "Drop images here, or click to browse",
    "compress.dropSub": "Shrink files right in your browser · never uploaded",
    "compress.format": "Output format",
    "compress.working": "Compressing…",
    "compress.compressed": "{done}/{total} compressed",
    "compress.overTarget": "Over target (lowest quality)",

    // Video converter.
    "video.h1": "Convert Video for the Web",
    "video.intro":
      "Compress MP4 and other videos into web-ready WebM or MP4, or turn a short clip into a GIF — right in your browser. No upload, no sign-up, and your files never leave your device.",
    "video.whyHeading": "Why convert video for the web?",

    "vid.dropOpen": "Drop a video here, or click to browse",
    "vid.dropSub": "Converts right in your browser · never uploaded",
    "vid.format": "Output format",
    "vid.hintWebm": "Web standard · smallest files",
    "vid.hintMp4": "Plays everywhere · most compatible",
    "vid.hintGif": "Turn a short clip into a moving image",
    "vid.formatUnavailable": "Not available in this browser",
    "vid.quality": "Quality",
    "vid.quality.low": "Light",
    "vid.quality.medium": "Balanced",
    "vid.quality.high": "High",
    "vid.gifNote": "GIF works best for short clips — up to {sec}s and {px}px wide. Longer or larger videos are trimmed and scaled down, and there's no sound.",
    "vid.advancedSub": "Applies to videos you convert from now on.",
    "vid.fps": "Frames / sec",
    "vid.fpsHint": "FPS (1–30). Higher is smoother but larger.",
    "vid.queued": "Queued",
    "vid.reconvert": "Reconvert",
    "vid.remove": "Remove",
    "vid.notVideo": "That's not a video file.",
    "vid.probeError": "Couldn't read this video. Try another file.",
    "vid.unsupportedTarget": "This browser can't produce this format. Try a different one.",
    "vid.convertError": "Conversion failed. Try a different format or settings.",
    "vid.noSupportTitle": "This browser doesn't support video conversion",
    "vid.noSupportBody": "Please open this page in a recent version of Chrome or Edge.",

    "pdf.tools": "PDF tools",
    "pdf.homeTitle": "PDF tools",
    "pdf.homeSub":
      "Combine images into a single PDF, or turn a PDF back into images — all in your browser.",
    "pdf.cardJpgToPdf": "Combine JPG photos into one PDF",
    "pdf.cardPngToPdf": "Combine PNG images into one PDF",
    "pdf.cardPdfToJpg": "Save each PDF page as a JPG",
    "pdf.cardPdfToPng": "Save each PDF page as a PNG",

    "pdf.dropImages": "Drop {fmt} images here, or click to browse",
    "pdf.dropImagesSub": "Combined into one PDF in your browser · never uploaded",
    "pdf.dropPdf": "Drop a PDF here, or click to browse",
    "pdf.dropPdfSub": "Rendered to images in your browser · never uploaded",

    "pdf.pageSize": "Page size",
    "pdf.sizeFit": "Fit to image",
    "pdf.sizeA4": "A4",
    "pdf.sizeLetter": "Letter",
    "pdf.orientation": "Orientation",
    "pdf.orientAuto": "Auto",
    "pdf.portrait": "Portrait",
    "pdf.landscape": "Landscape",
    "pdf.margin": "Margin",
    "pdf.marginNone": "None",
    "pdf.marginSmall": "Small",
    "pdf.marginLarge": "Large",

    "pdf.resolution": "Resolution",
    "pdf.resStandard": "Standard",
    "pdf.resHigh": "High",
    "pdf.resMax": "Max",

    "pdf.makePdf": "Create PDF",
    "pdf.making": "Creating PDF…",
    "pdf.downloadPdf": "Download PDF",
    "pdf.imageCount": "{n} images",
    "pdf.reorderHint": "Reorder pages with the arrows before creating your PDF.",
    "pdf.moveUp": "Move up",
    "pdf.moveDown": "Move down",
    "pdf.remove": "Remove",

    "pdf.rendering": "Rendering…",
    "pdf.readingPdf": "Reading PDF…",
    "pdf.renderedPages": "{done}/{total} pages",
    "pdf.page": "Page {n}",
    "pdf.errRender":
      "Couldn't read this PDF. It may be corrupted or password-protected.",
    "pdf.errBuild": "Couldn't create the PDF. Check your files and try again.",

    "footer.compress": "Compress",
    "footer.tagline": "© 2026 Pixly · Private, in-browser image tools.",
    "footer.about": "About",
    "footer.privacy": "Privacy",
    "footer.contact": "Contact",

    "crop.dropOpen": "Drop an image, or click to browse",
    "crop.dropSub": "A product or portrait works great · nothing is uploaded",
    "crop.smart": "Smart crop",
    "crop.smartBusy": "Finding subject…",
    "crop.replace": "Replace image",
    "crop.saveAs": "Save as",
    "crop.download": "Download crop",
    "crop.reset": "Reset",
    "crop.rotateL": "Rotate left",
    "crop.rotateR": "Rotate right",
    "crop.flipH": "Flip horizontal",
    "crop.flipV": "Flip vertical",
    "crop.straighten": "Straighten",
    "crop.free": "Free",
    "crop.straightenAria": "Straighten angle",
    "crop.straightenReset": "Reset straighten",

    "cropPage.h1": "Smart Image Cropper",
    "cropPage.intro":
      "Drop in a photo, then crop, rotate, straighten, or flip it to any aspect ratio. Hit Smart crop and Pixly finds the subject — a product or a face — and frames it for you. Everything runs on your device, and your image is never uploaded.",
    "cropPage.f1t": "Subject-aware",
    "cropPage.f1d": "Finds the product or face",
    "cropPage.f2t": "Any ratio",
    "cropPage.f2d": "1:1, 4:5, 16:9, and more",
    "cropPage.f3t": "Fully private",
    "cropPage.f3d": "Nothing leaves your device",
    "cropPage.howH2": "How to crop an image",
    "cropPage.s1": "Drop your image into the box above, or click to browse.",
    "cropPage.s2":
      "Pick an aspect ratio, or drag any of the 8 handles — corners and edge midpoints — to crop by hand.",
    "cropPage.s3":
      "Rotate 90°, flip, or nudge the straighten slider to level a tilted horizon. Everything previews live.",
    "cropPage.s4":
      "Click Smart crop to auto-frame the subject, then fine-tune if you want.",
    "cropPage.s5":
      "Choose a format and download. Your rotation, straighten, flips, and crop are all baked in at full resolution. Nothing is uploaded.",
    "cropPage.whatH2": "What is smart crop?",
    "cropPage.whatP":
      "Most croppers just chop the middle of the image. Smart crop looks at the picture — edges, contrast, and skin tones — to find the region that actually matters, then centers the frame there. It's handy for product shots, profile pictures, and thumbnails where the subject isn't dead center.",
    "cropPage.privH2": "Is it private?",
    "cropPage.privP":
      "Yes. The cropping and subject detection both run locally in your browser. Your photo is never sent to a server, so it works even offline once the page has loaded.",

    "about.h1": "About Pixly",
    "about.lead":
      "Pixly is a free, privacy-first image toolkit that runs entirely in your browser. No installs, no accounts — every task happens on your own device.",
    "about.p1":
      "We started from a simple principle: your photos are yours. Most online image tools upload your files to a server before they can process them. Pixly doesn't. From converting to cropping, everything runs on your device using the image engine your browser already ships with.",
    "about.doTitle": "What Pixly does",
    "about.do":
      "Pixly brings the image tasks you reach for most often into one place.",
    "about.toolConvert": "Format conversion",
    "about.toolConvertDesc":
      "27 conversions across widely used formats, including HEIC, PNG, JPG, WebP, AVIF, and GIF.",
    "about.toolCompress": "Compression",
    "about.toolCompressDesc": "Shrink images down to a target file size.",
    "about.toolCrop": "Smart cropping",
    "about.toolCropDesc":
      "Automatically finds the important part of a photo and crops it to the ratio you need.",
    "about.toolPdf": "PDF tools",
    "about.toolPdfDesc":
      "Combine several images into a single PDF, or turn a PDF back into images.",
    "about.doNote":
      "There are no accounts, no watermarks, and no limits on file count or size.",
    "about.privacyTitle": "Everything runs in your browser",
    "about.privacy":
      "The files you choose are never uploaded to any server. Because your images never travel across the internet, Pixly is faster — and no one, including us, ever sees or stores them. Once the page has loaded, the tools keep working even if your connection drops.",
    "about.freeTitle": "How Pixly stays free",
    "about.free":
      "Pixly is supported by unobtrusive advertising. Because there are no servers processing your images, our running costs stay low — which lets us keep every tool free for everyone.",
    "about.closing":
      "Pixly is a small tool that keeps getting better. We're committed to building image tools that stay fast, honest, and private.",

    "privacy.h1": "Privacy Policy",
    "privacy.updated": "Last updated: 2026",
    "privacy.imagesTitle": "Your images",
    "privacy.imagesA": "Pixly processes images entirely within your browser. The files you select are ",
    "privacy.imagesStrong": "never uploaded to any server",
    "privacy.imagesB":
      ". They are never transmitted, stored, or seen by us or anyone else. When you close or reload the page, they're gone.",
    "privacy.analyticsTitle": "Analytics",
    "privacy.analytics":
      "We may use privacy-respecting analytics to understand aggregate usage (for example, which converters are popular). This data is anonymous and never includes your images or filenames.",
    "privacy.adsTitle": "Advertising",
    "privacy.adsA":
      "Pixly displays ads to keep the service free. Third-party ad providers, including Google, may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalized advertising by visiting ",
    "privacy.adsLink": "Google Ads Settings",
    "privacy.adsB": ".",
    "privacy.contactTitle": "Contact",
    "privacy.contactA": "Questions about privacy? Reach us via the ",
    "privacy.contactLink": "contact page",
    "privacy.contactB": ".",

    "contact.h1": "Contact",
    "contact.p1":
      "Have a question, a bug report, or a format you'd like Pixly to support? We'd love to hear from you.",
    "contact.emailLabel": "Email:",
    "contact.reply": "We usually reply within a couple of days.",

    // FAQ page chrome. The Q&A itself lives in app/faq/faqData.ts (one source
    // shared by the visible page and the FAQPage JSON-LD).
    "faq.h1": "Frequently Asked Questions",
    "faq.intro":
      "The questions people ask us most, answered in full. The short version: your files are never uploaded, every tool is free, and there's no sign-up.",
    "faq.relatedLabel": "Related tools",
    "faq.stillTitle": "Didn't find your answer?",
    "faq.stillA": "Still have a question? Reach us anytime on the ",
    "faq.stillLink": "contact page",
    "faq.stillB": ".",

    // 404 / error pages.
    "nf.code": "404",
    "nf.title": "Page not found",
    "nf.desc":
      "The page you're looking for doesn't exist or has moved. Try starting again below.",
    "nf.home": "Back to home",
    "nf.browse": "Browse converters",
    "err.title": "Something went wrong",
    "err.desc":
      "An unexpected error occurred. Your files are safe on your device. Please try again.",
    "err.retry": "Try again",
    "err.home": "Back to home",
  },
} as const;

export type TKey = keyof (typeof DICT)["en"];

type Params = Record<string, string | number>;

function format(str: string, params?: Params): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

interface I18n {
  locale: Locale;
  t: (key: TKey, params?: Params) => string;
}

const I18nContext = createContext<I18n>({
  locale: "ko",
  t: (k) => DICT.ko[k] ?? String(k),
});

// ---------------------------------------------------------------------------
// Locale is derived from the URL, not client state: Korean lives at the
// unprefixed routes (/, /png-to-jpg/) and English at /en/* mirrors. Each
// language is therefore a distinct, separately-indexable URL (dual-route i18n
// SEO), and the prerendered static HTML is already in the right language —
// usePathname() is baked into the HTML at build time, so /en/* prerenders
// English with no hydration mismatch (there are no rewrites). The language
// toggle navigates between the two URLs instead of flipping client state.
// ---------------------------------------------------------------------------

/** Korean is the default; a path is English only when it is (or is under) /en. */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
}

/** Drop the /en prefix to get the language-neutral route — used to match the
 *  active page against the unprefixed nav hrefs. "/en/crop/" → "/crop/". */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en" || pathname === "/en/") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** Prefix an internal href for the given locale. Korean (default) stays
 *  unprefixed; English gets /en. Hash-only, external, and already-prefixed
 *  hrefs pass through. "/crop/" → "/en/crop/", "/" → "/en/". */
export function localizedHref(locale: Locale, href: string): string {
  if (locale !== "en") return href;
  if (!href.startsWith("/")) return href;
  if (href === "/en" || href.startsWith("/en/")) return href;
  return href === "/" ? "/en/" : `/en${href}`;
}

/** The mirror of the current path in the other language — powers the toggle. */
export function otherLocaleHref(pathname: string): string {
  return localeFromPath(pathname) === "en"
    ? stripLocalePrefix(pathname)
    : localizedHref("en", pathname || "/");
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);

  // Keep <html lang> in sync on client navigations. The initial paint is set by
  // the inline LANG_INIT script in app/layout.tsx (before hydration).
  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      /* ignore */
    }
  }, [locale]);

  const t = (key: TKey, params?: Params) =>
    format(DICT[locale][key] ?? DICT.en[key] ?? String(key), params);

  return createElement(I18nContext.Provider, { value: { locale, t } }, children);
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
