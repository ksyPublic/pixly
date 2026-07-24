// 100% client-side video conversion for the web.
//
// Built on WebCodecs via mediabunny — no server, no SharedArrayBuffer, no giant
// WASM bundle, so it works with Pixly's static export (Cloudflare) and needs no
// COOP/COEP headers. GIF output is produced by decoding frames with mediabunny
// and encoding them with gifenc, since GIF is not a WebCodecs codec.
//
// mediabunny and gifenc are DYNAMICALLY imported inside each function so they
// never enter the initial JS bundle and never run at build/SSR time — every
// entry point here is called from a browser event handler.

import { computeTargetSize, type ResizeOption } from "@/lib/conversions";
// Type-only import — erased at compile time, so it never pulls mediabunny into
// the bundle or runs at build/SSR (unlike the dynamic `import()` calls below).
import type { VideoCodec } from "mediabunny";

export type VideoTarget = "webm" | "mp4" | "gif";
export type VideoQuality = "low" | "medium" | "high";

export interface VideoProbe {
  durationSec: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export interface VideoOptions {
  target: VideoTarget;
  /** Encode quality for webm/mp4 (maps to a mediabunny Quality bitrate). */
  quality: VideoQuality;
  resize: ResizeOption;
  /** Frames per second for GIF output (ignored for webm/mp4). */
  fps: number;
}

export const VIDEO_TARGETS: VideoTarget[] = ["webm", "mp4", "gif"];

export const VIDEO_MIME: Record<VideoTarget, string> = {
  webm: "video/webm",
  mp4: "video/mp4",
  gif: "image/gif",
};

export const VIDEO_EXT: Record<VideoTarget, string> = {
  webm: "webm",
  mp4: "mp4",
  gif: "gif",
};

// GIF guardrails — GIFs balloon fast, so cap what we hand to the encoder.
export const GIF_MAX_DURATION = 30; // seconds encoded (anything longer is trimmed)
export const GIF_MAX_WIDTH = 800; // px; wider output is downscaled to this
export const GIF_DEFAULT_FPS = 12;

/** Whether this browser exposes WebCodecs' VideoEncoder at all. Older Safari and
 *  Firefox lack it, so webm/mp4 transcoding is impossible there. */
export function hasVideoEncoder(): boolean {
  return typeof window !== "undefined" && "VideoEncoder" in window;
}

/** Whether this browser can even decode video frames (needed for GIF too). */
export function hasVideoDecoder(): boolean {
  return typeof window !== "undefined" && "VideoDecoder" in window;
}

/** Encoders (and 4:2:0 chroma) want even dimensions; round down to the nearest. */
function even(n: number): number {
  return Math.max(2, n - (n % 2));
}

/** Read basic metadata: duration, display size, and whether audio is present. */
export async function probeVideo(file: File): Promise<VideoProbe> {
  const { Input, ALL_FORMATS, BlobSource } = await import("mediabunny");
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const [video, audio, durationSec] = await Promise.all([
    input.getPrimaryVideoTrack(),
    input.getPrimaryAudioTrack(),
    input.computeDuration(),
  ]);
  if (!video) throw new Error("no-video-track");
  const [width, height] = await Promise.all([
    video.getDisplayWidth(),
    video.getDisplayHeight(),
  ]);
  return {
    durationSec: Number.isFinite(durationSec) ? durationSec : 0,
    width,
    height,
    hasAudio: Boolean(audio),
  };
}

/** Which output formats this browser can actually produce for a given size.
 *  webm needs a VP9/VP8 encoder, mp4 needs an AVC (H.264) encoder; gif only
 *  needs a decoder since frames are encoded in JS. */
export async function getSupportedTargets(
  width: number,
  height: number,
): Promise<Record<VideoTarget, boolean>> {
  const { getFirstEncodableVideoCodec } = await import("mediabunny");
  const dims = { width: even(width), height: even(height) };
  const [webm, mp4] = await Promise.all([
    getFirstEncodableVideoCodec(["vp9", "vp8"], dims),
    getFirstEncodableVideoCodec(["avc"], dims),
  ]);
  return {
    webm: webm !== null,
    mp4: mp4 !== null,
    gif: hasVideoDecoder(),
  };
}

/** Convert a video file to the requested web format. `onProgress` receives a
 *  0..1 completion fraction. Throws on unsupported targets or missing tracks. */
export async function convertVideo(
  file: File,
  opts: VideoOptions,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  return opts.target === "gif"
    ? convertToGif(file, opts, onProgress)
    : transcode(file, opts, onProgress);
}

// --- webm / mp4 -----------------------------------------------------------

async function transcode(
  file: File,
  opts: VideoOptions,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const {
    Input,
    Output,
    Conversion,
    BufferTarget,
    ALL_FORMATS,
    BlobSource,
    WebMOutputFormat,
    Mp4OutputFormat,
    getFirstEncodableVideoCodec,
    QUALITY_LOW,
    QUALITY_MEDIUM,
    QUALITY_HIGH,
  } = await import("mediabunny");

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const video = await input.getPrimaryVideoTrack();
  if (!video) throw new Error("no-video-track");

  const [sw, sh] = await Promise.all([
    video.getDisplayWidth(),
    video.getDisplayHeight(),
  ]);
  const sized = computeTargetSize(sw, sh, opts.resize);
  const width = even(sized.width);
  const height = even(sized.height);

  const isWebm = opts.target === "webm";
  const candidates: VideoCodec[] = isWebm ? ["vp9", "vp8"] : ["avc"];
  const codec = await getFirstEncodableVideoCodec(candidates, { width, height });
  if (!codec) throw new Error("unsupported-target");

  const bitrate = { low: QUALITY_LOW, medium: QUALITY_MEDIUM, high: QUALITY_HIGH }[
    opts.quality
  ];

  const output = new Output({
    format: isWebm ? new WebMOutputFormat() : new Mp4OutputFormat(),
    target: new BufferTarget(),
  });

  // Audio is left to mediabunny's default handling: it copies the source audio
  // when the container allows it, transcodes to a compatible codec (opus/aac)
  // when it can, and only discards it when the browser can encode neither.
  const conversion = await Conversion.init({
    input,
    output,
    video: { width, height, fit: "contain", codec, bitrate },
    showWarnings: false,
  });

  if (onProgress) conversion.onProgress = (p) => onProgress(p);
  if (!conversion.isValid) throw new Error("conversion-invalid");

  await conversion.execute();

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("no-output");
  return new Blob([buffer], { type: VIDEO_MIME[opts.target] });
}

// --- gif -------------------------------------------------------------------

function frameContext(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) throw new Error("no-2d-context");
  return ctx;
}

