// Single source of truth for every conversion the site supports.
// Add an entry here and a new SEO landing page (/from-to-to) is generated
// automatically at build time via app/[slug]/generateStaticParams.

export type Format = "heic" | "png" | "jpg" | "webp" | "avif" | "gif" | "bmp";

export interface FormatInfo {
  /** URL/file extension slug */
  ext: Format;
  /** Human label shown in UI + copy */
  label: string;
  /** Canvas encode MIME. `null` = decode-only (cannot be an output target). */
  encodeMime: string | null;
  /** Accept attribute value(s) for the file picker */
  accept: string;
  /** Whether an encode-quality slider is meaningful */
  lossy: boolean;
}

export const FORMATS: Record<Format, FormatInfo> = {
  heic: {
    ext: "heic",
    label: "HEIC",
    encodeMime: null, // browsers can't encode HEIC — input only
    accept: ".heic,.heif,image/heic,image/heif",
    lossy: true,
  },
  jpg: {
    ext: "jpg",
    label: "JPG",
    encodeMime: "image/jpeg",
    accept: ".jpg,.jpeg,image/jpeg",
    lossy: true,
  },
  png: {
    ext: "png",
    label: "PNG",
    encodeMime: "image/png",
    accept: ".png,image/png",
    lossy: false,
  },
  webp: {
    ext: "webp",
    label: "WebP",
    encodeMime: "image/webp",
    accept: ".webp,image/webp",
    lossy: true,
  },
  // Input-only formats: the browser can decode these but can't reliably
  // encode them, so they can only be a conversion source (encodeMime: null).
  avif: {
    ext: "avif",
    label: "AVIF",
    encodeMime: null,
    accept: ".avif,image/avif",
    lossy: true,
  },
  gif: {
    ext: "gif",
    label: "GIF",
    encodeMime: null,
    accept: ".gif,image/gif",
    lossy: false,
  },
  bmp: {
    ext: "bmp",
    label: "BMP",
    encodeMime: null,
    accept: ".bmp,image/bmp",
    lossy: false,
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
];

// Formats that can be a conversion OUTPUT (i.e. we have an encoder for them).
export const OUTPUT_FORMATS: Format[] = (Object.keys(FORMATS) as Format[]).filter(
  (f) => FORMATS[f].encodeMime !== null,
);

// Combined accept string covering every input format we can decode.
export const INPUT_ACCEPT = Array.from(
  new Set(
    (Object.keys(FORMATS) as Format[]).flatMap((f) =>
      FORMATS[f].accept.split(","),
    ),
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

/** Page <title> — keyword-forward for search. */
export function metaTitle(c: Conversion): string {
  return `${conversionTitle(c)} Converter — Free, Private, No Upload | Pixly`;
}

/** Meta description — leads with the privacy differentiator. */
export function metaDescription(c: Conversion): string {
  const { from, to } = c;
  return `Convert ${FORMATS[from].label} to ${FORMATS[to].label} online for free. Runs 100% in your browser — your files never leave your device. No upload, no sign-up, no limits.`;
}
