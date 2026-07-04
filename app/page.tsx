"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { CONVERSIONS, FORMATS, conversionSlug } from "@/lib/conversions";
import { useI18n } from "@/lib/i18n";
import { useScrollReveal } from "@/components/useScrollReveal";
import HeroMotion from "@/components/HeroMotion";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

// Per-item reveal stagger, expressed through the shared `--reveal-stagger`
// token so the cascade step lives in one place (app/globals.css).
// `stepDelay` runs a cascade across a small group; `rowDelay` staggers by
// column so long grids reveal each row promptly instead of trailing.
function stepDelay(i: number, cap = 6): CSSProperties {
  const n = i < cap ? i : cap;
  return { "--reveal-delay": `calc(var(--reveal-stagger) * ${n})` } as CSSProperties;
}
function rowDelay(i: number, cols = 3): CSSProperties {
  return { "--reveal-delay": `calc(var(--reveal-stagger) * ${i % cols})` } as CSSProperties;
}

const FEATURED = [
  "heic-to-jpg",
  "png-to-webp",
  "heic-to-png",
  "webp-to-jpg",
  "png-to-jpg",
  "avif-to-jpg",
];

const FORMAT_CHIPS = ["HEIC", "AVIF", "PNG", "JPG", "WebP", "TIFF", "GIF", "ICO", "PSD"];

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

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Hero visual — a layered photo showcase (CapCut-style): two overlapping, tilted
// image cards with rich gradient scenes standing in for real photos, the front
// one wearing a tangerine crop frame, plus HEIC→JPG badges — the convert + crop
// story at a glance. Photo CONTENT uses vivid fixed-colour gradients (photos
// aren't theme-dependent); the card frames, crop UI and badges use tokens
// (fill-surface / stroke-line / stroke-accent / fill-accent) so the chrome
// adapts light↔dark. Soft drop shadows for depth; the crop handles breathe on
// the shared reduced-motion-safe loop (.pixly-crop-live). Decorative → aria-hidden.
function HeroVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="pixly-ph-cool" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#8B7DF6" />
          <stop offset="0.55" stopColor="#C06BC9" />
          <stop offset="1" stopColor="#F6A98C" />
        </linearGradient>
        <linearGradient id="pixly-ph-warm" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#FFDF9E" />
          <stop offset="0.5" stopColor="#FF9F4A" />
          <stop offset="1" stopColor="#FF5E3A" />
        </linearGradient>
        <filter id="pixly-ph-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#141821" floodOpacity="0.22" />
        </filter>
        <clipPath id="pixly-clip-a">
          <rect x="0" y="0" width="228" height="168" rx="18" />
        </clipPath>
        <clipPath id="pixly-clip-b">
          <rect x="0" y="0" width="252" height="188" rx="18" />
        </clipPath>
      </defs>

      {/* Soft ambient glow. */}
      <ellipse cx="300" cy="240" rx="250" ry="190" opacity="0.7" className="fill-accent-soft" />

      {/* Card A — back (cool dusk), tilted right. */}
      <g transform="translate(288 30) rotate(7)" filter="url(#pixly-ph-shadow)">
        <rect x="-10" y="-10" width="248" height="188" rx="24" className="fill-surface" />
        <g clipPath="url(#pixly-clip-a)">
          <rect width="228" height="168" fill="url(#pixly-ph-cool)" />
          <circle cx="58" cy="56" r="26" fill="#ffffff" opacity="0.85" />
          <path d="M0 168 L58 120 L108 150 L162 108 L228 154 L228 168 Z" fill="#3a2d6b" opacity="0.5" />
          <path d="M0 168 L46 142 L120 168 Z" fill="#241a4d" opacity="0.5" />
        </g>
        <rect x="0" y="0" width="228" height="168" rx="18" strokeWidth="1.5" className="fill-none stroke-line" />
        <g transform="translate(12 12)">
          <rect width="58" height="26" rx="8" className="fill-surface" />
          <text x="29" y="18" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-muted font-mono">HEIC</text>
        </g>
      </g>

      {/* Card B — front (warm golden), tilted left, wearing the crop frame. */}
      <g transform="translate(44 150) rotate(-5)" filter="url(#pixly-ph-shadow)">
        <rect x="-11" y="-11" width="274" height="210" rx="26" className="fill-surface" />
        <g clipPath="url(#pixly-clip-b)">
          <rect width="252" height="188" fill="url(#pixly-ph-warm)" />
          <circle cx="190" cy="58" r="30" fill="#ffffff" opacity="0.9" />
          <path d="M0 188 L70 130 L120 162 L182 118 L252 166 L252 188 Z" fill="#b23a1e" opacity="0.5" />
          <path d="M0 188 L58 158 L140 188 Z" fill="#8f2d16" opacity="0.5" />
        </g>
        {/* Crop overlay — rule of thirds + corner brackets + handles. */}
        <g strokeWidth="1" opacity="0.5" className="stroke-accent">
          <path d="M84 8 V180" />
          <path d="M168 8 V180" />
          <path d="M8 63 H244" />
          <path d="M8 125 H244" />
        </g>
        <g strokeWidth="4" strokeLinecap="round" className="stroke-accent pixly-crop-live">
          <path d="M8 24 V8 H24" />
          <path d="M228 8 H244 V24" />
          <path d="M8 164 V180 H24" />
          <path d="M244 164 V180 H228" />
        </g>
        <g className="fill-accent pixly-crop-live">
          <rect x="4" y="4" width="8" height="8" rx="2" />
          <rect x="240" y="4" width="8" height="8" rx="2" />
          <rect x="4" y="176" width="8" height="8" rx="2" />
          <rect x="240" y="176" width="8" height="8" rx="2" />
        </g>
        <rect x="0" y="0" width="252" height="188" rx="18" strokeWidth="1.5" className="fill-none stroke-line" />
        <g transform="translate(182 152)">
          <rect width="54" height="26" rx="8" className="fill-accent" />
          <text x="27" y="18" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff" className="font-mono">JPG</text>
        </g>
      </g>
    </svg>
  );
}