async function convertToGif(
  file: File,
  opts: VideoOptions,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const [mb, gifenc] = await Promise.all([
    import("mediabunny"),
    import("gifenc"),
  ]);
  const { Input, ALL_FORMATS, BlobSource, CanvasSink } = mb;
  const { GIFEncoder, quantize, applyPalette } = gifenc;

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const video = await input.getPrimaryVideoTrack();
  if (!video) throw new Error("no-video-track");

  const [sw, sh, duration] = await Promise.all([
    video.getDisplayWidth(),
    video.getDisplayHeight(),
    input.computeDuration(),
  ]);

  // Resolve the requested size, then clamp the LARGER side to the GIF ceiling so
  // portrait clips are bounded too (not just landscape width).
  let { width, height } = computeTargetSize(sw, sh, opts.resize);
  const longest = Math.max(width, height);
  if (longest > GIF_MAX_WIDTH) {
    const scale = GIF_MAX_WIDTH / longest;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const fps = Math.min(Math.max(Math.round(opts.fps) || GIF_DEFAULT_FPS, 1), 30);
  const endTime = Math.min(
    Number.isFinite(duration) ? duration : GIF_MAX_DURATION,
    GIF_MAX_DURATION,
  );
  const frameDelay = Math.round(1000 / fps);

  // Monotonic sample timestamps → an optimized single-pass decode.
  const timestamps: number[] = [];
  for (let t = 0; t < endTime; t += 1 / fps) timestamps.push(t);
  if (timestamps.length === 0) timestamps.push(0);
  const total = timestamps.length;

  const sink = new CanvasSink(video, { width, height, fit: "contain" });
  const gif = GIFEncoder();

  let done = 0;
  let written = 0;
  for await (const wrapped of sink.canvasesAtTimestamps(timestamps)) {
    done++;
    if (wrapped) {
      const ctx = frameContext(wrapped.canvas);
      const { data } = ctx.getImageData(0, 0, width, height);
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);
      gif.writeFrame(index, width, height, { palette, delay: frameDelay });
      written++;
    }
    onProgress?.(Math.min(1, done / total));
  }

  if (written === 0) throw new Error("no-frames");
  gif.finish();

  // Copy the encoder's view into a standalone ArrayBuffer for the Blob (bytes()
  // may return a subarray over a larger internal buffer).
  const bytes = gif.bytes();
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return new Blob([buf], { type: VIDEO_MIME.gif });
}

/** Build the download filename: swap the source extension for the target's. */
export function videoOutputName(inputName: string, target: VideoTarget): string {
  const dot = inputName.lastIndexOf(".");
  const stem = dot > 0 ? inputName.slice(0, dot) : inputName;
  return `${stem}.${VIDEO_EXT[target]}`;
}
