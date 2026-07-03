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
