import { ImageResponse } from "next/og";

/**
 * iOS home-screen / apple-touch icon (180×180), generated at build time.
 *
 * Full-bleed tangerine tile with the white Pixly "P" mark (same geometry as the
 * wordmark) — the same mark as the browser-tab favicon (app/icon.svg), so the
 * identity is consistent across tab and home screen. iOS applies its own
 * rounded-superellipse mask, so the tile is drawn edge-to-edge (a gentle
 * radius is kept for hosts that show it unmasked). No fs / network / request
 * APIs → static-export safe.
 */

// Required by `output: "export"` — route handlers must be statically generated.
export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// White "P" (same geometry as the Pixly wordmark) on a transparent field; the
// tangerine tile sits behind.
const markSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 0 32 32" fill="none">` +
  `<g stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">` +
  `<path d="M6 6 V26"/>` +
  `<path d="M6 6 C14.5 6 18.5 8 18.5 11 C18.5 14 14.5 15.8 6 15.8"/>` +
  `</g></svg>`;

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
          width={120}
          height={120}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
