"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ADSENSE_CLIENT } from "@/lib/site";

// Loads the AdSense library once per page. Renders nothing until a publisher
// ID is configured, so the site has zero ad-related weight before approval.
export function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}

// A single responsive ad unit. Pass the `slot` id from your AdSense dashboard.
// Dormant (renders nothing) until ADSENSE_CLIENT is set.
export function AdSlot({
  slot,
  className,
}: {
  slot?: string;
  className?: string;
}) {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet / blocked — ignore.
    }
  }, []);

  if (!ADSENSE_CLIENT) return null;

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
