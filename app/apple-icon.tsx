import { ImageResponse } from "next/og";

/**
 * iOS home-screen / apple-touch icon (180×180), generated at build time.
 *
 * Full-bleed tangerine tile with the white Pixly pictorial mark (sun +
 * mountains) — the same mark as the browser-tab favicon (app/icon.svg), so the
 * identity is consistent across tab and home screen. iOS applies its own
 * rounded-superellipse mask, so the tile is drawn edge-to-edge (a gentle
 * radius is kept for hosts that show it unmasked). No fs / network / request
 * APIs → static-export safe.
 */

// Required by `output: "export"` — route handlers must be statically generated.
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// White sun + mountains on a transparent field; the tangerine tile sits behind.
const markSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">` +
  `<circle cx="11" cy="11" r="3.2" fill="#fff"/>` +
  `<path d="M4.5 25.5 L12.6 15 L17 20.6 L20.6 16.4 L28 25.5 Z" fill="#fff"/>` +
  `</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(145deg, #FF7A45 0%, #FF5A2C 55%, #E8431A 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml,${encodeURIComponent(markSvg)}`}
          width={132}
          height={132}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