// Simple line icons (Lucide-style) so the benefits read at a glance.
function BenefitIcon({ name, className }: { name: string; className?: string }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className}>
      {name === "shield" && (
        <>
          <path
            {...p}
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"
          />
          <path {...p} d="m9 12 2 2 4-4" />
        </>
      )}
      {name === "user" && (
        <>
          <path {...p} d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle {...p} cx="12" cy="7" r="4" />
        </>
      )}
      {name === "infinity" && (
        <path
          {...p}
          d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z"
        />
      )}
      {name === "bolt" && <path {...p} d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />}
    </svg>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="reveal max-w-2xl" data-reveal>
      <span aria-hidden className="mb-3 block h-1 w-9 rounded-full bg-accent" />
      <h2 className="break-keep font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
        {title}
      </h2>
      {sub && <p className="mt-2 break-keep leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

function ConverterCard({ slug }: { slug: string }) {
  const c = CONVERSIONS.find((x) => conversionSlug(x) === slug);
  if (!c) return null;
  return (
    <Link
      href={`/${slug}/`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 shadow-[var(--shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_40px_-22px_var(--accent)]"
    >
      <span className="flex items-center gap-2.5 font-display text-lg font-bold">
        {FORMATS[c.from].label}
        <Arrow />
        {FORMATS[c.to].label}
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
        <Chevron />
      </span>
    </Link>
  );
}

// PDF tools — keyword-targeted static pages, surfaced here for discovery +
// internal linking. Titles are format names (universal); descriptions are
// localized via the pdf.* dictionary.
const PDF_TOOLS_HOME = [
  { slug: "jpg-to-pdf", from: "JPG", to: "PDF", descKey: "pdf.cardJpgToPdf" },
  { slug: "png-to-pdf", from: "PNG", to: "PDF", descKey: "pdf.cardPngToPdf" },
  { slug: "pdf-to-jpg", from: "PDF", to: "JPG", descKey: "pdf.cardPdfToJpg" },
  { slug: "pdf-to-png", from: "PDF", to: "PNG", descKey: "pdf.cardPdfToPng" },
] as const;

function PdfToolCard({
  slug,
  from,
  to,
  desc,
}: {
  slug: string;
  from: string;
  to: string;
  desc: string;
}) {
  return (
    <Link
      href={`/${slug}/`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 shadow-[var(--shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_40px_-22px_var(--accent)]"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2.5 font-display text-lg font-bold">
          {from}
          <Arrow />
          {to}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted">{desc}</span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
        <Chevron />
      </span>
    </Link>
  );
}

export default function Home() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLElement>(null);
  useScrollReveal(rootRef);
  return (
    <main ref={rootRef} className="flex-1">
      <JsonLd
        data={[
          webSiteSchema("Pixly", SITE_URL),
          organizationSchema("Pixly", SITE_URL),
        ]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroMotion />
        <div className="dotgrid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-14 pt-14 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pb-24 lg:pt-24">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <span className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-[13px] font-medium text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              {t("home.eyebrow")}
            </span>
            <h1
              className="rise mt-6 break-keep font-display text-[2.7rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ animationDelay: "60ms" }}
            >
              {t("home.h1a")}
              <br />
              <span className="text-accent">{t("home.h1b")}</span>
            </h1>
            <p
              className="rise mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted lg:mx-0"
              style={{ animationDelay: "120ms" }}
            >
              {t("home.sub")}
            </p>
            <div
              className="rise mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              style={{ animationDelay: "180ms" }}
            >
              <a
                href="#tools"
                className="rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-[0_8px_20px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5"
              >
                {t("home.ctaBrowse")}
              </a>
              <Link
                href="/crop/"
                className="rounded-xl border border-line-strong bg-surface px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {t("home.ctaCrop")}
              </Link>
            </div>
            <p
              className="rise mt-5 text-[13px] text-muted"
              style={{ animationDelay: "220ms" }}
            >
              {t("home.heroReassure")}
            </p>
            <div
              className="rise mt-8 flex flex-col items-center gap-3 lg:items-start"
              style={{ animationDelay: "280ms" }}
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t("home.formatsLabel")}
              </span>
              <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {FORMAT_CHIPS.map((f) => (
                  <li
                    key={f}
                    className="rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs font-medium text-muted"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — layered photo showcase; bleeds toward the edge on desktop. */}
          <div
            className="rise relative mt-2 lg:-mr-6 lg:mt-0 xl:-mr-16"
            style={{ animationDelay: "200ms" }}
          >
            <HeroVisual className="mx-auto h-auto w-full max-w-xl lg:max-w-none" />
          </div>
        </div>
      </section>

      {/* Why Pixly — benefits */}
      <section className="mx-auto max-w-5xl px-5 pt-16 sm:pt-24">
        <SectionHead title={t("home.why")} sub={t("home.whySub")} />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["shield", "trust.private", "trust.privateSub"],
              ["user", "trust.nosignup", "trust.nosignupSub"],
              ["infinity", "trust.unlimited", "trust.unlimitedSub"],
              ["bolt", "trust.instant", "trust.instantSub"],
            ] as const
          ).map(([icon, tk, sk], i) => (
            <li
              key={tk}
              data-reveal
              style={stepDelay(i)}
              className="reveal rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow)] transition-colors hover:border-line-strong sm:p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-accent/15">
                <BenefitIcon name={icon} />
              </span>
              <p className="mt-4 font-display text-lg font-bold">{t(tk)}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(sk)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular conversions */}
      <section id="tools" className="mx-auto max-w-5xl scroll-mt-20 px-5 pt-16 sm:pt-24">
        <SectionHead title={t("home.popular")} sub={t("home.popularSub")} />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((slug, i) => (
            <div key={slug} className="reveal" data-reveal style={stepDelay(i)}>
              <ConverterCard slug={slug} />
            </div>
          ))}
        </div>
      </section>

      {/* Crop callout — the standout mid-page CTA */}
      <section className="reveal mx-auto max-w-5xl px-5 pt-16 sm:pt-24" data-reveal>
        <Link
          href="/crop/"
          className="group relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl border border-line bg-surface-2 p-7 shadow-[var(--shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="atmosphere opacity-90" />
          {/* Crop-mark corners — a signature nod to the tool. */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-5 top-5 hidden h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-accent/40 transition-colors group-hover:border-accent sm:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-5 top-5 hidden h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-accent/40 transition-colors group-hover:border-accent sm:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-5 left-5 hidden h-5 w-5 rounded-bl-md border-b-2 border-l-2 border-accent/40 transition-colors group-hover:border-accent sm:block"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-5 right-5 hidden h-5 w-5 rounded-br-md border-b-2 border-r-2 border-accent/40 transition-colors group-hover:border-accent sm:block"
          />
          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {t("home.new")}
            </span>
            <h3 className="mt-3 break-keep font-display text-2xl font-extrabold tracking-tight sm:text-[1.9rem]">
              {t("home.cropTitle")}
            </h3>
            <p className="mt-2.5 break-keep leading-relaxed text-muted">{t("home.cropDesc")}</p>
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-5 py-3 font-semibold text-bg shadow-[var(--shadow)] transition-transform group-hover:-translate-y-0.5">
            {t("home.cropCta")}
            <Chevron className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {/* PDF tools */}
      <section className="mx-auto max-w-5xl px-5 pt-16 sm:pt-24">
        <SectionHead title={t("pdf.homeTitle")} sub={t("pdf.homeSub")} />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2">
          {PDF_TOOLS_HOME.map((tool, i) => (
            <div key={tool.slug} className="reveal" data-reveal style={stepDelay(i)}>
              <PdfToolCard
                slug={tool.slug}
                from={tool.from}
                to={tool.to}
                desc={t(tool.descKey)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 pt-16 sm:pt-24">
        <SectionHead title={t("home.howto")} />
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-3">
          {(
            [
              ["1", "step.1t", "step.1d"],
              ["2", "step.2t", "step.2d"],
              ["3", "step.3t", "step.3d"],
            ] as const
          ).map(([n, tk, dk], i) => (
            <li
              key={n}
              data-reveal
              style={stepDelay(i)}
              className="reveal relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-3 select-none font-display text-[5.5rem] font-extrabold leading-none text-line-strong"
              >
                {n}
              </span>
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-base font-bold text-white ring-4 ring-accent-soft">
                {n}
              </span>
              <p className="relative mt-4 font-display text-lg font-bold">{t(tk)}</p>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{t(dk)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* All tools */}
      <section
        id="all-tools"
        className="mx-auto max-w-5xl scroll-mt-20 px-5 pb-20 pt-16 sm:pb-28 sm:pt-24"
      >
        <SectionHead title={t("home.all", { n: CONVERSIONS.length })} />
        <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {CONVERSIONS.map((c, i) => {
            const slug = conversionSlug(c);
            return (
              <li key={slug} className="reveal" data-reveal style={rowDelay(i)}>
                <Link
                  href={`/${slug}/`}
                  className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--shadow)]"
                >
                  <span className="flex items-center gap-2 text-[15px] font-medium">
                    {FORMATS[c.from].label}
                    <span aria-hidden className="text-accent">
                      →
                    </span>
                    {FORMATS[c.to].label}
                  </span>
                  <Chevron className="-translate-x-1 text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
