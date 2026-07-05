import type { Metadata } from "next";
import ContactContent from "./ContactContent";
import { altLanguages } from "@/lib/seo";

// Korean-first metadata to match the default (ko) render that gets indexed. The
// English equivalents live on the /en/contact/ mirror; hreflang links the two.
export const metadata: Metadata = {
  title: "문의 — Pixly",
  description:
    "Pixly 팀에게 문의하세요. 질문, 버그 제보, 지원했으면 하는 형식 제안을 언제든 환영해요.",
  alternates: {
    canonical: "/contact/",
    languages: altLanguages("/contact/"),
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
