import type { Metadata } from "next";
import HomeContent from "@/app/HomeContent";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/jsonld";
import { altLanguages } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

// English mirror of the home page. Same client body as the Korean home — it
// renders in English because the route is under /en (locale is derived from the
// URL). hreflang links this back to the canonical Korean home.
export const metadata: Metadata = {
  title: "Pixly — Free, Private Image Converter (No Upload)",
  description:
    "Convert HEIC, PNG, JPG and WebP images for free. 100% in your browser — your files never leave your device. No upload, no sign-up.",
  alternates: {
    canonical: "/en/",
    languages: altLanguages("/"),
  },
};

export default function EnHomePage() {
  return (
    <>
      <JsonLd
        data={[
          webSiteSchema("Pixly", `${SITE_URL}/en/`),
          organizationSchema("Pixly", SITE_URL),
        ]}
      />
      <HomeContent />
    </>
  );
}
