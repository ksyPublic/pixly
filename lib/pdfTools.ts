// Data model for the four PDF-tool landing pages. Each entry drives a static
// SEO page (app/<slug>/page.tsx) rendered by components/PdfToolLanding.tsx —
// the copy here is the single source of truth for both the visible content and
// the JSON-LD (HowTo), so structured data can never drift from the page. The
// pages render default-Korean static HTML (see lib/i18n.ts), so the
// emitted metadata + JSON-LD use the Korean copy; English stays available via
// the language toggle (the client PdfToolContent reads copy[locale]).

import type { HowToStep } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";

export type PdfToolEngine =
  | { kind: "images-to-pdf"; source: "jpg" | "png" }
  | { kind: "pdf-to-images"; format: "jpg" | "png" };

/** The visible + schema copy for one tool, in one language. */
export interface PdfToolCopy {
  /** WebApplication schema name. */
  appName: string;
  h1: string;
  intro: string;
  howToTitle: string;
  howToSteps: HowToStep[];
  whyHeading: string;
  whyBody: string;
  /** "Is it safe?" answer — shown under the safe heading. */
  safeBody: string;
}

export interface PdfTool {
  slug: string;
  /** Emitted <title>/description — Korean, to match the indexed page. */
  metaTitle: string;
  metaDescription: string;
  /** English metadata, kept for reference (not emitted while ko-first). */
  metaTitleEn: string;
  metaDescriptionEn: string;
  /** Slugs to cross-link (other PDF tools + a couple of converters). */
  related: string[];
  engine: PdfToolEngine;
  copy: Record<Locale, PdfToolCopy>;
}

