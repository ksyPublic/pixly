import type { Metadata } from "next";
import CompressLanding from "@/app/compress/CompressLanding";
import { COMPRESS_META, compressCopy } from "@/app/compress/copy";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// English mirror of /compress. Same client body; English metadata + JSON-LD.
export const metadata: Metadata = {
  title: COMPRESS_META.titleEn,
  description: COMPRESS_META.descriptionEn,
  alternates: {
    canonical: "/en/compress/",
    languages: altLanguages("/compress/"),
  },
};

export default function EnCompressPage() {
  const url = `${SITE_URL}/en/compress/`;
  const copy = compressCopy("en");

  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/en/` },
      { name: "Compress Images", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <CompressLanding />
    </>
  );
}
