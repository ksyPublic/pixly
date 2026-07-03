import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Converter from "@/components/Converter";
import { AdSlot } from "@/components/AdSense";
import {
  CONVERSIONS,
  FORMATS,
  conversionSlug,
  conversionTitle,
  getConversionBySlug,
  metaDescription,
  metaTitle,
} from "@/lib/conversions";

// Only the slugs we enumerate here are built. Anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return CONVERSIONS.map((c) => ({ slug: conversionSlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getConversionBySlug(slug);
  if (!c) return {};
  return {
    title: metaTitle(c),
    description: metaDescription(c),
    alternates: { canonical: `/${slug}/` },
  };
}

export default async function ConversionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getConversionBySlug(slug);
  if (!c) notFound();

  const fromLabel = FORMATS[c.from].label;
  const toLabel = FORMATS[c.to].label;

  // Related conversions for internal linking (SEO + navigation).
  const related = CONVERSIONS.filter(
    (o) => conversionSlug(o) !== slug && (o.from === c.from || o.to === c.to),
  ).slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {fromLabel} to {toLabel} Converter
      </h1>
      <p className="mt-3 text-black/60 dark:text-white/60">
        Free {fromLabel}&nbsp;→&nbsp;{toLabel} conversion that runs entirely in
        your browser. Your images are never uploaded to a server.
      </p>

      <div className="mt-8">
        <Converter from={c.from} to={c.to} />
      </div>

      {/* Trust badges */}
      <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-black/60 dark:text-white/60">
        {[
          ["100% private", "Files stay on your device"],
          ["No sign-up", "No account, no email"],
          ["Unlimited", "No file-count or size caps"],
        ].map(([title, sub]) => (
          <li
            key={title}
            className="rounded-xl border border-black/10 px-2 py-3 dark:border-white/10"
          >
            <p className="font-semibold text-black dark:text-white">{title}</p>
            <p className="mt-0.5">{sub}</p>
          </li>
        ))}
      </ul>

      {/* Ad slot — dormant until an AdSense publisher ID is configured. */}
      <AdSlot className="mt-10" />

      {/* Content section — real copy so the page isn't "thin" for AdSense/SEO. */}
      <section className="prose-sm mt-12 space-y-4 text-[15px] leading-relaxed text-black/70 dark:text-white/70">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          How to convert {fromLabel} to {toLabel}
        </h2>
        <ol className="ml-5 list-decimal space-y-1">
          <li>Drop your {fromLabel} file(s) into the box above, or click to browse.</li>
          <li>Pixly converts each one to {toLabel} instantly, right in your browser.</li>
          <li>Click <strong>Download</strong> to save the {toLabel} file.</li>
        </ol>

        <h2 className="pt-2 text-xl font-semibold text-black dark:text-white">
          Why convert {fromLabel} to {toLabel}?
        </h2>
        <p>{whyCopy(fromLabel, toLabel)}</p>

        <h2 className="pt-2 text-xl font-semibold text-black dark:text-white">
          Is it safe?
        </h2>
        <p>
          Yes. Unlike most online converters, Pixly never uploads your files.
          All processing happens locally using your browser&apos;s built-in
          image engine, so your photos never touch a server — which also makes
          it fast and works offline once loaded.
        </p>
      </section>

      {related.length > 0 && (
        <section className="mt-12 border-t border-black/10 pt-6 dark:border-white/10">
          <h2 className="mb-3 text-sm font-semibold text-black/50 dark:text-white/50">
            Related converters
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((o) => {
              const s = conversionSlug(o);
              return (
                <li key={s}>
                  <Link
                    href={`/${s}/`}
                    className="inline-block rounded-full border border-black/10 px-3 py-1 text-sm hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
                  >
                    {conversionTitle(o)}
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

function whyCopy(from: string, to: string): string {
  switch (from) {
    case "HEIC":
      return `HEIC is Apple's default photo format on iPhone and iPad. It saves space, but many apps, websites, and Windows PCs can't open it. Converting to ${to} gives you a universally compatible image you can share, upload, or edit anywhere.`;
    case "AVIF":
      return `AVIF is one of the newest and most efficient image formats, but support is still catching up — plenty of apps, editors, and older browsers can't open it yet. Converting to ${to} gives you a file that opens everywhere.`;
    case "GIF":
      return `GIF works everywhere, but its 256-color palette makes photos look banded and inflates file size. Converting a frame to ${to} restores full color and, for JPG or WebP, cuts the size down. Note: Pixly exports the first frame, not the animation.`;
    case "BMP":
      return `BMP images are uncompressed, which makes them needlessly large — often many times bigger than they need to be. Converting to ${to} shrinks the file dramatically with no visible loss in quality.`;
    case "TIFF":
      return `TIFF is a high-quality format used in printing, scanning, and archiving, but it's bulky and most web apps and phones won't display it. Converting to ${to} gives you a smaller image you can actually view and share.`;
    case "ICO":
      return `ICO is the Windows icon format. Converting to ${to} turns it into a normal image you can open, edit, or post anywhere.`;
    case "TGA":
      return `TGA (Targa) shows up in games and 3D tools, but everyday apps and browsers rarely open it. Converting to ${to} makes the image work everywhere.`;
    case "PSD":
      return `PSD is Photoshop's working format. Converting to ${to} gives you a flattened image anyone can open without Photoshop — the layers are merged into one picture.`;
  }
  if (to === "TIFF") {
    return `TIFF stores images with no compression loss, which is why print shops, scanners, and archives prefer it. Converting ${from} to TIFF gives you a high-quality master copy.`;
  }
  if (to === "ICO") {
    return `ICO is the format Windows uses for app icons and favicons. Converting ${from} to ICO gives you a ready-to-use icon file.`;
  }
  if (to === "WebP") {
    return `WebP produces smaller files than ${from} at similar quality, which means faster-loading pages and less bandwidth. Every modern browser supports it.`;
  }
  if (from === "WebP") {
    return `WebP is great for the web, but some older tools and apps don't support it. Converting to ${to} gives you a format that works everywhere.`;
  }
  return `Converting ${from} to ${to} changes how the image is stored to fit your needs — broader compatibility, smaller file size, or transparency support.`;
}
