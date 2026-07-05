import type { Metadata } from "next";
import CropContent from "./CropContent";
import { altLanguages } from "@/lib/seo";

// Korean-first metadata to match the default (ko) render that gets indexed. The
// English equivalents live on the /en/crop/ mirror; hreflang links the two.
export const metadata: Metadata = {
  title: "스마트 이미지 자르기 — 무료, 업로드 없음 | Pixly",
  description:
    "사진을 브라우저에서 무료로 잘라보세요. 스마트 크롭이 상품이나 인물처럼 중요한 부분을 자동으로 찾아 원하는 비율로 맞춰줘요. 100% 내 기기에서 처리되고, 파일은 업로드되지 않아요.",
  alternates: {
    canonical: "/crop/",
    languages: altLanguages("/crop/"),
  },
};

export default function CropPage() {
  return <CropContent />;
}
