"use client";

import Link from "@/components/LocaleLink";
import Logo from "./Logo";
import { useI18n } from "@/lib/i18n";

export default function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo className="[&_svg]:h-[1.15rem]" />
          <span>{t("footer.tagline")}</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/about/" className="transition-colors hover:text-ink">
            {t("footer.about")}
          </Link>
          <Link href="/privacy/" className="transition-colors hover:text-ink">
            {t("footer.privacy")}
          </Link>
          <Link href="/contact/" className="transition-colors hover:text-ink">
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
