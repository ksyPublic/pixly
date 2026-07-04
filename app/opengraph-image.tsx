import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

/**
 * Build-time-generated Open Graph card (1200×630).
 *
 * `next/og` rasterizes this JSX with satori + resvg into a static PNG during
 * `next build`, so it is fully compatible with `output: "export"` (no server,
 * no request-time APIs, no fs/network — everything below is deterministic).
 *
 * The same component is re-exported by `app/twitter-image.tsx` so the Twitter /
 * X `summary_large_image` card matches the OG card exactly.
 *
 * Colors are hard-coded here (satori cannot read our CSS-variable tokens). They
 * mirror the Pixly brand: warm paper, ink, and the confident tangerine accent
 * (`--accent` in the design system). The wordmark is the real Logo.tsx mark,
 * inlined as an SVG so the shared-link card carries the true brand lettering.
 */

// Required by `output: "export"` — route handlers must be statically generated.
export const dynamic = "force-static";

export const alt =
  "Pixly: a free, private image converter that runs entirely in your browser. Convert HEIC, PNG, JPG and WebP with no upload.";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

// ── Brand palette (light/paper variant) ──────────────────────────────────
const PAPER = "#FBF8F4";
const INK = "#14161C";
const MUTED = "#6B6F79";
const ACCENT = "#FF5A2C";
const ACCENT_DEEP = "#E8431A";
const SURFACE = "#FFFFFF";
const LINE = "rgba(20,22,28,0.12)";

const svgDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

// The Pixly wordmark — the exact strokes from components/Logo.tsx. Ink letters,
// the dot of the "i" is the single tangerine brand pixel.
const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 61 34" fill="none"><g stroke="${INK}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6 V26"/><path d="M6 6 C14.5 6 18.5 8 18.5 11 C18.5 14 14.5 15.8 6 15.8"/><path d="M24.5 12 V26"/><path d="M30.5 12 L39.5 26"/><path d="M39.5 12 L30.5 26"/><path d="M45 6 V26"/><path d="M50 12 L55.1 21.7"/><path d="M59 12 L50.5 33"/></g><rect x="22.2" y="5.2" width="4.6" height="4.6" rx="1.4" fill="${ACCENT}"/></svg>`;

// The pictorial mark (sun + mountains) that also lives in the favicon / app
// tile — here in tangerine, sitting inside the crop frame on the right.
const glyphSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><circle cx="11" cy="11" r="3.2" fill="${ACCENT}"/><path d="M4.5 25.5 L12.6 15 L17 20.6 L20.6 16.4 L28 25.5 Z" fill="${ACCENT}"/></svg>`;

// L-shaped crop-handle bracket for the right-hand frame motif.
function CropCorner({
  pos,
}: {
  pos: "tl" | "tr" | "bl" | "br";
}) {
  const t = pos[0] === "t";
  const l = pos[1] === "l";
  // satori throws on `undefined` inset values, so set only the two sides we need.
  const style: CSSProperties = {
    position: "absolute",
    width: 34,
    height: 34,
    borderStyle: "solid",
    borderColor: ACCENT,
    borderTopWidth: t ? 6 : 0,
    borderBottomWidth: t ? 0 : 6,
    borderLeftWidth: l ? 6 : 0,
    borderRightWidth: l ? 0 : 6,
    borderTopLeftRadius: t && l ? 8 : 0,
    borderTopRightRadius: t && !l ? 8 : 0,
    borderBottomLeftRadius: !t && l ? 8 : 0,
    borderBottomRightRadius: !t && !l ? 8 : 0,
  };
  if (t) style.top = -3;
  else style.bottom = -3;
  if (l) style.left = -3;
  else style.right = -3;
  return <div style={style} />;
}

function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 46,
        padding: "0 18px",
        borderRadius: 999,
        border: `1.5px solid ${LINE}`,
        background: SURFACE,
        color: INK,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 0.4,
      }}
    >
      {children}
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Soft tangerine atmosphere, top-right — echoes the site hero glow. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 88% 8%, rgba(255,90,44,0.20), rgba(255,90,44,0) 70%)",
          }}
        />
        {/* Confident brand stripe along the top. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DEEP})`,
          }}
        />

        {/* Left column — kicker, wordmark, tagline, format chips. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
            width: 720,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: MUTED,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 3,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: ACCENT,
              }}
            />
            <span>IMAGE TOOLKIT · 100% PRIVATE</span>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={svgDataUri(wordmarkSvg)}
            width={470}
            height={262}
            alt=""
            style={{ marginTop: 18, marginBottom: 6, marginLeft: -6 }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700, color: INK }}>
              Free, private image converter.
            </div>
            <div style={{ fontSize: 28, color: MUTED }}>
              No upload. Your files never leave your device.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <Chip>HEIC → JPG</Chip>
            <Chip>PNG</Chip>
            <Chip>WEBP</Chip>
            <Chip>CROP</Chip>
          </div>
        </div>

        {/* Right column — crop-frame motif around the pictorial mark. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            height: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 300,
              height: 300,
              borderRadius: 28,
              background: SURFACE,
              border: `1.5px solid ${LINE}`,
              boxShadow: "0 30px 60px -30px rgba(20,22,28,0.35)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={svgDataUri(glyphSvg)} width={168} height={168} alt="" />
            <CropCorner pos="tl" />
            <CropCorner pos="tr" />
            <CropCorner pos="bl" />
            <CropCorner pos="br" />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
