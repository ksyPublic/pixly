import type { Metadata } from "next";
import PdfToolLanding from "@/components/PdfToolLanding";
import { altLanguages } from "@/lib/seo";
import { PDF_TOOLS } from "@/lib/pdfTools";

const tool = PDF_TOOLS["pdf-to-jpg"];

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  alternates: {
    canonical: "/pdf-to-jpg/",
    languages: altLanguages("/pdf-to-jpg/"),
  },
};

export default function Page() {
  return <PdfToolLanding slug="pdf-to-jpg" />;
}
