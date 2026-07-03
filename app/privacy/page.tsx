import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pixly",
  description:
    "How Pixly handles your data. Short version: your images never leave your device.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">
        Last updated: 2026
      </p>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="font-display text-xl font-bold text-ink">
          Your images
        </h2>
        <p>
          Pixly processes images entirely within your browser. The files you
          select are <strong>never uploaded to any server</strong>. They are
          never transmitted, stored, or seen by us or anyone else. When you
          close or reload the page, they&apos;re gone.
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          Analytics
        </h2>
        <p>
          We may use privacy-respecting analytics to understand aggregate usage
          (for example, which converters are popular). This data is anonymous
          and never includes your images or filenames.
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          Advertising
        </h2>
        <p>
          Pixly displays ads to keep the service free. Third-party ad providers,
          including Google, may use cookies to serve ads based on your prior
          visits to this and other websites. You can opt out of personalized
          advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            className="text-accent underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Ads Settings
          </a>
          .
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          Contact
        </h2>
        <p>
          Questions about privacy? Reach us via the{" "}
          <a href="/contact/" className="text-accent underline">
            contact page
          </a>
          .
        </p>
      </div>
    </main>
  );
}
