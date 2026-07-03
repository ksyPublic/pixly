"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Locale = "ko" | "en";

// Visible UI strings. Per-conversion SEO meta (titles/descriptions in
// lib/conversions.ts) stays English on purpose — it targets English search.
const DICT = {
  ko: {
    "nav.convert": "변환",
    "nav.crop": "자르기",
    "nav.about": "소개",

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
    "home.startTitle": "지금 바로 변환해 보세요",
    "home.startSub": "파일을 끌어다 놓으면 브라우저 안에서 바로 변환돼요.",
    "home.formatHelp": "잘 모르겠다면 JPG를 고르세요 — 거의 모든 곳에서 열려요.",

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
    "conv.to": "변환 대상",
    "conv.quality": "품질",
    "conv.modeQuality": "품질",
    "conv.modeSize": "용량 맞추기",
    "conv.targetSize": "목표 용량",
    "conv.converted": "{done}/{total} 변환됨",
    "conv.clear": "모두 지우기",
    "conv.converting": "변환 중…",
    "conv.download": "다운로드",
    "conv.downloadAll": "전체 ZIP 다운로드 ({n})",
    "conv.zipping": "압축하는 중…",
    "conv.unsupported": "지원하지 않는 파일 형식입니다.",

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
    "about.p1":
      "Pixly는 단순한 원칙에서 출발한 무료 이미지 변환기입니다. 당신의 사진은 당신의 것입니다. 대부분의 온라인 변환기는 파일을 서버에 올려서 처리하지만, Pixly는 그러지 않습니다. 모든 변환은 브라우저에 이미 들어 있는 이미지 엔진을 이용해 당신의 브라우저 안에서 처리됩니다.",
    "about.p2":
      "덕분에 이미지가 인터넷을 오가지 않고, 남의 서버에 저장되지 않으며, 어디에도 기록되지 않습니다. 업로드·다운로드 왕복이 없어 더 빠르고, 페이지를 한 번 불러온 뒤에는 연결이 끊겨도 동작합니다.",
    "about.p3":
      "HEIC(아이폰이 쓰는 사진 형식), JPG, PNG, WebP 같은 일상적인 형식을 지원하며, 더 많은 형식을 추가하고 있습니다. 계정도, 워터마크도, 변환 개수 제한도 없습니다.",
    "about.freeTitle": "어떻게 무료로 유지되나요",
    "about.free":
      "Pixly는 방해되지 않는 광고로 운영됩니다. 이미지를 처리하는 서버가 없어 운영 비용이 낮기 때문에, 도구를 모두에게 무료로 제공할 수 있습니다.",

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
  },
  en: {
    "nav.convert": "Convert",
    "nav.crop": "Crop",
    "nav.about": "About",

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
    "home.startTitle": "Convert right here",
    "home.startSub": "Drop a file — it converts instantly, right in your browser.",
    "home.formatHelp": "Not sure which to pick? Choose JPG — it opens almost everywhere.",

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
    "conv.to": "Convert to",
    "conv.quality": "Quality",
    "conv.modeQuality": "Quality",
    "conv.modeSize": "Target size",
    "conv.targetSize": "Target size",
    "conv.converted": "{done}/{total} converted",
    "conv.clear": "Clear all",
    "conv.converting": "Converting…",
    "conv.download": "Download",
    "conv.downloadAll": "Download all as ZIP ({n})",
    "conv.zipping": "Zipping…",
    "conv.unsupported": "Unsupported file type.",

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
    "about.p1":
      "Pixly is a free image converter built on a simple idea: your photos are yours. Most online converters upload your files to a server to process them. Pixly doesn't. Every conversion happens locally, in your own browser, using the same image engine your browser already ships with.",
    "about.p2":
      "That means your images never travel across the internet, never sit on someone else's server, and never get logged. It's also faster — there's no upload or download round-trip — and it works even if your connection drops after the page loads.",
    "about.p3":
      "We support common everyday formats like HEIC (the photo format iPhones use), JPG, PNG, and WebP, with more on the way. There are no accounts, no watermarks, and no limits on how many files you convert.",
    "about.freeTitle": "How it stays free",
    "about.free":
      "Pixly is supported by unobtrusive advertising. Because there are no servers processing your images, running costs are low — so we can keep the tools free for everyone.",

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
  setLocale: (l: Locale) => void;
  t: (key: TKey, params?: Params) => string;
}

const I18nContext = createContext<I18n>({
  locale: "ko",
  setLocale: () => {},
  t: (k) => DICT.ko[k] ?? String(k),
});

const STORAGE_KEY = "pixly-lang";

// Locale lives in localStorage (an external store). useSyncExternalStore reads
// it without a setState-in-effect: during SSR/hydration it uses the server
// snapshot ("ko", the default) so the markup matches, then switches to the
// persisted value right after mount. Static-export safe — no window on the server.
const localeListeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  return "ko"; // default Korean
}

function subscribeLocale(onChange: () => void): () => void {
  localeListeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerLocale(): Locale {
  return "ko";
}

function setLocale(l: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore */
  }
  localeListeners.forEach((cb) => cb());
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, getServerLocale);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      /* ignore */
    }
  }, [locale]);

  const t = (key: TKey, params?: Params) =>
    format(DICT[locale][key] ?? DICT.en[key] ?? String(key), params);

  return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
