"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { otherLocaleHref, useI18n } from "@/lib/i18n";

// Language is chosen by URL (Korean at /*, English at /en/*), so switching
// languages navigates to the current page's mirror rather than flipping client
// state. The label shows the language you'll switch TO.
export default function LanguageToggle() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const target = otherLocaleHref(pathname);
  const other = locale === "ko" ? "en" : "ko";
  return (
    <Link
      href={target}
      hrefLang={other}
      aria-label="Switch language"
      className="rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {locale === "ko" ? "EN" : "KO"}
    </Link>
  );
}
