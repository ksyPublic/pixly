"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ko" | "en";

// Visible UI strings. Per-conversion SEO meta (titles/descriptions in
// lib/conversions.ts) stays English on purpose — it targets English search.
const DICT = {
  ko: {
    "nav.convert": "변환",
    "nav.crop": "크롭",
    "nav.about": "소개",

    "home.eyebrow": "파일은 브라우저를 벗어나지 않습니다",
    "home.h1a": "이미지 변환과 크롭,",
    "home.h1b": "완전히 사적으로.",
    "home.sub":
      "브라우저에서 100% 돌아가는 빠른 이미지 도구. 업로드도, 계정도, 제한도 없습니다. 사진이 서버에 닿지 않아요.",
    "home.ctaBrowse": "변환기 둘러보기",
    "home.ctaCrop": "스마트 크롭 →",
    "home.popular": "인기 변환기",
    "home.all": "전체 {n}개 변환기",
    "home.howto": "작동 방식",
    "home.new": "신규",
    "home.cropTitle": "스마트 크롭",
    "home.cropDesc":
      "상품이나 인물 사진을 올리면 Pixly가 피사체를 찾아 원하는 비율로 잘라줍니다. 손으로 다듬고 클릭 한 번에 저장하세요.",
    "home.cropCta": "사용해보기 →",

    "trust.private": "사적",
    "trust.privateSub": "아무것도 업로드 안 함",
    "trust.nosignup": "가입 불필요",
    "trust.nosignupSub": "계정 없이",
    "trust.unlimited": "무제한",
    "trust.unlimitedSub": "용량·개수 제한 없음",
    "trust.instant": "즉시",
    "trust.instantSub": "내 기기에서 처리",

    "step.1t": "파일 올리기",
    "step.1d": "아무 이미지나 선택하면 브라우저로 바로 읽힙니다.",
    "step.2t": "기기에서 변환",
    "step.2d": "WebAssembly와 Canvas로 내 기기에서 처리됩니다.",
    "step.3t": "다운로드",
    "step.3d": "결과를 저장하세요. 아무것도 전송되지 않았습니다.",

    "conv.dropOpen": "{fmt} 파일을 놓거나 클릭해서 선택",
    "conv.dropSub": "브라우저에서 즉시 변환 · 업로드 없음",
    "conv.to": "변환 대상",
    "conv.quality": "품질",
    "conv.converted": "{done}/{total} 변환됨",
    "conv.clear": "모두 지우기",
    "conv.converting": "변환 중…",
    "conv.download": "다운로드",
    "conv.unsupported": "지원하지 않는 파일 형식입니다.",

    "footer.tagline": "© 2026 Pixly · 사적인 브라우저 내 이미지 도구.",
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

    "home.eyebrow": "Files never leave your browser",
    "home.h1a": "Convert & crop images,",
    "home.h1b": "privately.",
    "home.sub":
      "A fast image toolkit that runs entirely in your browser. No uploads, no accounts, no limits — your photos never touch a server.",
    "home.ctaBrowse": "Browse converters",
    "home.ctaCrop": "Smart crop →",
    "home.popular": "Popular converters",
    "home.all": "All {n} converters",
    "home.howto": "How it works",
    "home.new": "New",
    "home.cropTitle": "Smart crop",
    "home.cropDesc":
      "Drop in a product or portrait and Pixly finds the subject, then crops around it for any aspect ratio. Adjust by hand, download in a click.",
    "home.cropCta": "Try it →",

    "trust.private": "Private",
    "trust.privateSub": "Nothing is uploaded",
    "trust.nosignup": "No sign-up",
    "trust.nosignupSub": "No account, ever",
    "trust.unlimited": "Unlimited",
    "trust.unlimitedSub": "No size or count caps",
    "trust.instant": "Instant",
    "trust.instantSub": "Runs on your device",

    "step.1t": "Drop a file",
    "step.1d": "Pick any image. It's read straight into your browser.",
    "step.2t": "It converts locally",
    "step.2d": "The work happens on your device using WebAssembly and Canvas.",
    "step.3t": "Download",
    "step.3d": "Save the result. Nothing was ever sent anywhere.",

    "conv.dropOpen": "Drop {fmt} files here, or click to browse",
    "conv.dropSub": "Converted instantly in your browser · never uploaded",
    "conv.to": "Convert to",
    "conv.quality": "Quality",
    "conv.converted": "{done}/{total} converted",
    "conv.clear": "Clear all",
    "conv.converting": "Converting…",
    "conv.download": "Download",
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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko"); // default Korean

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pixly-lang");
      if (saved === "ko" || saved === "en") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {
      /* ignore */
    }
  }, [locale]);

  function setLocale(l: Locale) {
    setLocaleState(l);
    try {
      localStorage.setItem("pixly-lang", l);
    } catch {
      /* ignore */
    }
  }

  const t = (key: TKey, params?: Params) =>
    format(DICT[locale][key] ?? DICT.en[key] ?? String(key), params);

  return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
