"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizedHref, useI18n } from "@/lib/i18n";

// Drop-in replacement for next/link that keeps internal navigation inside the
// active language: on English (/en/*) routes it prefixes string hrefs with /en,
// on Korean (default) routes it passes them through. Hash-only, external, and
// object hrefs are left untouched. Swap `import Link from "next/link"` for this
// in any client component that links between pages.
export default function LocaleLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const { locale } = useI18n();
  const localized =
    typeof href === "string" ? localizedHref(locale, href) : href;
  return <Link href={localized} {...props} />;
}
