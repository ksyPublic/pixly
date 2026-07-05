import type { Metadata } from "next";
import AboutContent from "./AboutContent";
import { altLanguages } from "@/lib/seo";

// Korean-first metadata to match the default (ko) render that gets indexed. The
// English equivalents live on the /en/about/ mirror; hreflang links the two.
export const metadata: Metadata = {
  title: "Pixly 소개",
  description:
    "Pixly는 브라우저에서 바로 쓰는 무료·프라이버시 우선 이미지 도구예요. 업로드 없이 변환·압축·자르기·PDF까지, 모든 작업이 내 기기 안에서 이뤄져요.",
  alternates: {
    canonical: "/about/",
    languages: altLanguages("/about/"),
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
