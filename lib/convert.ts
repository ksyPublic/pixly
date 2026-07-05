// Client-side image conversion. Everything here runs in the browser —
// nothing is ever uploaded. Uses the Canvas API for encoding and heic2any
// (lazy-loaded WASM) to decode Apple HEIC/HEIF.

import type { Format, ResizeOption } from "./conversions";
import {
  FORMATS,
  detectFormat,
  computeTargetSize,
  normalizeHexColor,
} from "./conversions";
import { convertWithMagick } from "./magick";

export interface ConvertOptions {
  /** 0..1, only used by lossy encoders (JPG/WebP) */
  quality?: number;
  /** Resize the output. Omitted or `{mode:"none"}` keeps the source size. */
  resize?: ResizeOption;
  /** Hex fill for transparent areas when the target has no alpha (e.g.
   *  PNG→JPG). Defaults to white. Ignored by alpha-capable targets. */
  background?: string;
  /** Honor the source's EXIF orientation flag. Defaults to true, so a photo
   *  shot in portrait on a phone doesn't come out sideways. */
  autoOrient?: boolean;
  /** Remove EXIF, GPS location, ICC profiles and comments from the output.
   *  Defaults to true. Canvas re-encoding always drops metadata anyway; this
   *  flag additionally drives the ImageMagick engine's strip so magick-encoded
   *  formats (TIFF/GIF/BMP/…) match the same clean-output behavior. */
  stripMetadata?: boolean;
  /** Encode WebP with no quality loss (webp target only). Routed through the
   *  ImageMagick engine because the browser's Canvas WebP encoder is always
   *  lossy — there's no lossless flag on canvas.toBlob. */
  lossless?: boolean;
}

// What the fast Canvas path can handle. Anything outside these sets is routed
// to the ImageMagick engine.
const CANVAS_DECODE = new Set<Format>(["png", "jpg", "webp", "gif", "bmp", "avif"]);
const CANVAS_ENCODE = new Set<Format>(["jpg", "png", "webp"]);

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export async function decodeToBitmap(
  file: File,
  autoOrient = true,
): Promise<ImageBitmap> {
  let blob: Blob = file;
  if (isHeic(file)) {
    // Browsers (except Safari) can't decode HEIC natively. Lazy-import the
    // WASM decoder so its weight only loads when a HEIC file is actually used.
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/png" });
    blob = Array.isArray(out) ? out[0] : out;
  }
  // "from-image" bakes in the EXIF orientation JPEGs from phones carry;
  // "none" leaves pixels as authored. (HEIC is already upright post-heic2any.)
  return createImageBitmap(blob, {
    imageOrientation: autoOrient ? "from-image" : "none",
  });
}

/** Decode ANY supported source to a bitmap. Formats the Canvas can't decode
 *  (TIFF/PSD/ICO/TGA) are transcoded to a lossless PNG through the ImageMagick
 *  engine first, so callers like target-size compression work for every input
 *  format — not just the Canvas-decodable ones. */
export async function decodeAnyToBitmap(
  file: File,
  source: Format | null,
  autoOrient = true,
): Promise<ImageBitmap> {
  const canvasDecodable =
    isHeic(file) || (source != null && CANVAS_DECODE.has(source));
  if (canvasDecodable) return decodeToBitmap(file, autoOrient);
  const png = await convertWithMagick(file, "png", undefined, source, {
    autoOrient,
  });
  return createImageBitmap(png);
}

export async function convertImage(
  file: File,
  target: Format,
  opts: ConvertOptions = {},
): Promise<Blob> {
  if (!FORMATS[target]?.output) {
    throw new Error(`${target.toUpperCase()} is not a supported output format.`);
  }

  // Route to ImageMagick unless both sides fit the fast Canvas path. Lossless
  // WebP also forces the magick path, since canvas.toBlob can't encode it.
  const source = detectFormat(file);
  const canvasCanDecode = isHeic(file) || (source != null && CANVAS_DECODE.has(source));
  const losslessWebp = target === "webp" && !!opts.lossless;
  if (losslessWebp || !(CANVAS_ENCODE.has(target) && canvasCanDecode)) {
    return convertWithMagick(file, target, opts.quality, source, {
      resize: opts.resize,
      background: opts.background,
      autoOrient: opts.autoOrient,
      stripMetadata: opts.stripMetadata,
      lossless: opts.lossless,
    });
  }

  return convertViaCanvas(file, target, opts);
}

async function convertViaCanvas(
  file: File,
  target: Format,
  opts: ConvertOptions,
): Promise<Blob> {
  const bitmap = await decodeToBitmap(file, opts.autoOrient ?? true);
  try {
    return await encodeBitmapToBlob(
      bitmap,
      target,
      opts.quality,
      opts.resize,
      opts.background,
    );
  } finally {
    bitmap.close?.();
  }
}

/** Encode an already-decoded bitmap to a target format via <canvas>.
 *  Kept separate so callers (e.g. target-size compression) can decode once
 *  and re-encode many times without paying to decode each pass. */
export async function encodeBitmapToBlob(
  bitmap: ImageBitmap,
  target: Format,
  quality?: number,
  resize?: ResizeOption,
  background?: string,
): Promise<Blob> {
  const info = FORMATS[target];
  if (!info.encodeMime) {
    throw new Error(`${info.label} cannot be encoded via canvas.`);
  }
  const { width, height } = computeTargetSize(bitmap.width, bitmap.height, resize);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  // JPEG has no alpha channel — flatten transparency onto a solid color so
  // PNGs with transparency don't come out with black backgrounds. The color is
  // configurable and defaults to white.
  if (info.encodeMime === "image/jpeg") {
    ctx.fillStyle = normalizeHexColor(background) ?? "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const q = info.lossy ? (quality ?? 0.92) : undefined;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, info.encodeMime as string, q),
  );
  if (!blob) throw new Error(`Your browser could not encode ${info.label}.`);
  return blob;
}

export function outputFilename(inputName: string, target: Format): string {
  const base = inputName.replace(/\.[^./\\]+$/, "");
  return `${base || "image"}.${target}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
