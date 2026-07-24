// Localized copy for the /video landing page. Server-safe (no "use client"), so
// both the server page (JSON-LD + metadata, "ko") and the client landing
// component (active locale) import from ONE source — the structured data can
// never drift from the visible, default-Korean render. The interactive tool
// itself lives in components/VideoConverter.tsx; this is just the SEO prose.

import type { HowToStep } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";

export interface VideoCopy {
  appName: string;
  howToTitle: string;
  howToSteps: HowToStep[];
  whyBody: string;
  /** "Is it safe?" answer — shown under the safe heading. */
  safeBody: string;
}

// Korean is emitted (matches the indexed page); English kept for the /en mirror.
export const VIDEO_META = {
  title: "영상 웹용 변환 — MP4를 WebM·GIF로 무료, 업로드 없음 | Pixly",
  description:
    "MP4 등 영상을 브라우저에서 무료로 WebM·MP4로 압축하거나 GIF로 만들어요. 업로드도 회원가입도 개수 제한도 없고, 파일은 기기 밖으로 나가지 않아요.",
  titleEn:
    "Convert Video for the Web — MP4 to WebM & GIF, Free, No Upload | Pixly",
  descriptionEn:
    "Compress MP4 and other videos to web-ready WebM or MP4, or make a GIF — free, right in your browser. No upload, no sign-up, no limits, and your files never leave your device.",
};

export function videoCopy(locale: Locale): VideoCopy {
  if (locale === "ko") {
    return {
      appName: "Pixly 영상 변환기",
      howToTitle: "영상을 웹용으로 변환하는 방법",
      howToSteps: [
        {
          name: "영상 추가",
          text: "위 상자에 영상을 끌어다 놓거나 클릭해서 선택하세요. MP4·MOV·WebM 등을 여러 개 한 번에 추가할 수 있어요.",
        },
        {
          name: "형식 고르기",
          text: "WebM(가장 가벼움), MP4(호환성 최고), 또는 GIF 중에서 고르고, 필요하면 품질과 크기를 조절하세요.",
        },
        {
          name: "다운로드",
          text: "Pixly가 브라우저 안에서 바로 변환해요. 진행률을 보다가 완료되면 다운로드하거나, 여러 개를 .zip으로 한 번에 받으세요.",
        },
      ],
      whyBody:
        "화면 녹화나 휴대폰 영상은 용량이 커서 웹페이지를 느리게 하고, 업로드 제한에 걸리기 쉬워요. WebM은 같은 화질을 훨씬 작은 용량으로 담는 웹 표준 형식이라 웹페이지에 그대로 올리기 좋고, MP4는 어디서나 재생돼요. 짧은 장면은 GIF로 만들어 미리보기나 SNS에 쓸 수 있어요. Pixly는 이 모든 걸 브라우저의 하드웨어 가속(WebCodecs)으로 처리하므로, 업로드 기반 도구와 달리 대기 시간도 용량 제한도 없어요.",
      safeBody:
        "네. 영상은 브라우저 안에서 기기의 영상 엔진으로 변환돼요. 파일이 서버에 올라가지 않아 아무것도 업로드·기록·저장되지 않아요. 영상 변환은 최신 Chrome·Edge에서 가장 잘 동작하고, 일부 브라우저는 아직 지원이 제한적일 수 있어요.",
    };
  }
  return {
    appName: "Pixly Video Converter",
    howToTitle: "How to convert a video for the web",
    howToSteps: [
      {
        name: "Add your video",
        text: "Drop a video into the box above, or click to browse. You can add several MP4, MOV or WebM files at once.",
      },
      {
        name: "Pick a format",
        text: "Choose WebM (smallest), MP4 (most compatible), or GIF — and tweak the quality and size if you like.",
      },
      {
        name: "Download",
        text: "Pixly converts each video right in your browser. Watch the progress, then download — or grab them all as a .zip.",
      },
    ],
    whyBody:
      "Screen recordings and phone videos are large: they slow pages down and bump into upload limits. WebM packs the same quality into a much smaller file and is a web standard you can drop straight into a web page; MP4 plays everywhere; and a short scene can become a GIF for a preview or social post. Pixly does all of this with your browser's hardware-accelerated WebCodecs engine, so unlike upload-based tools there are no queues and no size caps.",
    safeBody:
      "Yes. Videos are converted locally with your browser's own media engine, so your files never touch a server — nothing is uploaded, logged, or stored. Video conversion works best in a recent version of Chrome or Edge; some browsers still have limited support.",
  };
}
