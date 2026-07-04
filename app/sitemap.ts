import type { MetadataRoute } from "next";
import { CONVERSIONS, conversionSlug } from "@/lib/conversions";
import { PDF_TOOL_SLUGS } from "@/lib/pdfTools";
import { SITE_URL } from "@/lib/site";

// Generated to /sitemap.xml at build time (static export compatible).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const infoPages = ["", "crop", "compress", "faq", "about", "privacy", "contact"];
  const converterPages = CONVERSIONS.map((c) => conversionSlug(c));
  // The PDF tools are tool pages like the converters; their "-to-" slugs pick
  // up the same 0.8 priority below.
  const pdfPages = PDF_TOOL_SLUGS;

  const entry = (path: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}/${path ? `${path}/` : ""}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.includes("-to-") ? 0.8 : 0.4,
  });

  return [...infoPages, ...converterPages, ...pdfPages].map(entry);
}
