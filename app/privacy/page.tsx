import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — Pixly",
  description:
    "How Pixly handles your data. Short version: your images never leave your device.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
