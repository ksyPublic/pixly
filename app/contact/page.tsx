import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Pixly",
  description: "Get in touch with the Pixly team.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-black/70 dark:text-white/70">
        <p>
          Have a question, a bug report, or a format you&apos;d like Pixly to
          support? We&apos;d love to hear from you.
        </p>
        <p>
          Email:{" "}
          <a
            href="mailto:hello@pixly.app"
            className="text-blue-600 underline dark:text-blue-400"
          >
            hello@pixly.app
          </a>
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          {/* TODO: replace hello@pixly.app with your real inbox before launch. */}
          We usually reply within a couple of days.
        </p>
      </div>
    </main>
  );
}
