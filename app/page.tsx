"use client";

import Link from "next/link";
import { CONVERSIONS, FORMATS, conversionSlug } from "@/lib/conversions";
import { useI18n } from "@/lib/i18n";
import HeroMotion from "@/components/HeroMotion";

const FEATURED = [
  "heic-to-jpg",
  "png-to-webp",
  "heic-to-png",
  "webp-to-jpg",
  "png-to-jpg",
  "avif-to-jpg",
];

function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="text-accent"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

function ConverterCard({ slug }: { slug: string }) {
  const c = CONVERSIONS.find((x) => conversionSlug(x) === slug);
  if (!c) return null;
  return (
    <Link
      href={`/${slug}/`}
      className="group flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 shadow-[var(--shadow)] transition-all hover:-translate-y-0.5 hover:border-accent"
    >
      <span className="flex items-center gap-2.5 font-display text-lg font-bold">
        {FORMATS[c.from].label}
        <Arrow />
        {FORMATS[c.to].label}
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted transition-colors group-hover:text-accent">
        →
      </span>
    </Link>
  );
}

export default function Home() {
  const { t } = useI18n();
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroMotion />
        <div className="dotgrid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
          <span className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {t("home.eyebrow")}
          </span>
          <h1
            className="rise mt-6 break-keep font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            {t("home.h1a")}
            <br />
            <span className="text-accent">{t("home.h1b")}</span>
          </h1>
          <p
            className="rise mx-auto mt-5 max-w-xl text-lg text-muted"
            style={{ animationDelay: "120ms" }}
          >
            {t("home.sub")}
          </p>
          <div
            className="rise mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <a
              href="#tools"
              className="rounded-xl bg-accent px-5 py-3 font-medium text-white shadow-[var(--shadow)] transition-transform hover:-translate-y-0.5"
            >
              {t("home.ctaBrowse")}
            </a>
            <Link
              href="/crop/"
              className="rounded-xl border border-line-strong bg-surface px-5 py-3 font-medium transition-colors hover:border-accent"
            >
              {t("home.ctaCrop")}
            </Link>
          </div>
          <p
            className="rise mt-6 font-mono text-xs uppercase tracking-wider text-muted"
            style={{ animationDelay: "240ms" }}
          >
            HEIC · AVIF · PNG · JPG · WebP · TIFF · GIF · ICO · PSD
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-5xl px-5">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["trust.private", "trust.privateSub"],
              ["trust.nosignup", "trust.nosignupSub"],
              ["trust.unlimited", "trust.unlimitedSub"],
              ["trust.instant", "trust.instantSub"],
            ] as const
          ).map(([tk, sk]) => (
            <li
              key={tk}
              className="rounded-2xl border border-line bg-surface px-4 py-4 text-center"
            >
              <p className="font-display text-base font-bold">{t(tk)}</p>
              <p className="mt-0.5 text-sm text-muted">{t(sk)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured converters */}
      <section id="tools" className="mx-auto max-w-5xl scroll-mt-20 px-5 pt-16">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("home.popular")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((slug) => (
            <ConverterCard key={slug} slug={slug} />
          ))}
        </div>
      </section>

      {/* Crop callout */}
      <section className="mx-auto max-w-5xl px-5 pt-6">
        <Link
          href="/crop/"
          className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-line bg-surface-2 p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="atmosphere opacity-70" />
          <div className="max-w-lg">
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
              {t("home.new")}
            </span>
            <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
              {t("home.cropTitle")}
            </h3>
            <p className="mt-2 text-muted">{t("home.cropDesc")}</p>
          </div>
          <span className="shrink-0 rounded-xl bg-ink px-5 py-3 font-medium text-bg transition-transform group-hover:-translate-y-0.5">
            {t("home.cropCta")}
          </span>
        </Link>
      </section>

      {/* All tools */}
      <section className="mx-auto max-w-5xl px-5 pt-16">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("home.all", { n: CONVERSIONS.length })}
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONVERSIONS.map((c) => {
            const slug = conversionSlug(c);
            return (
              <li key={slug}>
                <Link
                  href={`/${slug}/`}
                  className="group flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-line hover:bg-surface"
                >
                  <span className="font-medium">{FORMATS[c.from].label}</span>
                  <span className="text-accent">→</span>
                  <span className="font-medium">{FORMATS[c.to].label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("home.howto")}
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              ["01", "step.1t", "step.1d"],
              ["02", "step.2t", "step.2d"],
              ["03", "step.3t", "step.3d"],
            ] as const
          ).map(([n, tk, dk]) => (
            <li key={n} className="rounded-2xl border border-line bg-surface p-6">
              <span className="font-mono text-sm text-accent">{n}</span>
              <p className="mt-2 font-display text-lg font-bold">{t(tk)}</p>
              <p className="mt-1 text-sm text-muted">{t(dk)}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
