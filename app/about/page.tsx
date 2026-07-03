import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Pixly",
  description:
    "Pixly is a free, privacy-first image converter that runs entirely in your browser.",
};

export default function AboutPage() {
  return <AboutContent />;
}
