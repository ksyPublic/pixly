import PdfToolContent from "@/components/PdfToolContent";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import type { Locale } from "@/lib/i18n";
import { enPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { PDF_TOOLS } from "@/lib/pdfTools";

// Server shell for every PDF-tool landing page. It emits the JSON-LD (built from
// the SAME copy the client renders, so structured data mirrors the visible
// page) and hands the visible body to the client PdfToolContent, which localizes
// itself from the route. `locale` selects the language for BOTH the schema and
// the URLs: the default (ko) shell lives at /<slug>/, the English one at
// /en/<slug>/.
export default function PdfToolLanding({
  slug,
  locale = "ko",
}: {
  slug: string;
  locale?: Locale;
}) {
  const tool = PDF_TOOLS[slug];
  const copy = tool.copy[locale];
  const path = locale === "en" ? enPath(`/${slug}/`) : `/${slug}/`;
  const url = `${SITE_URL}${path}`;
  const homeUrl = `${SITE_URL}${locale === "en" ? "/en/" : "/"}`;

  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: locale === "en" ? "Home" : "홈", url: homeUrl },
      { name: copy.h1, url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <PdfToolContent slug={slug} />
    </>
  );
}
