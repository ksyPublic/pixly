// Central site config. Change SITE_URL here (or via env) when a custom
// domain is connected for AdSense.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pixly.ksypublic.workers.dev"
).replace(/\/$/, "");

// Google AdSense publisher ID, e.g. "ca-pub-1234567890123456".
// Ads stay completely dormant (render nothing, load no scripts) until this is
// set via NEXT_PUBLIC_ADSENSE_CLIENT. Set it once AdSense approves the site.
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
