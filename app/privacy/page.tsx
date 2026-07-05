import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";
import { altLanguages } from "@/lib/seo";

// Korean-first metadata to match the default (ko) render that gets indexed. The
// English equivalents live on the /en/privacy/ mirror; hreflang links the two.
export const metadata: Metadata = {
  title: "개인정보 처리방침 — Pixly",
  description:
    "Pixly가 데이터를 어떻게 다루는지 안내해요. 요약하면 — 이미지는 절대 내 기기 밖으로 나가지 않아요.",
  alternates: {
    canonical: "/privacy/",
    languages: altLanguages("/privacy/"),
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
