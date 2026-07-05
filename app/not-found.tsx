"use client";

import Link from "@/components/LocaleLink";
import { useI18n } from "@/lib/i18n";

// 404 page. Rendered inside the root layout, so it inherits the header/footer
// and localizes from the URL (Korean by default; English on /en/* paths). As a
// static export this becomes /404.html, served by the host for unknown routes;
// the client re-localizes to match whatever URL was actually requested.
export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-mono text-sm font-semibold tracking-[0.3em] text-accent">
        {t("nf.code")}
      </p>
      <h1 className="mt-4 break-keep font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("nf.title")}
      </h1>
      <p className="mt-3 max-w-md break-keep leading-relaxed text-muted">
        {t("nf.desc")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-[0_8px_20px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5"
        >
          {t("nf.home")}
        </Link>
        <Link
          href="/#all-tools"
          className="rounded-xl border border-line-strong bg-surface px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {t("nf.browse")}
        </Link>
      </div>
    </main>
  );
}
