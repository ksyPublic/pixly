import type { Metadata } from "next";
import AboutContent from "@/app/about/AboutContent";
import { altLanguages } from "@/lib/seo";

// English mirror of /about.
export const metadata: Metadata = {
  title: "About Pixly",
  description:
    "Pixly is a free, privacy-first image toolkit that runs entirely in your browser — convert, compress, crop, and make PDFs without uploading a thing.",
  alternates: {
    canonical: "/en/about/",
    languages: altLanguages("/about/"),
  },
};

export default function EnAboutPage() {
  return <AboutContent />;
}
