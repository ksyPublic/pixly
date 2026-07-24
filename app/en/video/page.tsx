import type { Metadata } from "next";
import VideoLanding from "@/app/video/VideoLanding";
import { VIDEO_META, videoCopy } from "@/app/video/copy";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// English mirror of /video. Same client body; English metadata + JSON-LD.
export const metadata: Metadata = {
  title: VIDEO_META.titleEn,
  description: VIDEO_META.descriptionEn,
  alternates: {
    canonical: "/en/video/",
    languages: altLanguages("/video/"),
  },
};

export default function EnVideoPage() {
  const url = `${SITE_URL}/en/video/`;
  const copy = videoCopy("en");

  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/en/` },
      { name: "Convert Video", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <VideoLanding />
    </>
  );
}
