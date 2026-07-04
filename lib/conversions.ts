// Single source of truth for every conversion the site supports.
// Add an entry here and a new SEO landing page (/from-to-to) is generated
// automatically at build time via app/[slug]/generateStaticParams.

import type { HowToStep } from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";

export type Format =
  | "heic"
  | "png"
  | "jpg"
  | "webp"
  | "avif"
  | "gif"
  | "bmp"
  | "tiff"
  | "ico"
  | "tga"
  | "psd";

export interface FormatInfo {
  /** URL/file extension slug */
  ext: Format;
  /** Human label shown in UI + copy */
  label: string;
  /** Canvas encode MIME, or null if this format can't be encoded via <canvas>
   *  (either input-only, or only encodable through the ImageMagick engine). */
  encodeMime: string | null;
  /** Accept attribute value(s) for the file picker */
  accept: string;
  /** Whether an encode-quality slider is meaningful */
  lossy: boolean;
  /** Can be a conversion source */
  input: boolean;
  /** Can be a conversion target (via canvas or the ImageMagick engine) */
  output: boolean;
}

export const FORMATS: Record<Format, FormatInfo> = {
  heic: {
    ext: "heic",
    label: "HEIC",
    encodeMime: null,
    accept: ".heic,.heif,image/heic,image/heif",
    lossy: true,
    input: true,
    output: false,
  },
  jpg: {
    ext: "jpg",
    label: "JPG",
    encodeMime: "image/jpeg",
    accept: ".jpg,.jpeg,image/jpeg",
    lossy: true,
    input: true,
    output: true,
  },
  png: {
    ext: "png",
    label: "PNG",
    encodeMime: "image/png",
    accept: ".png,image/png",
    lossy: false,
    input: true,
    output: true,
  },
  webp: {
    ext: "webp",
    label: "WebP",
    encodeMime: "image/webp",
    accept: ".webp,image/webp",
    lossy: true,
    input: true,
    output: true,
  },
  avif: {
    ext: "avif",
    label: "AVIF",
    encodeMime: null, // canvas AVIF encode is unreliable; input only
    accept: ".avif,image/avif",
    lossy: true,
    input: true,
    output: false,
  },
  // gif / bmp / tiff / ico / tga are encoded via the ImageMagick engine.
  gif: {
    ext: "gif",
    label: "GIF",
    encodeMime: null,
    accept: ".gif,image/gif",
    lossy: false,
    input: true,
    output: true,
  },
  bmp: {
    ext: "bmp",
    label: "BMP",
    encodeMime: null,
    accept: ".bmp,image/bmp",
    lossy: false,
    input: true,
    output: true,
  },
  tiff: {
    ext: "tiff",
    label: "TIFF",
    encodeMime: null,
    accept: ".tiff,.tif,image/tiff",
    lossy: false,
    input: true,
    output: true,
  },
  ico: {
    ext: "ico",
    label: "ICO",
    encodeMime: null,
    accept: ".ico,image/x-icon,image/vnd.microsoft.icon",
    lossy: false,
    input: true,
    output: true,
  },
  tga: {
    ext: "tga",
    label: "TGA",
    encodeMime: null,
    accept: ".tga,.tpic,image/x-tga,image/x-targa",
    lossy: false,
    input: true,
    output: true,
  },
  psd: {
    ext: "psd",
    label: "PSD",
    encodeMime: null, // Photoshop input only
    accept: ".psd,image/vnd.adobe.photoshop",
    lossy: false,
    input: true,
    output: false,
  },
};

export interface Conversion {
  from: Format;
  to: Format;
}

// The conversion pairs we ship. Order controls the homepage grid order.
export const CONVERSIONS: Conversion[] = [
  { from: "heic", to: "jpg" },
  { from: "heic", to: "png" },
  { from: "heic", to: "webp" },
  { from: "png", to: "jpg" },
  { from: "jpg", to: "png" },
  { from: "png", to: "webp" },
  { from: "webp", to: "png" },
  { from: "jpg", to: "webp" },
  { from: "webp", to: "jpg" },
  { from: "avif", to: "jpg" },
  { from: "avif", to: "png" },
  { from: "avif", to: "webp" },
  { from: "gif", to: "png" },
  { from: "gif", to: "jpg" },
  { from: "bmp", to: "jpg" },
  { from: "bmp", to: "png" },
  // ImageMagick-powered formats
  { from: "tiff", to: "jpg" },
  { from: "tiff", to: "png" },
  { from: "png", to: "tiff" },
  { from: "jpg", to: "tiff" },
  { from: "ico", to: "png" },
  { from: "png", to: "ico" },
  { from: "tga", to: "png" },
  { from: "psd", to: "png" },
  { from: "psd", to: "jpg" },
  { from: "png", to: "bmp" },
  { from: "png", to: "gif" },
];

