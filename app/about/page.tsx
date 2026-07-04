import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Pixly",
  description:
    "Pixly is a free, privacy-first image toolkit that runs entirely in your browser — convert, compress, crop, and make PDFs without uploading a thing.",
};

export default function AboutPage() {
  return <AboutContent />;
}
