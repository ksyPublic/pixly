import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Pixly",
  description: "Get in touch with the Pixly team.",
};

export default function ContactPage() {
  return <ContactContent />;
}
