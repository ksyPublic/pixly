"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useScrollReveal } from "@/components/useScrollReveal";
import { faqCategories } from "./faqData";

// Per-section reveal stagger, expressed through the shared `--reveal-stagger`
// token so timing lives in one place (app/globals.css). Reduced-motion is
// handled by the CSS + useScrollReveal — content is never trapped at opacity 0.
function stepDelay(i: number, cap = 6): CSSProperties {
  const n = i < cap ? i : cap;
  return { "--reveal-delay": `calc(var(--reveal-stagger) * ${n})` } as CSSProperties;
}

// Client-rendered FAQ prose. The default (server) render uses locale "ko", so
// the static HTML matches the Korean FAQPage JSON-LD emitted in page.tsx; the
// language toggle swaps everything to English at runtime. All Q&A is fully
// visible (no collapse) — best for reading, SEO, and AdSense content depth.
export default function FaqContent() {
  const { t, locale } = useI18n();
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);

  const categories = faqCategories(locale);

  return (
    <main ref={rootRef} className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
      <header className="reveal" data-reveal>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("faq.h1")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {t("faq.intro")}
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {categories.map((cat, ci) => (
          <section key={cat.id} className="reveal" data-reveal style={stepDelay(ci)}>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
              <span aria-hidden className="h-4 w-1 rounded-full bg-accent" />
              {cat.title}
            </h2>

            <div className="mt-4 space-y-3">
              {cat.items.map((item) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {item.answer}
                  </p>

                  {item.links && item.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted">
                        {t("faq.relatedLabel")}
                      </span>
                      {item.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="inline-block rounded-full border border-line bg-surface-2 px-3 py-1 text-sm transition-colors hover:border-accent hover:text-accent"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section
        className="reveal mt-12 rounded-2xl border border-line bg-surface p-6 text-center"
        data-reveal
      >
        <h2 className="font-display text-lg font-bold text-ink">
          {t("faq.stillTitle")}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {t("faq.stillA")}
          <Link href="/contact/" className="text-accent underline">
            {t("faq.stillLink")}
          </Link>
          {t("faq.stillB")}
        </p>
      </section>
    </main>
  );
}
