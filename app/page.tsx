import type { Metadata } from "next";
import HomeContent from "./HomeContent";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// Korean-first home metadata — matches the default (ko) static HTML that gets
// indexed at the root. The /en mirror (app/en/page.tsx) carries the English
// equivalents; hreflang links the two.
export const metadata: Metadata = {
  title: "Pixly — 무료 이미지 변환·압축·자르기 (업로드 없음)",
  description:
    "HEIC·PNG·JPG·WebP 이미지를 업로드 없이 브라우저에서 바로 변환하고, 용량을 줄이고, 자르세요. 설치도 회원가입도 필요 없고, 파일은 내 기기 밖으로 나가지 않아요.",
  alternates: {
    canonical: "/",
    languages: altLanguages("/"),
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          webSiteSchema("Pixly", SITE_URL),
          organizationSchema("Pixly", SITE_URL),
        ]}
      />
      <HomeContent />
    </>
  );
}
