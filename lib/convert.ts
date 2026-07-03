// Client-side image conversion. Everything here runs in the browser —
// nothing is ever uploaded. Uses the Canvas API for encoding and heic2any
// (lazy-loaded WASM) to decode Apple HEIC/HEIF.

import type { Format } from "./conversions";
import { FORMATS } from "./conversions";

export interface ConvertOptions {
  /** 0..1, only used by lossy encoders (JPG/WebP) */
  quality?: number;
}

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
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

export async function convertImage(
  file: File,
  target: Format,
  opts: ConvertOptions = {},
): Promise<Blob> {
  const info = FORMATS[target];
  if (!info.encodeMime) {
    throw new Error(`${info.label} is not a supported output format.`);
  }

  const bitmap = await decodeToBitmap(file);
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
  bitmap.close?.();

  const quality = info.lossy ? (opts.quality ?? 0.92) : undefined;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, info.encodeMime as string, quality),
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
