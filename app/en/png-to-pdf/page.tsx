import type { Metadata } from "next";
import PdfToolLanding from "@/components/PdfToolLanding";
import { altLanguages } from "@/lib/seo";
import { PDF_TOOLS } from "@/lib/pdfTools";

const tool = PDF_TOOLS["png-to-pdf"];

// English mirror of /png-to-pdf.
export const metadata: Metadata = {
  title: tool.metaTitleEn,
  description: tool.metaDescriptionEn,
  alternates: {
    canonical: "/en/png-to-pdf/",
    languages: altLanguages("/png-to-pdf/"),
  },
};

export default function Page() {
  return <PdfToolLanding slug="png-to-pdf" locale="en" />;
}
