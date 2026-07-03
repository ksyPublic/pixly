"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <button
      onClick={() => setLocale(locale === "ko" ? "en" : "ko")}
      aria-label="Switch language"
      className="rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {locale === "ko" ? "EN" : "KO"}
    </button>
  );
}
