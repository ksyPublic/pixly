import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConversionContent from "@/app/[slug]/ConversionContent";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import {
  CONVERSIONS,
  conversionAppName,
  conversionBreadcrumbName,
  conversionHowToSteps,
  conversionHowToTitle,
  conversionSlug,
  getConversionBySlug,
  metaDescriptionEn,
  metaTitleEn,
} from "@/lib/conversions";

// English mirror of the converter detail pages, at /en/<from>-to-<to>/. The
// visible body (ConversionContent) is shared with the Korean route and renders
// English here because locale is derived from the URL; this shell emits the
// English <title>/description and English JSON-LD so the indexed page is fully
// English. hreflang links it to the canonical Korean page.
export const dynamicParams = false;

export function generateStaticParams() {
  return CONVERSIONS.map((c) => ({ slug: conversionSlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getConversionBySlug(slug);
  if (!c) return {};
  return {
    title: metaTitleEn(c),
    description: metaDescriptionEn(c),
    alternates: {
      canonical: `/en/${slug}/`,
      languages: altLanguages(`/${slug}/`),
    },
  };
}

export default async function EnConversionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getConversionBySlug(slug);
  if (!c) notFound();

  const url = `${SITE_URL}/en/${slug}/`;

  const jsonLd = [
    webApplicationSchema(conversionAppName(c, "en"), url),
    howToSchema(conversionHowToTitle(c, "en"), conversionHowToSteps(c, "en")),
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/en/` },
      { name: conversionBreadcrumbName(c, "en"), url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ConversionContent slug={slug} />
    </>
  );
}
