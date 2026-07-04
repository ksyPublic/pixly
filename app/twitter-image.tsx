// Twitter / X share card.
//
// Next's `twitter-image` file convention is separate from `opengraph-image`
// (it does not auto-derive twitter:image from the OG file for file-based
// metadata), so we re-export the exact same build-time PNG renderer to keep
// the OG card and the `summary_large_image` Twitter card visually identical.
// This emits its own static /twitter-image.<hash>.png at build — export-safe.
// `dynamic` must be declared locally (Next won't accept it re-exported) so this
// route is statically generated under `output: "export"`.
export const dynamic = "force-static";

export { default, alt, size, contentType } from "./opengraph-image";
