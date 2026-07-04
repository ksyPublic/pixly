import PdfToolContent from "@/components/PdfToolContent";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import { PDF_TOOLS } from "@/lib/pdfTools";

// Server shell for every PDF-tool landing page: emits the Korean JSON-LD (built
// from the SAME copy the client renders by default, so structured data mirrors
// the visible, default-Korean page) and hands the visible body to the client
// PdfToolContent, which localizes it via the active locale.
export default function PdfToolLanding({ slug }: { slug: string }) {
  const tool = PDF_TOOLS[slug];
  const copy = tool.copy.ko;
  const url = `${SITE_URL}/${slug}/`;

  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: "홈", url: `${SITE_URL}/` },
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
