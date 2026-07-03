import type { MetadataRoute } from "next";
import { CONVERSIONS, conversionSlug } from "@/lib/conversions";
import { SITE_URL } from "@/lib/site";

// Generated to /sitemap.xml at build time (static export compatible).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const infoPages = ["", "crop", "about", "privacy", "contact"];
  const converterPages = CONVERSIONS.map((c) => conversionSlug(c));

  const entry = (path: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}/${path ? `${path}/` : ""}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.includes("-to-") ? 0.8 : 0.4,
  });

  return [...infoPages, ...converterPages].map(entry);
}
