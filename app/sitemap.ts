import type { MetadataRoute } from "next";
import { CONVERSIONS, conversionSlug } from "@/lib/conversions";
import { PDF_TOOL_SLUGS } from "@/lib/pdfTools";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Generated to /sitemap.xml at build time (static export compatible).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const infoPages = ["", "crop", "compress", "faq", "about", "privacy", "contact"];
  const converterPages = CONVERSIONS.map((c) => conversionSlug(c));
  // The PDF tools are tool pages like the converters; their "-to-" slugs pick
  // up the same 0.8 priority below.
  const pdfPages = PDF_TOOL_SLUGS;
  const paths = [...infoPages, ...converterPages, ...pdfPages];

  const abs = (p: string) => `${SITE_URL}${p}`;

  // Every page ships in two languages (Korean at the unprefixed path, English at
  // the /en mirror). We list BOTH URLs, and each carries the full hreflang set
  // (ko / en / x-default) so Google discovers and pairs the translations.
  return paths.flatMap((path) => {
    const canonicalPath = path ? `/${path}/` : "/";
    const langs = altLanguages(canonicalPath);
    const alternates = {
      languages: {
        ko: abs(langs.ko),
        en: abs(langs.en),
        "x-default": abs(langs["x-default"]),
      },
    };
    const changeFrequency = path === "" ? "weekly" : "monthly";
    const priority = path === "" ? 1 : path.includes("-to-") ? 0.8 : 0.4;

    return [
      { url: abs(langs.ko), changeFrequency, priority, alternates },
      { url: abs(langs.en), changeFrequency, priority, alternates },
    ];
  });
}
