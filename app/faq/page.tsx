import type { Metadata } from "next";
import FaqContent from "./FaqContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { faqEntries } from "./faqData";

// Korean-first metadata — matches the default (ko) static HTML that gets
// indexed. English equivalents live on the /en mirror; hreflang links the two.
export const metadata: Metadata = {
  title: "자주 묻는 질문 (FAQ) — Pixly",
  description:
    "Pixly 이미지 도구에 대해 자주 묻는 질문과 답을 모았어요. 사진은 서버에 올라가지 않고, 모든 기능은 무료이며, 회원가입도 필요 없어요.",
  alternates: {
    canonical: "/faq/",
    languages: altLanguages("/faq/"),
  },
};

export default function FaqPage() {
  const url = `${SITE_URL}/faq/`;

  // JSON-LD is built from `faqEntries("ko")` — the SAME data FaqContent renders
  // by default — so the FAQPage structured data can never drift from the
  // visible Korean copy. Breadcrumb: 홈 › 자주 묻는 질문.
  const jsonLd = [
    faqSchema(faqEntries("ko")),
    breadcrumbSchema([
      { name: "홈", url: `${SITE_URL}/` },
      { name: "자주 묻는 질문", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <FaqContent />
    </>
  );
}
