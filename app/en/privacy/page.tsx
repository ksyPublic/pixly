import type { Metadata } from "next";
import PrivacyContent from "@/app/privacy/PrivacyContent";
import { altLanguages } from "@/lib/seo";

// English mirror of /privacy.
export const metadata: Metadata = {
  title: "Privacy Policy — Pixly",
  description:
    "How Pixly handles your data. Short version: your images never leave your device.",
  alternates: {
    canonical: "/en/privacy/",
    languages: altLanguages("/privacy/"),
  },
};

export default function EnPrivacyPage() {
  return <PrivacyContent />;
}
