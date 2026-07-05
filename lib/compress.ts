// Target-size compression. Given a desired maximum file size, binary-search the
// encoder quality to land at the highest quality that still fits under the
// target. Runs 100% in the browser — decode once, re-encode many times.
//
// This is the feature paywalled/queued on server-based converters: here it's
// free and instant because there's no upload.

import type { Format, ResizeOption } from "./conversions";
import { detectFormat } from "./conversions";
import { decodeAnyToBitmap, encodeBitmapToBlob } from "./convert";

// Only fast, lossy canvas encoders support meaningful size targeting. PNG et al.
// are lossless (quality has no effect), so target-size mode is hidden for them.
export const TARGET_SIZE_FORMATS = new Set<Format>(["jpg", "webp"]);

export function supportsTargetSize(target: Format): boolean {
  return TARGET_SIZE_FORMATS.has(target);
}

export interface CompressResult {
  blob: Blob;
  /** The quality (0..1) that produced this blob. */
  quality: number;
  /** True if even the lowest quality still exceeded the target. */
  overTarget: boolean;
}

/** Output shaping shared with the plain converter — applied on every encode
 *  pass so the size target is measured on the final (resized/flattened) image. */
export interface CompressOptions {
  resize?: ResizeOption;
  background?: string;
  autoOrient?: boolean;
}

/** Encode `file` to `target`, aiming for the largest result ≤ targetBytes. */
export async function compressToTargetSize(
  file: File,
  target: Format,
  targetBytes: number,
  opts: CompressOptions = {},
): Promise<CompressResult> {
  // Route TIFF/PSD/ICO/TGA through the ImageMagick decode path so size mode
  // works for every input format the converter accepts, not just Canvas ones.
  const bitmap = await decodeAnyToBitmap(
    file,
    detectFormat(file),
    opts.autoOrient ?? true,
  );
  try {
    // If full quality already fits, no need to degrade anything.
    const full = await encodeBitmapToBlob(
      bitmap,
      target,
      1,
      opts.resize,
      opts.background,
    );
    if (full.size <= targetBytes) {
      return { blob: full, quality: 1, overTarget: false };
    }

    // Binary-search quality in (lo, hi]; keep the best blob that fits.
    let lo = 0.05;
    let hi = 1;
    let best: CompressResult | null = null;
    for (let i = 0; i < 8; i++) {
      const q = (lo + hi) / 2;
      const blob = await encodeBitmapToBlob(
        bitmap,
        target,
        q,
        opts.resize,
        opts.background,
      );
      if (blob.size <= targetBytes) {
        best = { blob, quality: q, overTarget: false };
        lo = q; // room to raise quality
      } else {
        hi = q; // must shrink further
      }
    }

    if (best) return best;

    // Even near-minimum quality overshoots — return the smallest we can make.
    const floor = await encodeBitmapToBlob(
      bitmap,
      target,
      0.05,
      opts.resize,
      opts.background,
    );
    return { blob: floor, quality: 0.05, overTarget: true };
  } finally {
    bitmap.close?.();
  }
}
