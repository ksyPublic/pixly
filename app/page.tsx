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

// Hero brand artwork — an abstract "pixel dissolve". A bold tangerine disc
// (Pixly = pixels/images) whose right edge disintegrates into a modular grid of
// squares that shrink, fade and scatter into open space, ringed by two thin
// concentric arcs. No literal UI — mood and brand only. Pure token-coloured
// inline SVG (fill-accent / stroke-accent / stroke-line-strong / fill-line-strong)
// so it flips cleanly light↔dark and scales to mobile via the viewBox. The
// dissolving pixels breathe on a GPU-cheap, reduced-motion-safe opacity loop
// (.pixly-pixel in app/globals.css). Decorative → aria-hidden.
type HeroPixel = {
  x: number;
  y: number;
  s: number;
  o: number;
  outline: boolean;
  phase: number;
  core: boolean;
};

const HERO_CX = 150;
const HERO_CY = 120;
const HERO_R = 82;

// Deterministic (no randomness) pixel field: the right half of the disc, solid
// at the seam and dissolving radially outward into smaller, fainter, sparser
// squares. Size + opacity taper with distance; the outer bands thin to a
// checker, then a sparse trail.
const HERO_PIXELS: HeroPixel[] = (() => {
  const out: HeroPixel[] = [];
  const pitch = 20;
  for (let c = 0; c < 12; c++) {
    for (let r = 0; r < 9; r++) {
      const x = HERO_CX + c * pitch; // seam column at the centre, marching right
      const y = 40 + r * pitch;
      const dr = Math.hypot(x - HERO_CX, y - HERO_CY) / HERO_R; // 0 → 1 → beyond
      let keep = false;
      if (dr <= 1) keep = true; // the pixelated disc
      else if (dr <= 1.2) keep = (c + r) % 2 === 0; // checkered fray
      else if (dr <= 1.42) keep = (c + r) % 3 === 0; // sparse trailing
      if (!keep) continue;
      out.push({
        x,
        y,
        s: Math.max(4, 20 - dr * 12),
        o: Math.min(1, Math.max(0.16, 1.08 - dr * 0.72)),
        outline: dr > 1.05 && c % 2 === 1,
        phase: (c + r * 2) % 4,
        core: dr <= 0.55,
      });
    }
  }
  return out;
})();

// A few detached pixels drifting into the right-hand negative space —
// hand-placed for a deliberate, tapering trail (some solid, some wireframe).
const HERO_DRIFT: HeroPixel[] = [
  { x: 250, y: 96, s: 11, o: 0.5, outline: false, phase: 0, core: false },
  { x: 276, y: 134, s: 9, o: 0.4, outline: true, phase: 1, core: false },
  { x: 300, y: 108, s: 8, o: 0.32, outline: false, phase: 2, core: false },
  { x: 302, y: 152, s: 6, o: 0.26, outline: false, phase: 3, core: false },
  { x: 324, y: 126, s: 6, o: 0.22, outline: true, phase: 0, core: false },
  { x: 344, y: 114, s: 5, o: 0.16, outline: false, phase: 2, core: false },
];

const HERO_FIELD = [...HERO_PIXELS, ...HERO_DRIFT];

function HeroPixelRect({ px }: { px: HeroPixel }) {
  const half = px.s / 2;
  return (
    <rect
      x={px.x - half}
      y={px.y - half}
      width={px.s}
      height={px.s}
      rx={Math.min(1.6, px.s * 0.12)}
      opacity={px.o}
      strokeWidth={px.outline ? 1.4 : undefined}
      className={px.outline ? "fill-none stroke-accent" : "fill-accent"}
    />
  );
}

function HeroVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 380 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Solid focal mass = the left half of the disc, extended just past the
            centre so it backs the seam column and the dissolve reads cleanly. */}
        <clipPath id="pixly-hero-solid">
          <rect x="0" y="0" width="161" height="240" />
        </clipPath>
      </defs>

      {/* Editorial texture — a small neutral pixel cluster balances the top-left. */}
      <g className="fill-line-strong">
        {[34, 47].flatMap((cx) =>
          [44, 57, 70].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.7} />
          )),
        )}
      </g>

      {/* Concentric arcs hugging the dissolving side (echo + depth). */}
      <path
        d="M263.4 24.9 A148 148 0 0 1 263.4 215.1"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-line-strong"
      />
      <path
        d="M226.3 22.3 A124 124 0 0 1 226.3 217.7"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
        className="stroke-accent"
      />

      {/* Solid disc — left half. */}
      <circle
        cx={HERO_CX}
        cy={HERO_CY}
        r={HERO_R}
        clipPath="url(#pixly-hero-solid)"
        className="fill-accent"
      />

      {/* Solid core of the pixelated right half (steady, no breathing). */}
      <g>
        {HERO_FIELD.filter((p) => p.core).map((px) => (
          <HeroPixelRect key={`c-${px.x}-${px.y}`} px={px} />
        ))}
      </g>

      {/* Dissolving pixels — grouped by phase; each group breathes on a slightly
          different, offset loop so the edge shimmers rather than pulsing in
          sync. Group opacity multiplies with each pixel's own taper, so the
          static (reduced-motion) state keeps the intended fade. */}
      {[0, 1, 2, 3].map((phase) => (
        <g
          key={phase}
          className="pixly-pixel"
          style={
            {
              "--px-delay": `${phase * 0.6}s`,
              "--px-dur": `${4.2 + phase * 0.5}s`,
            } as CSSProperties
          }
        >
          {HERO_FIELD.filter((p) => !p.core && p.phase === phase).map((px) => (
            <HeroPixelRect key={`p-${px.x}-${px.y}`} px={px} />
          ))}
        </g>
      ))}
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
