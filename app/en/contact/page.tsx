import type { Metadata } from "next";
import ContactContent from "@/app/contact/ContactContent";
import { altLanguages } from "@/lib/seo";

// English mirror of /contact.
export const metadata: Metadata = {
  title: "Contact — Pixly",
  description: "Get in touch with the Pixly team.",
  alternates: {
    canonical: "/en/contact/",
    languages: altLanguages("/contact/"),
  },
};

export default function EnContactPage() {
  return <ContactContent />;
}
