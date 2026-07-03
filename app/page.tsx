import Link from "next/link";
import {
  CONVERSIONS,
  FORMATS,
  conversionSlug,
} from "@/lib/conversions";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-14 sm:py-20">
      <section className="text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs text-black/60 dark:border-white/10 dark:text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Files never leave your browser
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Free image converter that respects your privacy
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-black/60 dark:text-white/60">
          Convert HEIC, PNG, JPG and WebP images instantly — 100% in your
          browser. No upload, no sign-up, no limits.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-sm font-semibold text-black/50 dark:text-white/50">
          Pick a converter
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONVERSIONS.map((c) => {
            const slug = conversionSlug(c);
            return (
              <li key={slug}>
                <Link
                  href={`/${slug}/`}
                  className="group flex items-center justify-between rounded-2xl border border-black/10 px-5 py-4 transition-colors hover:border-blue-500 hover:bg-blue-50/50 dark:border-white/10 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span>{FORMATS[c.from].label}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-black/30 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-white/30"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m0 0-5-5m5 5-5 5"
                      />
                    </svg>
                    <span>{FORMATS[c.to].label}</span>
                  </span>
                  <span className="text-xs text-black/40 dark:text-white/40">
                    Convert →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
