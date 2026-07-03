"use client";

import Converter from "@/components/Converter";
import { useI18n } from "@/lib/i18n";

/**
 * Home-page "start here" entry point. Wraps the existing {@link Converter} in a
 * hero-appropriate card so a first-time visitor can drop and convert an image
 * without leaving the landing page. Purely presentational — all conversion
 * logic (source auto-detect, target picker, quality/size, ZIP) lives inside
 * `Converter`. `heic → jpg` is just a sensible default for the #1 use case;
 * the converter re-detects the real source of whatever file is dropped.
 */
export default function HomeConverter({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-line bg-surface-2 p-6 shadow-[var(--shadow)] sm:p-8 ${
        className ?? ""
      }`}
    >
      <div className="mb-6 max-w-xl sm:mb-7">
        <span aria-hidden className="mb-3 block h-1 w-9 rounded-full bg-accent" />
        <h2 className="break-keep font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
          {t("home.startTitle")}
        </h2>
        <p className="mt-2 break-keep leading-relaxed text-muted">
          {t("home.startSub")}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 shadow-[var(--shadow)] sm:p-6">
        <Converter from="heic" to="jpg" />
      </div>
    </section>
  );
}
