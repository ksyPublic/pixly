import type { Metadata } from "next";
import FaqContent from "@/app/faq/FaqContent";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { faqEntries } from "@/app/faq/faqData";

// English mirror of /faq. FAQPage JSON-LD is built from the English Q&A — the
// same data FaqContent renders here — so structured data mirrors the page.
export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) — Pixly",
  description:
    "Answers to the questions people ask most about Pixly's image tools. In short: your files are never uploaded, every tool is free, and there's no sign-up.",
  alternates: {
    canonical: "/en/faq/",
    languages: altLanguages("/faq/"),
  },
};

export default function EnFaqPage() {
  const url = `${SITE_URL}/en/faq/`;

  const jsonLd = [
    faqSchema(faqEntries("en")),
    breadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/en/` },
      { name: "Frequently Asked Questions", url },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <FaqContent />
    </>
  );
}
