// Structured-data (JSON-LD) builders. Kept in one place so schema always mirrors
// the copy actually rendered on the page — Google requires structured data to
// reflect visible content. Pure functions, so they're static-export safe and can
// be called from server or client components alike.

const CONTEXT = "https://schema.org";

export interface HowToStep {
  /** Short step heading. */
  name: string;
  /** The full instruction text — must match what the page shows. */
  text: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Crumb {
  name: string;
  url: string;
}

/** A free, browser-based image tool (converter, compressor, cropper). */
export function webApplicationSchema(name: string, url: string) {
  return {
    "@context": CONTEXT,
    "@type": "WebApplication",
    name,
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** Step-by-step instructions — mirror the on-page "How to…" list exactly. */
export function howToSchema(name: string, steps: HowToStep[]) {
  return {
    "@context": CONTEXT,
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/** FAQ rich result — questions/answers MUST match visible page text. */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Breadcrumb trail, e.g. Home > "HEIC to JPG Converter". */
export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webSiteSchema(name: string, url: string) {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name,
    url,
  };
}

export function organizationSchema(name: string, url: string) {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name,
    url,
  };
}
