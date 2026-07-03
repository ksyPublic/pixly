// Client-side image conversion. Everything here runs in the browser —
// nothing is ever uploaded. Uses the Canvas API for encoding and heic2any
// (lazy-loaded WASM) to decode Apple HEIC/HEIF.

import type { Format } from "./conversions";
import { FORMATS, detectFormat } from "./conversions";
import { convertWithMagick } from "./magick";

export interface ConvertOptions {
  /** 0..1, only used by lossy encoders (JPG/WebP) */
  quality?: number;
}

// What the fast Canvas path can handle. Anything outside these sets is routed
// to the ImageMagick engine.
const CANVAS_DECODE = new Set<Format>(["png", "jpg", "webp", "gif", "bmp", "avif"]);
const CANVAS_ENCODE = new Set<Format>(["jpg", "png", "webp"]);

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  let blob: Blob = file;
  if (isHeic(file)) {
    // Browsers (except Safari) can't decode HEIC natively. Lazy-import the
    // WASM decoder so its weight only loads when a HEIC file is actually used.
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/png" });
    blob = Array.isArray(out) ? out[0] : out;
  }
  return createImageBitmap(blob);
}

/** Decode ANY supported source to a bitmap. Formats the Canvas can't decode
 *  (TIFF/PSD/ICO/TGA) are transcoded to a lossless PNG through the ImageMagick
 *  engine first, so callers like target-size compression work for every input
 *  format — not just the Canvas-decodable ones. */
export async function decodeAnyToBitmap(
  file: File,
  source: Format | null,
): Promise<ImageBitmap> {
  const canvasDecodable =
    isHeic(file) || (source != null && CANVAS_DECODE.has(source));
  if (canvasDecodable) return decodeToBitmap(file);
  const png = await convertWithMagick(file, "png", undefined, source);
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

  // Route to ImageMagick unless both sides fit the fast Canvas path.
  const source = detectFormat(file);
  const canvasCanDecode = isHeic(file) || (source != null && CANVAS_DECODE.has(source));
  if (!(CANVAS_ENCODE.has(target) && canvasCanDecode)) {
    return convertWithMagick(file, target, opts.quality, source);
  }

  return convertViaCanvas(file, target, opts);
}

async function convertViaCanvas(
  file: File,
  target: Format,
  opts: ConvertOptions,
): Promise<Blob> {
  const bitmap = await decodeToBitmap(file);
  try {
    return await encodeBitmapToBlob(bitmap, target, opts.quality);
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
): Promise<Blob> {
  const info = FORMATS[target];
  if (!info.encodeMime) {
    throw new Error(`${info.label} cannot be encoded via canvas.`);
  }
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  // JPEG has no alpha channel — flatten transparency onto white so PNGs
  // with transparency don't come out with black backgrounds.
  if (info.encodeMime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);

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
