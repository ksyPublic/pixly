"use client";

import { useEffect } from "react";
import Link from "@/components/LocaleLink";
import { useI18n } from "@/lib/i18n";

// Route-level error boundary for unexpected runtime errors. Rendered inside the
// root layout, so it keeps the header/footer and localizes from the URL. Since
// all image processing is client-side, `reset()` simply re-renders the route.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    // Local only — nothing is ever sent anywhere.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="break-keep font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("err.title")}
      </h1>
      <p className="mt-3 max-w-md break-keep leading-relaxed text-muted">
        {t("err.desc")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-[0_8px_20px_-8px_var(--accent)] transition-transform hover:-translate-y-0.5"
        >
          {t("err.retry")}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-line-strong bg-surface px-6 py-3 font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          {t("err.home")}
        </Link>
      </div>
    </main>
  );
}
