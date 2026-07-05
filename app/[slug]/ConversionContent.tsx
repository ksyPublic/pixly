"use client";

import Link from "@/components/LocaleLink";
import Converter from "@/components/Converter";
import { AdSlot } from "@/components/AdSense";
import { useI18n } from "@/lib/i18n";
import {
  CONVERSIONS,
  FORMATS,
  conversionHowToSteps,
  conversionHowToTitle,
  conversionRelatedTitle,
  conversionSlug,
  getConversionBySlug,
  whyCopy,
} from "@/lib/conversions";

// Client-rendered prose for the converter detail pages. The default (server)
// render uses locale "ko", so the static HTML matches the Korean JSON-LD built
// in page.tsx; the language toggle swaps everything to English at runtime.
export default function ConversionContent({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const c = getConversionBySlug(slug);
  if (!c) return null;

  const from = FORMATS[c.from].label;
  const to = FORMATS[c.to].label;

  const howToSteps = conversionHowToSteps(c, locale);

  // Related conversions for internal linking (SEO + navigation).
  const related = CONVERSIONS.filter(
    (o) => conversionSlug(o) !== slug && (o.from === c.from || o.to === c.to),
  ).slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("conv.h1", { from, to })}
      </h1>
      <p className="mt-3 text-muted">{t("conv.intro", { from, to })}</p>

      <div className="mt-8">
        <Converter from={c.from} to={c.to} />
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
          {conversionHowToTitle(c, locale)}
        </h2>
        <ol className="ml-5 list-decimal space-y-1">
          {howToSteps.map((s) => (
            <li key={s.name}>{s.text}</li>
          ))}
        </ol>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("conv.whyHeading", { from, to })}
        </h2>
        <p>{whyCopy(from, to, locale)}</p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("detail.safeHeading")}
        </h2>
        <p>{t("conv.safeBody")}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-12 border-t border-line pt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted">
            {t("conv.relatedConverters")}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((o) => {
              const s = conversionSlug(o);
              return (
                <li key={s}>
                  <Link
                    href={`/${s}/`}
                    className="inline-block rounded-full border border-line bg-surface px-3 py-1 text-sm transition-colors hover:border-accent"
                  >
                    {conversionRelatedTitle(o, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