// Formats that can be a conversion OUTPUT (i.e. we have an encoder for them).
export const OUTPUT_FORMATS: Format[] = (Object.keys(FORMATS) as Format[]).filter(
  (f) => FORMATS[f].output,
);

// Combined accept string covering every input format we can decode.
export const INPUT_ACCEPT = Array.from(
  new Set(
    (Object.keys(FORMATS) as Format[])
      .filter((f) => FORMATS[f].input)
      .flatMap((f) => FORMATS[f].accept.split(",")),
  ),
).join(",");

// Best-effort detection of a file's source format from its name/MIME type.
export function detectFormat(file: File): Format | null {
  const name = file.name.toLowerCase();
  for (const f of Object.keys(FORMATS) as Format[]) {
    const exts = FORMATS[f].accept
      .split(",")
      .filter((a) => a.startsWith("."));
    if (exts.some((e) => name.endsWith(e))) return f;
  }
  const type = file.type.toLowerCase();
  if (/jpe?g/.test(type)) return "jpg";
  if (/png/.test(type)) return "png";
  if (/webp/.test(type)) return "webp";
  if (/avif/.test(type)) return "avif";
  if (/gif/.test(type)) return "gif";
  if (/bmp/.test(type)) return "bmp";
  if (/heic|heif/.test(type)) return "heic";
  return null;
}

export function conversionSlug(c: Conversion): string {
  return `${c.from}-to-${c.to}`;
}

export function getConversionBySlug(slug: string): Conversion | undefined {
  return CONVERSIONS.find((c) => conversionSlug(c) === slug);
}

export function conversionTitle(c: Conversion): string {
  return `${FORMATS[c.from].label} to ${FORMATS[c.to].label}`;
}

/** Related-pill label. Korean uses an arrow to sidestep case particles that
 *  vary per (English) format label; English keeps the natural "X to Y". */
export function conversionRelatedTitle(c: Conversion, locale: Locale): string {
  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;
  return locale === "ko" ? `${from} → ${to}` : `${from} to ${to}`;
}

// ---------------------------------------------------------------------------
// Localized landing-page copy (converter detail pages).
//
// The detail pages render default-Korean static HTML (see lib/i18n.ts), so the
// emitted <title>/description AND the JSON-LD must be Korean to match what's
// indexed. generateMetadata + JSON-LD run server-side and can't call the client
// t(), so the schema-bound, per-pair prose (how-to steps, why-copy,
// app/breadcrumb names) lives HERE as locale-aware builders. The client
// ConversionContent calls them with the active locale; the server page calls
// them with "ko" — one source, so the structured data can never drift from the
// visible, default-Korean render. Pure UI chrome (trust badges, section
// headings) lives in lib/i18n.ts instead.
// ---------------------------------------------------------------------------

/** Page <title> — Korean, keyword-forward for search (matches the indexed page). */
export function metaTitle(c: Conversion): string {
  return `${FORMATS[c.from].label} ${FORMATS[c.to].label} 변환 — 무료, 업로드 없음 | Pixly`;
}

/** English page <title> — kept for reference; not emitted while the site is ko-first. */
export function metaTitleEn(c: Conversion): string {
  return `${conversionTitle(c)} Converter — Free, Private, No Upload | Pixly`;
}

/** Meta description — Korean, leads with the privacy differentiator. */
export function metaDescription(c: Conversion): string {
  const { from, to } = c;
  return `${FORMATS[from].label} 파일을 ${FORMATS[to].label} 형식으로 무료로 변환하세요. 100% 브라우저에서 처리되어 파일이 기기 밖으로 나가지 않아요. 업로드도, 회원가입도, 개수 제한도 없어요.`;
}

/** English meta description — kept for reference. */
export function metaDescriptionEn(c: Conversion): string {
  const { from, to } = c;
  return `Convert ${FORMATS[from].label} to ${FORMATS[to].label} online for free. Runs 100% in your browser — your files never leave your device. No upload, no sign-up, no limits.`;
}

