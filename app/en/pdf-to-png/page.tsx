import type { Metadata } from "next";
import PdfToolLanding from "@/components/PdfToolLanding";
import { altLanguages } from "@/lib/seo";
import { PDF_TOOLS } from "@/lib/pdfTools";

const tool = PDF_TOOLS["pdf-to-png"];

// English mirror of /pdf-to-png.
export const metadata: Metadata = {
  title: tool.metaTitleEn,
  description: tool.metaDescriptionEn,
  alternates: {
    canonical: "/en/pdf-to-png/",
    languages: altLanguages("/pdf-to-png/"),
  },
};

export default function Page() {
  return <PdfToolLanding slug="pdf-to-png" locale="en" />;
}
