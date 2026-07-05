// ImageMagick (WebAssembly) engine for formats the Canvas API can't handle:
// TIFF, ICO, TGA, PSD, plus encoding BMP/GIF. The ~14MB wasm is fetched only
// the first time an extended format is actually used, so common conversions
// stay lightweight and never touch this code path.

import type { Format, ResizeOption } from "./conversions";
import { computeTargetSize, normalizeHexColor } from "./conversions";
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

/** Output shaping shared with the Canvas engine. */
export interface MagickOptions {
  resize?: ResizeOption;
  background?: string;
  autoOrient?: boolean;
  /** Strip EXIF/GPS/ICC profiles and comments from the output. Default true. */
  stripMetadata?: boolean;
  /** WebP only: encode losslessly instead of the quality-driven lossy path. */
  lossless?: boolean;
}

// Only the methods we actually drive on the decoded image. Structural typing
// keeps us decoupled from the exact exported interface name across versions.
interface MagickImg {
  width: number;
  height: number;
  hasAlpha: boolean;
  quality: number;
  autoOrient(): void;
  resize(width: number, height: number): void;
  colorAlpha(color: unknown): void;
  strip(): void;
  readonly settings: {
    setDefine(format: MagickFormat, name: string, value: boolean): void;
  };
  write(format: MagickFormat, cb: (data: Uint8Array) => void): void;
}

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
  opts: MagickOptions = {},
): Promise<Blob> {
  const outFmt = MAGICK_OUT[target];
  if (!outFmt) throw new Error(`${target.toUpperCase()} output is not supported.`);

  await ensureMagick();
  const { ImageMagick, MagickColor } = await import("@imagemagick/magick-wasm");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const inFmt = source ? MAGICK_IN[source] : undefined;

  return new Promise<Blob>((resolve, reject) => {
    const onImage = (image: MagickImg) => {
      try {
        // Orient first so any resize below operates on upright pixels.
        if (opts.autoOrient !== false) {
          try {
            image.autoOrient();
          } catch {
            // Not every format carries EXIF orientation — ignore.
          }
        }
        if (opts.resize && opts.resize.mode !== "none") {
          const { width, height } = computeTargetSize(
            image.width,
            image.height,
            opts.resize,
          );
          image.resize(width, height);
        }
        // JPEG can't store alpha — composite transparent pixels over the
        // background color (defaults to white) instead of dropping to black.
        if (target === "jpg" && image.hasAlpha) {
          try {
            image.colorAlpha(
              new MagickColor(normalizeHexColor(opts.background) ?? "#ffffff"),
            );
          } catch {
            // Best effort; fall through to the default write.
          }
        }
        // WebP lossless: flip the coder into lossless mode. The quality value
        // then acts as the compression effort rather than a visual-quality knob.
        if (target === "webp" && opts.lossless) {
          try {
            image.settings.setDefine("WEBP" as MagickFormat, "lossless", true);
          } catch {
            // Older wasm builds may not expose the define — fall through lossy.
          }
        }
        // Drop metadata last (after autoOrient has consumed the EXIF orientation
        // and any resize/flatten is done) so nothing re-introduces a profile.
        if (opts.stripMetadata !== false) {
          try {
            image.strip();
          } catch {
            // Best effort — not every image carries a profile to strip.
          }
        }
        if (quality != null) image.quality = Math.round(quality * 100);
        image.write(outFmt as MagickFormat, (data) => {
          // Copy out of wasm memory before it's reclaimed.
          resolve(
            new Blob([data.slice()], {
              type: OUT_MIME[target] ?? "application/octet-stream",
            }),
          );
        });
      } catch (e) {
        reject(
          e instanceof Error ? e : new Error("ImageMagick conversion failed."),
        );
      }
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
