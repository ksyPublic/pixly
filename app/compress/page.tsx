import type { Metadata } from "next";
import CompressLanding from "./CompressLanding";
import { COMPRESS_META, compressCopy } from "./copy";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Korean-first metadata to match the indexed (default-ko) page; English strings
// are kept in COMPRESS_META.titleEn / descriptionEn.
export const metadata: Metadata = {
  title: COMPRESS_META.title,
  description: COMPRESS_META.description,
  alternates: {
    canonical: "/compress/",
    languages: altLanguages("/compress/"),
  },
};

export default function CompressPage() {
  const url = `${SITE_URL}/compress/`;

  // JSON-LD in Korean, built from the SAME copy the client renders by default,
  // so structured data mirrors the visible page.
  const copy = compressCopy("ko");
  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: "홈", url: `${SITE_URL}/` },
      { name: "이미지 압축", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <CompressLanding />
    </>
  );
}
