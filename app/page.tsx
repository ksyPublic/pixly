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

// Hero product visual — a mini photo-editor window so the toolkit reads as
// photo *editing* at a glance: a framed app with an edit toolbar (crop / rotate
// / adjust), a photo on the canvas under a live rule-of-thirds crop selection,
// and a bottom bar that spells out the convert step (HEIC → JPG · PNG · WebP).
// Pure inline SVG, token-coloured so it adapts to light/dark and scales down to
// mobile via the viewBox. Decorative — the surrounding copy carries the
// meaning — so it's aria-hidden. Any ambient motion reuses the shared
// pixly-crop-live / pixly-flow / pixly-arrive loops (reduced-motion-safe).
function HeroVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <clipPath id="pixly-hero-photo">
          <rect x="18" y="54" width="324" height="100" rx="12" />
        </clipPath>
      </defs>

      {/* Editor window frame */}
      <rect
        x="6"
        y="8"
        width="348"
        height="204"
        rx="18"
        strokeWidth="2"
        className="fill-surface stroke-line"
      />

      {/* Title bar: window dots (left) + edit toolbar (right) */}
      <g className="fill-line-strong">
        <circle cx="22" cy="26" r="3" />
        <circle cx="32" cy="26" r="3" />
        <circle cx="42" cy="26" r="3" />
      </g>

      {/* Crop tool button (active) */}
      <rect
        x="226"
        y="15"
        width="30"
        height="22"
        rx="8"
        strokeWidth="1.5"
        className="fill-accent-soft stroke-accent"
      />
      <g
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
      >
        <path d="M235 21 V31 H245" />
        <path d="M237 23 H247 V33" />
      </g>

      {/* Rotate tool button */}
      <rect
        x="266"
        y="15"
        width="30"
        height="22"
        rx="8"
        strokeWidth="1.5"
        className="fill-surface-2 stroke-line"
      />
      <g
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-muted"
      >
        <path d="M277 29 A 5.5 5.5 0 1 1 281 20.5" />
        <path d="M278.2 18.4 L281.6 20.4 L280 23.9" />
      </g>

      {/* Adjust (sliders) tool button */}
      <rect
        x="306"
        y="15"
        width="30"
        height="22"
        rx="8"
        strokeWidth="1.5"
        className="fill-surface-2 stroke-line"
      />
      <g strokeWidth="1.6" strokeLinecap="round" className="stroke-muted">
        <path d="M315 22.5 H327" />
        <path d="M315 29.5 H327" />
      </g>
      <g strokeWidth="1.4" className="fill-surface-2 stroke-muted">
        <circle cx="319" cy="22.5" r="1.9" />
        <circle cx="323" cy="29.5" r="1.9" />
      </g>

      {/* Title-bar divider */}
      <path d="M10 44 H350" strokeWidth="1.5" className="stroke-line" />

      {/* Photo canvas */}
      <g clipPath="url(#pixly-hero-photo)">
        <rect x="18" y="54" width="324" height="100" className="fill-accent-soft" />
        {/* Sun */}
        <circle cx="286" cy="82" r="13" className="fill-accent" />
        {/* Layered hills */}
        <path
          d="M18 154 L74 108 L128 136 L176 100 L232 130 L288 100 L342 134 L342 154 Z"
          className="fill-surface"
        />
        <path
          d="M18 154 L64 132 L118 148 L168 128 L226 150 L286 126 L342 146 L342 154 Z"
          className="fill-surface-2"
        />
        {/* Dim the area outside the crop selection (crop-UI letterboxing) */}
        <g className="fill-bg" opacity="0.5">
          <rect x="18" y="54" width="324" height="10" />
          <rect x="18" y="144" width="324" height="10" />
          <rect x="18" y="64" width="22" height="80" />
          <rect x="320" y="64" width="22" height="80" />
        </g>
        {/* Rule-of-thirds grid inside the crop selection */}
        <g strokeWidth="1" opacity="0.35" className="stroke-accent">
          <path d="M133.3 64 V144" />
          <path d="M226.7 64 V144" />
          <path d="M40 90.7 H320" />
          <path d="M40 117.3 H320" />
        </g>
      </g>

      {/* Crop selection border + corner brackets (breathe via pixly-crop-live) */}
      <rect
        x="40"
        y="64"
        width="280"
        height="80"
        strokeWidth="1.5"
        className="stroke-accent"
      />
      <g
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-accent pixly-crop-live"
      >
        <path d="M40 64 H54" />
        <path d="M40 64 V78" />
        <path d="M320 64 H306" />
        <path d="M320 64 V78" />
        <path d="M40 144 H54" />
        <path d="M40 144 V130" />
        <path d="M320 144 H306" />
        <path d="M320 144 V130" />
      </g>
      {/* Crop handles: 4 corners + 4 edge midpoints */}
      <g className="fill-accent pixly-crop-live">
        <rect x="37" y="61" width="6" height="6" rx="1.5" />
        <rect x="317" y="61" width="6" height="6" rx="1.5" />
        <rect x="37" y="141" width="6" height="6" rx="1.5" />
        <rect x="317" y="141" width="6" height="6" rx="1.5" />
        <rect x="177" y="61" width="6" height="6" rx="1.5" />
        <rect x="177" y="141" width="6" height="6" rx="1.5" />
        <rect x="37" y="101" width="6" height="6" rx="1.5" />
        <rect x="317" y="101" width="6" height="6" rx="1.5" />
      </g>

      {/* Convert bar — the source format flows into the chosen output formats */}
      <rect x="18" y="162" width="324" height="42" rx="13" className="fill-surface-2" />

      {/* Source format chip */}
      <rect
        x="60"
        y="172"
        width="48"
        height="22"
        rx="7"
        strokeWidth="1.5"
        className="fill-surface stroke-line"
      />
      <text
        x="84"
        y="186.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.4"
        className="fill-muted font-mono"
      >
        HEIC
      </text>

      {/* Convert arrow (drifts via pixly-flow) */}
      <g
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent pixly-flow"
      >
        <path d="M116 183 H136" />
        <path d="M130 178 L136 183 L130 188" />
      </g>

      {/* Selected output chip (settles via pixly-arrive) */}
      <rect
        x="144"
        y="172"
        width="44"
        height="22"
        rx="7"
        strokeWidth="1.5"
        className="fill-accent-soft stroke-accent pixly-arrive"
      />
      <text
        x="166"
        y="186.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.4"
        className="fill-accent font-mono"
      >
        JPG
      </text>

      {/* Alternate output chips */}
      <rect
        x="196"
        y="172"
        width="44"
        height="22"
        rx="7"
        strokeWidth="1.5"
        className="fill-surface stroke-line"
      />
      <text
        x="218"
        y="186.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.4"
        className="fill-muted font-mono"
      >
        PNG
      </text>
      <rect
        x="248"
        y="172"
        width="50"
        height="22"
        rx="7"
        strokeWidth="1.5"
        className="fill-surface stroke-line"
      />
      <text
        x="273"
        y="186.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.4"
        className="fill-muted font-mono"
      >
        WebP
      </text>
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
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
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
            className="rise mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted"
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
            className="rise mt-10 flex flex-col items-center gap-3"
            style={{ animationDelay: "280ms" }}
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {t("home.formatsLabel")}
            </span>
            <ul className="flex flex-wrap items-center justify-center gap-2">
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
          {/* Product visual — the finale of the hero sequence: it rises in
              just after the format chips (280ms → 340ms), then settles into a
              quiet ambient loop (crop handles breathe, arrow drifts to the
              result) defined on its SVG groups. */}
          <div
            className="rise mx-auto mt-12 w-full max-w-lg sm:mt-14"
            style={{ animationDelay: "340ms" }}
          >
            <HeroVisual className="h-auto w-full" />
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