/** WebApplication schema name / used on the page for the app identity. */
export function conversionAppName(c: Conversion, locale: Locale): string {
  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;
  return locale === "ko"
    ? `Pixly ${from} → ${to} 변환기`
    : `Pixly ${from} to ${to} Converter`;
}

/** Breadcrumb leaf name. */
export function conversionBreadcrumbName(c: Conversion, locale: Locale): string {
  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;
  return locale === "ko" ? `${from} → ${to} 변환기` : `${from} to ${to} Converter`;
}

/** "How to convert …" heading — also the HowTo schema name (kept identical). */
export function conversionHowToTitle(c: Conversion, locale: Locale): string {
  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;
  return locale === "ko"
    ? `${from} → ${to} 변환 방법`
    : `How to convert ${from} to ${to}`;
}

/** The 3 how-to steps — visible list text mirrors the HowTo structured data. */
export function conversionHowToSteps(c: Conversion, locale: Locale): HowToStep[] {
  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;
  if (locale === "ko") {
    return [
      {
        name: "파일 추가",
        text: `위 상자에 ${from} 파일을 끌어다 놓거나 클릭해서 선택하세요.`,
      },
      {
        name: "즉시 변환",
        text: `Pixly가 각 파일을 브라우저 안에서 곧바로 ${to} 형식으로 변환해요.`,
      },
      {
        name: "다운로드",
        text: `다운로드를 눌러 ${to} 파일을 저장하세요.`,
      },
    ];
  }
  return [
    {
      name: "Add your file",
      text: `Drop your ${from} file(s) into the box above, or click to browse.`,
    },
    {
      name: "Convert instantly",
      text: `Pixly converts each one to ${to} instantly, right in your browser.`,
    },
    {
      name: "Download",
      text: `Click Download to save the ${to} file.`,
    },
  ];
}

/** "Why convert X to Y?" body — a natural per-format explanation. */
export function whyCopy(from: string, to: string, locale: Locale): string {
  if (locale === "ko") return whyCopyKo(from, to);
  return whyCopyEn(from, to);
}

function whyCopyKo(from: string, to: string): string {
  switch (from) {
    case "HEIC":
      return `HEIC는 아이폰과 아이패드가 기본으로 쓰는 사진 형식이에요. 용량은 아끼지만 많은 앱과 웹사이트, 윈도우 PC에서는 열리지 않죠. ${to} 형식으로 바꾸면 어디서나 열리는 이미지가 되어 공유하거나 업로드하고, 편집하기도 편해요.`;
    case "AVIF":
      return `AVIF는 가장 최신이면서 효율이 뛰어난 이미지 형식이에요. 하지만 아직 지원이 따라오지 못해서 많은 앱과 편집기, 오래된 브라우저에서는 열리지 않아요. ${to} 형식으로 바꾸면 어디서나 열리는 파일이 돼요.`;
    case "GIF":
      return `GIF는 어디서나 열리지만 256색만 담을 수 있어 사진이 계단처럼 뭉개지고 용량도 커져요. 한 프레임을 ${to} 형식으로 바꾸면 색이 온전히 살아나고, JPG나 WebP라면 용량도 줄어들어요. 참고로 Pixly는 애니메이션이 아니라 첫 프레임만 내보내요.`;
    case "BMP":
      return `BMP는 압축을 하지 않아 필요 이상으로 커지는 형식이에요. 실제 필요한 용량보다 몇 배씩 큰 경우도 많죠. ${to} 형식으로 바꾸면 눈에 띄는 화질 저하 없이 용량을 크게 줄일 수 있어요.`;
    case "TIFF":
      return `TIFF는 인쇄, 스캔, 보관에 쓰이는 고화질 형식이지만 용량이 크고 대부분의 웹 앱이나 휴대폰에서는 표시되지 않아요. ${to} 형식으로 바꾸면 실제로 열어보고 공유할 수 있는 가벼운 이미지가 돼요.`;
    case "ICO":
      return `ICO는 윈도우의 아이콘 형식이에요. ${to} 형식으로 바꾸면 어디서나 열고 편집하고 올릴 수 있는 일반 이미지가 돼요.`;
    case "TGA":
      return `TGA(Targa)는 게임이나 3D 도구에서 쓰이지만 일상적인 앱과 브라우저에서는 잘 열리지 않아요. ${to} 형식으로 바꾸면 어디서나 쓸 수 있는 이미지가 돼요.`;
    case "PSD":
      return `PSD는 포토샵의 작업 파일 형식이에요. ${to} 형식으로 바꾸면 여러 레이어가 하나로 합쳐져, 포토샵 없이도 누구나 열 수 있는 이미지가 돼요.`;
  }
  if (to === "TIFF") {
    return `TIFF는 압축 손실 없이 이미지를 저장하기 때문에 인쇄소와 스캐너, 보관용으로 선호돼요. ${from} 형식을 TIFF 형식으로 바꾸면 화질 손실 없는 고품질 원본을 얻을 수 있어요.`;
  }
  if (to === "ICO") {
    return `ICO는 윈도우가 앱 아이콘과 파비콘에 쓰는 형식이에요. ${from} 형식을 ICO 형식으로 바꾸면 바로 쓸 수 있는 아이콘 파일이 돼요.`;
  }
  if (to === "WebP") {
    return `WebP는 비슷한 화질에서 ${from}보다 용량이 작아, 페이지가 더 빨리 열리고 데이터도 아껴요. 요즘 브라우저는 모두 WebP를 지원해요.`;
  }
  if (from === "WebP") {
    return `WebP는 웹에는 훌륭하지만 오래된 도구나 앱 중에는 지원하지 않는 경우가 있어요. ${to} 형식으로 바꾸면 어디서나 쓸 수 있는 형식이 돼요.`;
  }
  return `${from} 형식을 ${to} 형식으로 바꾸면 이미지의 저장 방식이 바뀌어 필요에 맞게 활용할 수 있어요. 호환성을 넓히거나, 용량을 줄이거나, 투명 배경을 살릴 수 있죠.`;
}

