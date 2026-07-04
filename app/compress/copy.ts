// Localized copy for the /compress landing page. Server-safe (no "use client"),
// so both the server page (JSON-LD + metadata, "ko") and the client landing
// component (active locale) import from ONE source — the structured data can
// never drift from the visible, default-Korean render. The interactive tool
// itself lives in CompressContent.tsx; this is just the surrounding SEO prose.

import type { HowToStep } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";

export interface CompressCopy {
  appName: string;
  howToTitle: string;
  howToSteps: HowToStep[];
  whyBody: string;
  /** "Is it safe?" answer — shown under the safe heading. */
  safeBody: string;
}

// Korean is emitted (matches the indexed page); English kept for reference.
export const COMPRESS_META = {
  title: "이미지 압축 — 용량 줄이기 무료, 업로드 없음 | Pixly",
  description:
    "JPG, PNG, HEIC, WebP 이미지를 브라우저에서 무료로 압축하세요. 300KB처럼 원하는 목표 용량에 맞춰 줄일 수 있고, 업로드도 회원가입도 개수 제한도 없어요. 파일은 기기 밖으로 나가지 않아요.",
  titleEn:
    "Compress Images Online — Reduce File Size Free, No Upload | Pixly",
  descriptionEn:
    "Compress JPG, PNG, HEIC and WebP images for free, right in your browser. Shrink to an exact target size like 300 KB with no upload, no sign-up, and no limits — your files never leave your device.",
};

export function compressCopy(locale: Locale): CompressCopy {
  if (locale === "ko") {
    return {
      appName: "Pixly 이미지 압축기",
      howToTitle: "이미지 압축하는 방법",
      howToSteps: [
        {
          name: "이미지 추가",
          text: "위 상자에 이미지를 끌어다 놓거나 클릭해서 선택하세요. 여러 장을 한 번에 추가할 수 있어요.",
        },
        {
          name: "목표 정하기",
          text: "목표 용량(예: 300KB)이나 품질을 고르고, 출력 형식을 JPG 또는 WebP로 설정하세요.",
        },
        {
          name: "다운로드",
          text: "Pixly가 각 이미지를 브라우저 안에서 압축해요. 다운로드를 누르거나, 전체를 .zip으로 한 번에 받으세요.",
        },
      ],
      whyBody:
        "큰 이미지는 웹페이지를 느리게 하고, 저장 공간을 잡아먹고, 이메일이나 업로드 용량 제한에 걸리기 쉬워요. 압축은 이미지를 더 작은 용량으로 다시 저장해요 — 흔히 50~90%까지 줄이면서도 원본과 거의 똑같아 보이게요. Pixly의 목표 용량 모드는 300KB나 1MB 같은 제한 바로 아래로 파일을 맞춰줘요. 업로드 기반 도구에서는 보통 유료이거나 대기해야 하는 기능이지만, 여기서는 업로드가 없어 무료로 곧바로 처리돼요.",
      safeBody:
        "네. 모든 이미지는 브라우저에 내장된 이미지 엔진으로 기기 안에서 압축돼요. 파일이 서버에 닿지 않아 아무것도 업로드·기록·저장되지 않아요. 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
    };
  }
  return {
    appName: "Pixly Image Compressor",
    howToTitle: "How to compress an image",
    howToSteps: [
      {
        name: "Add your images",
        text: "Drop your images into the box above, or click to browse. You can add many at once.",
      },
      {
        name: "Pick a target",
        text: "Choose a target file size (for example 300 KB) or a quality level, and set the output to JPG or WebP.",
      },
      {
        name: "Download",
        text: "Pixly compresses each image right in your browser — click Download, or grab them all as a .zip.",
      },
    ],
    whyBody:
      "Large images slow down web pages, eat up storage, and bump into email or upload limits. Compressing re-encodes an image at a smaller size — often 50–90% smaller — while keeping it visually close to the original. Pixly's target-size mode lands your file just under a limit like 300 KB or 1 MB, a feature usually paywalled or queued on upload-based tools. Here it's free and instant, because there is no upload.",
    safeBody:
      "Yes. Every image is compressed locally in your browser using its built-in image engine, so your files never touch a server — nothing is uploaded, logged, or stored. It also works offline once the page has loaded.",
  };
}
