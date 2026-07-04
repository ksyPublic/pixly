import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConversionContent from "./ConversionContent";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import {
  CONVERSIONS,
  conversionAppName,
  conversionBreadcrumbName,
  conversionHowToSteps,
  conversionHowToTitle,
  conversionSlug,
  getConversionBySlug,
  metaDescription,
  metaTitle,
} from "@/lib/conversions";

// Only the slugs we enumerate here are built. Anything else 404s.
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
  // Korean-first: the emitted <title>/description match the indexed (default-ko)
  // page. English equivalents live in metaTitleEn/metaDescriptionEn.
  return {
    title: metaTitle(c),
    description: metaDescription(c),
    alternates: { canonical: `/${slug}/` },
  };
}

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getConversionBySlug(slug);
  if (!c) notFound();

  const url = `${SITE_URL}/${slug}/`;

  // JSON-LD is rendered in Korean ("ko") to mirror the default static HTML the
  // client component produces. The how-to text comes from the SAME builders the
  // client uses, so structured data can never drift from the page.
  const jsonLd = [
    webApplicationSchema(conversionAppName(c, "ko"), url),
    howToSchema(conversionHowToTitle(c, "ko"), conversionHowToSteps(c, "ko")),
    breadcrumbSchema([
      { name: "홈", url: `${SITE_URL}/` },
      { name: conversionBreadcrumbName(c, "ko"), url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <ConversionContent slug={slug} />
    </>
  );
}