export const PDF_TOOLS: Record<string, PdfTool> = {
  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    metaTitle: "JPG를 PDF로 변환 — 이미지 합치기 무료, 업로드 없음 | Pixly",
    metaDescription:
      "JPG 이미지를 브라우저에서 하나의 PDF로 무료로 합치세요. 페이지 순서를 바꾸고, 이미지에 맞춤·A4·레터 크기를 골라 저장하세요. 업로드도 회원가입도 없고, 파일은 기기 밖으로 나가지 않아요.",
    metaTitleEn:
      "JPG to PDF — Convert & Combine Images to PDF Free, No Upload | Pixly",
    metaDescriptionEn:
      "Combine JPG images into a single PDF for free, right in your browser. Reorder pages, pick fit-to-image, A4 or Letter, and download — no upload, no sign-up, your files never leave your device.",
    related: ["png-to-pdf", "pdf-to-jpg", "pdf-to-png", "jpg-to-png", "heic-to-jpg"],
    engine: { kind: "images-to-pdf", source: "jpg" },
    copy: {
      ko: {
        appName: "Pixly JPG → PDF 변환기",
        h1: "JPG를 PDF로",
        intro:
          "브라우저 안에서 처리되는 무료 JPG → PDF 변환이에요. JPG 이미지 한 장 또는 여러 장을 하나의 PDF로 합치고, 페이지 순서를 바꿔 저장하세요. 이미지는 서버에 올라가지 않아요.",
        howToTitle: "JPG를 PDF로 변환하는 방법",
        howToSteps: [
          {
            name: "JPG 이미지 추가",
            text: "위 상자에 JPG 이미지를 끌어다 놓거나 클릭해서 선택하세요. 원하는 만큼 추가할 수 있어요.",
          },
          {
            name: "순서와 페이지 크기 설정",
            text: "화살표로 페이지 순서를 바꾼 뒤, 이미지에 맞춤·A4·레터 중에서 고르고 여백도 선택하세요.",
          },
          {
            name: "만들고 다운로드",
            text: "PDF 만들기를 누르면 Pixly가 브라우저 안에서 파일을 만들어요. 그런 다음 PDF를 내려받으세요.",
          },
        ],
        whyHeading: "JPG를 왜 PDF로 합치나요?",
        whyBody:
          "PDF는 여러 사진을 하나의 깔끔한 파일로 묶어 어떤 기기에서든 똑같이 열려요. 영수증을 메일로 보내거나, 사진 묶음을 공유하거나, 서류를 제출할 때 안성맞춤이죠. 낱장 JPG와 달리 PDF는 순서를 그대로 유지하고 인쇄도 예상대로 돼요. Pixly는 기기 안에서 바로 만들기 때문에 많은 장이라도 순식간에, 완전히 비공개로 처리돼요.",
        safeBody:
          "네. JPG 이미지를 PDF로 합치는 과정은 전적으로 브라우저 안에서 이뤄져요. 아무것도 업로드·기록·저장되지 않고, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
      },
      en: {
        appName: "Pixly JPG to PDF Converter",
        h1: "JPG to PDF",
        intro:
          "Free JPG to PDF conversion that runs entirely in your browser. Combine one or many JPG images into a single PDF, reorder the pages, and save — your images are never uploaded to a server.",
        howToTitle: "How to convert JPG to PDF",
        howToSteps: [
          {
            name: "Add your JPG images",
            text: "Drop your JPG images into the box above, or click to browse. Add as many as you like.",
          },
          {
            name: "Arrange and set the page size",
            text: "Reorder the pages with the arrows, then choose fit-to-image, A4, or Letter with an optional margin.",
          },
          {
            name: "Create and download",
            text: "Click Create PDF and Pixly builds the file right in your browser — then download your PDF.",
          },
        ],
        whyHeading: "Why convert JPG to PDF?",
        whyBody:
          "A PDF bundles many photos into one tidy file that opens the same on every device — ideal for emailing receipts, sharing a photo set, or submitting documents. Unlike loose JPGs, a PDF keeps your images in order and prints predictably. Pixly builds it locally, so even large batches are instant and completely private.",
        safeBody:
          "Yes. Your JPG images are combined into a PDF entirely in your browser — nothing is uploaded, logged, or stored. It even works offline once the page has loaded.",
      },
    },
  },

  "png-to-pdf": {
    slug: "png-to-pdf",
    metaTitle: "PNG를 PDF로 변환 — 이미지 합치기 무료, 업로드 없음 | Pixly",
    metaDescription:
      "PNG 이미지를 브라우저에서 하나의 PDF로 무료로 합치세요. 페이지 순서를 바꾸고, 이미지에 맞춤·A4·레터 크기를 골라 저장하세요. 업로드도 회원가입도 없고, 파일은 기기 밖으로 나가지 않아요.",
    metaTitleEn:
      "PNG to PDF — Convert & Combine PNG Images to PDF Free, No Upload | Pixly",
    metaDescriptionEn:
      "Combine PNG images into a single PDF for free, right in your browser. Reorder pages, pick fit-to-image, A4 or Letter, and download — no upload, no sign-up, your files never leave your device.",
    related: ["jpg-to-pdf", "pdf-to-png", "pdf-to-jpg", "png-to-jpg", "png-to-webp"],
    engine: { kind: "images-to-pdf", source: "png" },
    copy: {
      ko: {
        appName: "Pixly PNG → PDF 변환기",
        h1: "PNG를 PDF로",
        intro:
          "브라우저 안에서 처리되는 무료 PNG → PDF 변환이에요. PNG 이미지 한 장 또는 여러 장을 하나의 PDF로 합치고, 페이지 순서를 바꿔 저장하세요. 이미지는 서버에 올라가지 않아요.",
        howToTitle: "PNG를 PDF로 변환하는 방법",
        howToSteps: [
          {
            name: "PNG 이미지 추가",
            text: "위 상자에 PNG 이미지를 끌어다 놓거나 클릭해서 선택하세요. 원하는 만큼 추가할 수 있어요.",
          },
          {
            name: "순서와 페이지 크기 설정",
            text: "화살표로 페이지 순서를 바꾼 뒤, 이미지에 맞춤·A4·레터 중에서 고르고 여백도 선택하세요.",
          },
          {
            name: "만들고 다운로드",
            text: "PDF 만들기를 누르면 Pixly가 브라우저 안에서 파일을 만들어요. 그런 다음 PDF를 내려받으세요.",
          },
        ],
        whyHeading: "PNG를 왜 PDF로 합치나요?",
        whyBody:
          "PNG는 스크린샷이나 도표, 가장자리가 또렷한 그래픽에 좋지만 PNG 여러 장이 든 폴더는 공유하기 번거로워요. PDF로 묶으면 어디서나 똑같이 열리고 깔끔하게 인쇄되는 하나의 파일이 돼요. Pixly는 기기 안에서 원본 화질 그대로 합치기 때문에 다시 압축되지도 않고, 아무것도 기기 밖으로 나가지 않아요.",
        safeBody:
          "네. PNG 이미지를 PDF로 합치는 과정은 전적으로 브라우저 안에서 이뤄져요. 아무것도 업로드·기록·저장되지 않고, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
      },
      en: {
        appName: "Pixly PNG to PDF Converter",
        h1: "PNG to PDF",
        intro:
          "Free PNG to PDF conversion that runs entirely in your browser. Combine one or many PNG images into a single PDF, reorder the pages, and save — your images are never uploaded to a server.",
        howToTitle: "How to convert PNG to PDF",
        howToSteps: [
          {
            name: "Add your PNG images",
            text: "Drop your PNG images into the box above, or click to browse. Add as many as you like.",
          },
          {
            name: "Arrange and set the page size",
            text: "Reorder the pages with the arrows, then choose fit-to-image, A4, or Letter with an optional margin.",
          },
          {
            name: "Create and download",
            text: "Click Create PDF and Pixly builds the file right in your browser — then download your PDF.",
          },
        ],
        whyHeading: "Why convert PNG to PDF?",
        whyBody:
          "PNG is great for screenshots, diagrams, and graphics with crisp edges, but a folder of PNGs is awkward to share. Wrapping them in a PDF gives you one portable file that opens identically everywhere and prints cleanly. Pixly combines them locally at full quality, so nothing is re-compressed and nothing leaves your device.",
        safeBody:
          "Yes. Your PNG images are combined into a PDF entirely in your browser — nothing is uploaded, logged, or stored. It even works offline once the page has loaded.",
      },
    },
  },

  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    metaTitle: "PDF를 JPG로 변환 — 페이지를 이미지로 무료, 업로드 없음 | Pixly",
    metaDescription:
      "PDF의 각 페이지를 브라우저에서 JPG 이미지로 무료로 변환하세요. 페이지를 한 장씩, 또는 전체를 .zip으로 한 번에 내려받을 수 있어요. 업로드도 회원가입도 없고, 파일은 기기 밖으로 나가지 않아요.",
    metaTitleEn:
      "PDF to JPG — Convert PDF Pages to JPG Images Free, No Upload | Pixly",
    metaDescriptionEn:
      "Convert each page of a PDF into a JPG image for free, right in your browser. Download pages individually or all at once as a .zip — no upload, no sign-up, your files never leave your device.",
    related: ["pdf-to-png", "jpg-to-pdf", "png-to-pdf", "jpg-to-png", "png-to-jpg"],
    engine: { kind: "pdf-to-images", format: "jpg" },
    copy: {
      ko: {
        appName: "Pixly PDF → JPG 변환기",
        h1: "PDF를 JPG로",
        intro:
          "브라우저 안에서 처리되는 무료 PDF → JPG 변환이에요. PDF의 모든 페이지가 JPG 이미지가 되어, 한 장씩 또는 전체를 .zip으로 한 번에 내려받을 수 있어요. 파일은 서버에 올라가지 않아요.",
        howToTitle: "PDF를 JPG로 변환하는 방법",
        howToSteps: [
          {
            name: "PDF 추가",
            text: "위 상자에 PDF를 끌어다 놓거나 클릭해서 선택하세요.",
          },
          {
            name: "해상도 선택",
            text: "표준·고화질·최대 중에서 해상도를 고르고, 원하면 JPG 품질도 설정하세요.",
          },
          {
            name: "다운로드",
            text: "Pixly가 각 페이지를 브라우저 안에서 JPG로 변환해요. 한 장씩 내려받거나 전체를 .zip으로 받으세요.",
          },
        ],
        whyHeading: "PDF를 왜 JPG로 변환하나요?",
        whyBody:
          "JPG 이미지는 PDF 뷰어 없이도 슬라이드나 문서, 채팅, 웹사이트에 바로 넣을 수 있어요. PDF 페이지를 이미지로 바꾸면 썸네일이나 미리보기를 만들거나, 한 페이지만 공유하거나, 문서에서 그림을 빼낼 때 편리하죠. Pixly는 원하는 해상도로 모든 페이지를 기기 안에서 변환하기 때문에 빠르고, 아무것도 기기 밖으로 나가지 않아요.",
        safeBody:
          "네. PDF를 JPG 이미지로 변환하는 과정은 전적으로 브라우저 안에서 이뤄져요. 아무것도 업로드·기록·저장되지 않고, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
      },
      en: {
        appName: "Pixly PDF to JPG Converter",
        h1: "PDF to JPG",
        intro:
          "Free PDF to JPG conversion that runs entirely in your browser. Every page of your PDF becomes a JPG image you can download one by one or all at once as a .zip — your file is never uploaded to a server.",
        howToTitle: "How to convert PDF to JPG",
        howToSteps: [
          {
            name: "Add your PDF",
            text: "Drop your PDF into the box above, or click to browse.",
          },
          {
            name: "Pick a resolution",
            text: "Choose Standard, High, or Max resolution, and set the JPG quality if you like.",
          },
          {
            name: "Download",
            text: "Pixly renders each page to a JPG in your browser — download them individually or grab them all as a .zip.",
          },
        ],
        whyHeading: "Why convert PDF to JPG?",
        whyBody:
          "JPG images drop straight into slides, documents, chats, and websites — no PDF reader required. Turning PDF pages into images is handy for thumbnails, previews, sharing a single page, or pulling artwork out of a document. Pixly renders every page locally at the resolution you choose, so it's fast and nothing leaves your device.",
        safeBody:
          "Yes. Your PDF is rendered to JPG images entirely in your browser — nothing is uploaded, logged, or stored. It even works offline once the page has loaded.",
      },
    },
  },

  "pdf-to-png": {
    slug: "pdf-to-png",
    metaTitle: "PDF를 PNG로 변환 — 페이지를 이미지로 무료, 업로드 없음 | Pixly",
    metaDescription:
      "PDF의 각 페이지를 브라우저에서 손실 없는 PNG 이미지로 무료로 변환하세요. 페이지를 한 장씩, 또는 전체를 .zip으로 한 번에 내려받을 수 있어요. 업로드도 회원가입도 없고, 파일은 기기 밖으로 나가지 않아요.",
    metaTitleEn:
      "PDF to PNG — Convert PDF Pages to PNG Images Free, No Upload | Pixly",
    metaDescriptionEn:
      "Convert each page of a PDF into a lossless PNG image for free, right in your browser. Download pages individually or all at once as a .zip — no upload, no sign-up, your files never leave your device.",
    related: ["pdf-to-jpg", "png-to-pdf", "jpg-to-pdf", "png-to-jpg", "png-to-webp"],
    engine: { kind: "pdf-to-images", format: "png" },
    copy: {
      ko: {
        appName: "Pixly PDF → PNG 변환기",
        h1: "PDF를 PNG로",
        intro:
          "브라우저 안에서 처리되는 무료 PDF → PNG 변환이에요. PDF의 모든 페이지가 또렷한 무손실 PNG가 되어, 한 장씩 또는 전체를 .zip으로 한 번에 내려받을 수 있어요. 파일은 서버에 올라가지 않아요.",
        howToTitle: "PDF를 PNG로 변환하는 방법",
        howToSteps: [
          {
            name: "PDF 추가",
            text: "위 상자에 PDF를 끌어다 놓거나 클릭해서 선택하세요.",
          },
          {
            name: "해상도 선택",
            text: "변환할 페이지의 해상도를 표준·고화질·최대 중에서 고르세요.",
          },
          {
            name: "다운로드",
            text: "Pixly가 각 페이지를 브라우저 안에서 PNG로 변환해요. 한 장씩 내려받거나 전체를 .zip으로 받으세요.",
          },
        ],
        whyHeading: "PDF를 왜 PNG로 변환하나요?",
        whyBody:
          "PNG는 무손실이라 텍스트와 선이 JPG 특유의 뭉개짐 없이 또렷하게 유지돼요. 도표나 스크린샷, 나중에 자르거나 편집할 페이지에 딱 좋죠. PDF 페이지를 PNG로 변환하면 어디에 붙여 넣어도 깔끔한 이미지를 얻을 수 있어요. Pixly는 원하는 해상도로 모든 페이지를 기기 안에서 변환하기 때문에 빠르고, 아무것도 기기 밖으로 나가지 않아요.",
        safeBody:
          "네. PDF를 PNG 이미지로 변환하는 과정은 전적으로 브라우저 안에서 이뤄져요. 아무것도 업로드·기록·저장되지 않고, 페이지를 한 번 열어두면 인터넷이 끊겨도 동작해요.",
      },
      en: {
        appName: "Pixly PDF to PNG Converter",
        h1: "PDF to PNG",
        intro:
          "Free PDF to PNG conversion that runs entirely in your browser. Every page of your PDF becomes a crisp, lossless PNG you can download one by one or all at once as a .zip — your file is never uploaded to a server.",
        howToTitle: "How to convert PDF to PNG",
        howToSteps: [
          {
            name: "Add your PDF",
            text: "Drop your PDF into the box above, or click to browse.",
          },
          {
            name: "Pick a resolution",
            text: "Choose Standard, High, or Max resolution for the rendered pages.",
          },
          {
            name: "Download",
            text: "Pixly renders each page to a PNG in your browser — download them individually or grab them all as a .zip.",
          },
        ],
        whyHeading: "Why convert PDF to PNG?",
        whyBody:
          "PNG is lossless, so text and line art stay razor-sharp with no JPG blockiness — perfect for diagrams, screenshots, and pages you'll crop or edit later. Rendering PDF pages to PNG gives you clean images that paste anywhere. Pixly renders every page locally at the resolution you choose, so it's fast and nothing leaves your device.",
        safeBody:
          "Yes. Your PDF is rendered to PNG images entirely in your browser — nothing is uploaded, logged, or stored. It even works offline once the page has loaded.",
      },
    },
  },
};

export const PDF_TOOL_SLUGS = Object.keys(PDF_TOOLS);
