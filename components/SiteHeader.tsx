"use client";

import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-2.5 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:px-3"
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <Link href="/" aria-label="Pixly home" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium">
          <NavLink href="/">{t("nav.convert")}</NavLink>
          <NavLink href="/crop/">{t("nav.crop")}</NavLink>
          <span className="hidden sm:block">
            <NavLink href="/about/">{t("nav.about")}</NavLink>
          </span>
          <span className="mx-1 h-5 w-px bg-line" />
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
