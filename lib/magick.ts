// ImageMagick (WebAssembly) engine for formats the Canvas API can't handle:
// TIFF, ICO, TGA, PSD, plus encoding BMP/GIF. The ~14MB wasm is fetched only
// the first time an extended format is actually used, so common conversions
// stay lightweight and never touch this code path.

import type { Format } from "./conversions";
import type { MagickFormat } from "@imagemagick/magick-wasm";

// Our target slug -> ImageMagick output format string (MagickFormat values).
const MAGICK_OUT: Partial<Record<Format, string>> = {
  jpg: "JPEG",
  png: "PNG",
  webp: "WEBP",
  bmp: "BMP",
  gif: "GIF",
  tiff: "TIFF",
  ico: "ICO",
  tga: "TGA",
};

const OUT_MIME: Partial<Record<Format, string>> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  bmp: "image/bmp",
  gif: "image/gif",
  tiff: "image/tiff",
  ico: "image/x-icon",
  tga: "image/x-tga",
};

// Source format hint. Some formats (notably TGA and ICO) have no reliable magic
// bytes, so ImageMagick can't auto-detect them from raw data — we tell it.
const MAGICK_IN: Partial<Record<Format, string>> = {
  png: "PNG",
  jpg: "JPG",
  webp: "WEBP",
  gif: "GIF",
  bmp: "BMP",
  avif: "AVIF",
  heic: "HEIC",
  tiff: "TIFF",
  ico: "ICO",
  tga: "TGA",
  psd: "PSD",
};

let initPromise: Promise<void> | null = null;

async function ensureMagick(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const { initializeImageMagick } = await import("@imagemagick/magick-wasm");
      // Self-hosted wasm in /public; fetched lazily on first extended conversion.
      await initializeImageMagick(new URL("/magick.wasm", window.location.origin));
    })();
  }
  return initPromise;
}

export async function convertWithMagick(
  file: File,
  target: Format,
  quality?: number,
  source?: Format | null,
): Promise<Blob> {
  const outFmt = MAGICK_OUT[target];
  if (!outFmt) throw new Error(`${target.toUpperCase()} output is not supported.`);

  await ensureMagick();
  const { ImageMagick } = await import("@imagemagick/magick-wasm");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const inFmt = source ? MAGICK_IN[source] : undefined;

  return new Promise<Blob>((resolve, reject) => {
    const onImage = (image: {
      quality: number;
      write: (fmt: MagickFormat, cb: (data: Uint8Array) => void) => void;
    }) => {
      if (quality != null) image.quality = Math.round(quality * 100);
      image.write(outFmt as MagickFormat, (data) => {
        // Copy out of wasm memory before it's reclaimed.
        resolve(
          new Blob([data.slice()], {
            type: OUT_MIME[target] ?? "application/octet-stream",
          }),
        );
      });
    };
    try {
      if (inFmt) {
        ImageMagick.read(bytes, inFmt as MagickFormat, onImage);
      } else {
        ImageMagick.read(bytes, onImage);
      }
    } catch (e) {
      reject(
        e instanceof Error ? e : new Error("ImageMagick conversion failed."),
      );
    }
  });
}
