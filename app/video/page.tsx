import type { Metadata } from "next";
import VideoLanding from "./VideoLanding";
import { VIDEO_META, videoCopy } from "./copy";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbSchema,
  howToSchema,
  webApplicationSchema,
} from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Korean-first metadata to match the indexed (default-ko) page; English strings
// live in VIDEO_META.titleEn / descriptionEn.
export const metadata: Metadata = {
  title: VIDEO_META.title,
  description: VIDEO_META.description,
  alternates: {
    canonical: "/video/",
    languages: altLanguages("/video/"),
  },
};

export default function VideoPage() {
  const url = `${SITE_URL}/video/`;

  // JSON-LD in Korean, built from the SAME copy the client renders by default,
  // so structured data mirrors the visible page.
  const copy = videoCopy("ko");
  const jsonLd = [
    webApplicationSchema(copy.appName, url),
    howToSchema(copy.howToTitle, copy.howToSteps),
    breadcrumbSchema([
      { name: "홈", url: `${SITE_URL}/` },
      { name: "영상 변환", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <VideoLanding />
    </>
  );
}