function whyCopyEn(from: string, to: string): string {
  switch (from) {
    case "HEIC":
      return `HEIC is Apple's default photo format on iPhone and iPad. It saves space, but many apps, websites, and Windows PCs can't open it. Converting to ${to} gives you a universally compatible image you can share, upload, or edit anywhere.`;
    case "AVIF":
      return `AVIF is one of the newest and most efficient image formats, but support is still catching up — plenty of apps, editors, and older browsers can't open it yet. Converting to ${to} gives you a file that opens everywhere.`;
    case "GIF":
      return `GIF works everywhere, but its 256-color palette makes photos look banded and inflates file size. Converting a frame to ${to} restores full color and, for JPG or WebP, cuts the size down. Note: Pixly exports the first frame, not the animation.`;
    case "BMP":
      return `BMP images are uncompressed, which makes them needlessly large — often many times bigger than they need to be. Converting to ${to} shrinks the file dramatically with no visible loss in quality.`;
    case "TIFF":
      return `TIFF is a high-quality format used in printing, scanning, and archiving, but it's bulky and most web apps and phones won't display it. Converting to ${to} gives you a smaller image you can actually view and share.`;
    case "ICO":
      return `ICO is the Windows icon format. Converting to ${to} turns it into a normal image you can open, edit, or post anywhere.`;
    case "TGA":
      return `TGA (Targa) shows up in games and 3D tools, but everyday apps and browsers rarely open it. Converting to ${to} makes the image work everywhere.`;
    case "PSD":
      return `PSD is Photoshop's working format. Converting to ${to} gives you a flattened image anyone can open without Photoshop — the layers are merged into one picture.`;
  }
  if (to === "TIFF") {
    return `TIFF stores images with no compression loss, which is why print shops, scanners, and archives prefer it. Converting ${from} to TIFF gives you a high-quality master copy.`;
  }
  if (to === "ICO") {
    return `ICO is the format Windows uses for app icons and favicons. Converting ${from} to ICO gives you a ready-to-use icon file.`;
  }
  if (to === "WebP") {
    return `WebP produces smaller files than ${from} at similar quality, which means faster-loading pages and less bandwidth. Every modern browser supports it.`;
  }
  if (from === "WebP") {
    return `WebP is great for the web, but some older tools and apps don't support it. Converting to ${to} gives you a format that works everywhere.`;
  }
  return `Converting ${from} to ${to} changes how the image is stored to fit your needs — broader compatibility, smaller file size, or transparency support.`;
}
