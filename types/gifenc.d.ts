// Minimal ambient types for `gifenc` (ships as untyped JS). Covers only the
// surface lib/video.ts uses to build animated GIFs from decoded video frames.
declare module "gifenc" {
  export type Palette = number[][];
  export type GifPixelFormat = "rgb565" | "rgb444" | "rgba4444";

  export interface GifEncoder {
    writeFrame(
      index: Uint8Array | number[],
      width: number,
      height: number,
      opts?: {
        palette?: Palette;
        /** Frame delay in milliseconds. */
        delay?: number;
        transparent?: boolean;
        transparentIndex?: number;
        /** 0 = loop forever, -1 = no repeat. */
        repeat?: number;
        dispose?: number;
        first?: boolean;
      },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(opts?: {
    auto?: boolean;
    initialCapacity?: number;
  }): GifEncoder;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: {
      format?: GifPixelFormat;
      oneBitAlpha?: boolean | number;
      clearAlpha?: boolean;
      clearAlphaThreshold?: number;
      clearAlphaColor?: number;
    },
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: GifPixelFormat,
  ): Uint8Array;
}
