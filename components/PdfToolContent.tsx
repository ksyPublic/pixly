"use client";

import Link from "@/components/LocaleLink";
import ImagesToPdf from "@/components/ImagesToPdf";
import PdfToImages from "@/components/PdfToImages";
import { AdSlot } from "@/components/AdSense";
import { useI18n } from "@/lib/i18n";
import { PDF_TOOLS } from "@/lib/pdfTools";
import {
  CONVERSIONS,
  conversionRelatedTitle,
  conversionSlug,
} from "@/lib/conversions";

// Client-rendered body for the PDF-tool landing pages. Default render uses
// locale "ko" (matching the Korean JSON-LD in PdfToolLanding); the toggle swaps
// to English. Reads copy[locale] from lib/pdfTools.ts — one source shared with
// the server JSON-LD, so structured data never drifts from the page.
export default function PdfToolContent({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const tool = PDF_TOOLS[slug];
  const copy = tool.copy[locale];

  // Related links: PDF tools first (by localized h1), then any converters.
  const related = tool.related
    .map((s) => {
      const pdf = PDF_TOOLS[s];
      if (pdf) return { slug: s, label: pdf.copy[locale].h1 };
      const conv = CONVERSIONS.find((c) => conversionSlug(c) === s);
      return conv
        ? { slug: s, label: conversionRelatedTitle(conv, locale) }
        : null;
    })
    .filter((x): x is { slug: string; label: string } => Boolean(x));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {copy.h1}
      </h1>
      <p className="mt-3 text-muted">{copy.intro}</p>

      <div className="mt-8">
        {tool.engine.kind === "images-to-pdf" ? (
          <ImagesToPdf source={tool.engine.source} />
        ) : (
          <PdfToImages format={tool.engine.format} />
        )}
      </div>

      {/* Trust badges */}
      <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
        {[
          [t("badge.privateT"), t("badge.privateD")],
          [t("badge.nosignupT"), t("badge.nosignupD")],
          [t("badge.unlimitedT"), t("badge.unlimitedD")],
        ].map(([title, sub]) => (
          <li
            key={title}
            className="rounded-xl border border-line bg-surface px-2 py-3"
          >
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-0.5">{sub}</p>
          </li>
        ))}
      </ul>

      {/* Ad slot — dormant until an AdSense publisher ID is configured. */}
      <AdSlot className="mt-10" />

      {/* Content section — real copy so the page isn't "thin" for AdSense/SEO. */}
      <section className="prose-sm mt-12 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="font-display text-xl font-bold text-ink">
          {copy.howToTitle}
        </h2>
        <ol className="ml-5 list-decimal space-y-1">
          {copy.howToSteps.map((s) => (
            <li key={s.name}>{s.text}</li>
          ))}
        </ol>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {copy.whyHeading}
        </h2>
        <p>{copy.whyBody}</p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("detail.safeHeading")}
        </h2>
        <p>{copy.safeBody}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted">
            {t("detail.relatedTools")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/${r.slug}/`}
                  className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm transition-colors hover:border-accent"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
