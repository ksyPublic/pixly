"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NavDropdown, { NavMenuLink } from "./NavDropdown";
import { useI18n } from "@/lib/i18n";
import {
  ALL_TOOLS_HREF,
  CONVERSION_COUNT,
  EDIT_LINKS,
  FAQ_LINK,
  FEATURED_CONVERSIONS,
  INFO_LINKS,
  PDF_LINKS,
  isConvertActive,
  isPdfActive,
  isRouteActive,
} from "./navData";

// Which top-level dropdown is open. Only one at a time — opening 변환 closes PDF.
type OpenMenu = "convert" | "pdf" | null;

// Plain top-level nav link (압축 / 자르기) styled to match the dropdown triggers.
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
        active
          ? "bg-accent-soft text-accent"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

// Grouped section inside the mobile panel.
function MobileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="py-2">
      <p className="px-3 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted">
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  active,
  innerRef,
  onNavigate,
  className,
  children,
}: {
  href: string;
  active: boolean;
  innerRef?: Ref<HTMLAnchorElement>;
  onNavigate: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      ref={innerRef}
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors motion-reduce:transition-none ${
        active
          ? "bg-accent-soft text-accent"
          : "text-ink hover:bg-surface-2 hover:text-accent"
      } ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

// Morphing ☰ ⇄ ✕ built from three bars. Only transform/opacity animate, and
// motion-reduce:* snaps the change instantly.
function MenuIcon({ open }: { open: boolean }) {
  const bar =
    "absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden className="relative block h-4 w-5">
      <span
        className={`${bar} transition-transform duration-200 ${
          open ? "rotate-45" : "-translate-y-[5px]"
        }`}
      />
      <span
        className={`${bar} transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`${bar} transition-transform duration-200 ${
          open ? "-rotate-45" : "translate-y-[5px]"
        }`}
      />
    </span>
  );
}

export default function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Close menus on navigation. Handled during render (previous-value pattern)
  // instead of an effect, so nothing flashes on the new route. Same-page anchor
  // links (e.g. #all-tools) don't change the path — those close via each menu's
  // own item-click handler.
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  // While the mobile panel is open: move focus to the first link, and let Escape
  // close it (returning focus to the hamburger).
  useEffect(() => {
    if (!mobileOpen) return;
    firstLinkRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const convertActive = isConvertActive(pathname);
  const pdfActive = isPdfActive(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-5">
        {/* Left cluster: logo + horizontal named categories. */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            aria-label="Pixly home"
            className="transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="ml-1 hidden items-center gap-0.5 sm:flex"
          >
            {/* 변환 ▾ — featured converters + a link to the full home grid. */}
            <NavDropdown
              label={t("nav.convert")}
              active={convertActive}
              open={openMenu === "convert"}
              onOpenChange={(o) => setOpenMenu(o ? "convert" : null)}
              panelClassName="w-[min(24rem,calc(100vw-1.5rem))]"
            >
              <div className="grid grid-cols-2 gap-0.5">
                {FEATURED_CONVERSIONS.map((l) => (
                  <NavMenuLink
                    key={l.href}
                    href={l.href}
                    active={isRouteActive(pathname, l.href)}
                  >
                    {l.label}
                  </NavMenuLink>
                ))}
              </div>
              <NavMenuLink
                href={ALL_TOOLS_HREF}
                active={false}
                className="mt-0.5 flex items-center justify-between border-t border-line pt-2 text-muted hover:text-accent"
              >
                {t("home.all", { n: CONVERSION_COUNT })}
                <span aria-hidden className="text-accent">
                  →
                </span>
              </NavMenuLink>
            </NavDropdown>

            {/* PDF ▾ — the four PDF tools. */}
            <NavDropdown
              label={t("nav.pdf")}
              active={pdfActive}
              open={openMenu === "pdf"}
              onOpenChange={(o) => setOpenMenu(o ? "pdf" : null)}
              panelClassName="w-[min(18rem,calc(100vw-1.5rem))]"
            >
              <div className="grid grid-cols-2 gap-0.5">
                {PDF_LINKS.map((l) => (
                  <NavMenuLink
                    key={l.href}
                    href={l.href}
                    active={isRouteActive(pathname, l.href)}
                  >
                    {l.label}
                  </NavMenuLink>
                ))}
              </div>
            </NavDropdown>

            {/* 압축 / 자르기 — plain top-level links. */}
            {EDIT_LINKS.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                active={isRouteActive(pathname, l.href)}
              >
                {t(l.labelKey)}
              </NavLink>
            ))}

            {/* FAQ — its own top-level entry. */}
            <NavLink
              href={FAQ_LINK.href}
              active={isRouteActive(pathname, FAQ_LINK.href)}
            >
              {FAQ_LINK.label}
            </NavLink>
          </nav>
        </div>

        {/* Right cluster: divider + toggles (+ hamburger on mobile). */}
        <div className="flex items-center gap-0.5">
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

          {/* Toggles are visible at every breakpoint. */}
          <LanguageToggle />
          <ThemeToggle />

          <button
            ref={hamburgerRef}
            type="button"
            aria-label={mobileOpen ? t("nav.close") : t("nav.menu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile panel — overlays content just below the sticky bar (absolute, so
          it never shifts the page). Stays mounted; toggled with opacity/transform
          and `inert` for correct focus/AT behavior while hidden. Mirrors the
          desktop categories: 변환, PDF, 압축·자르기, then an Info group. */}
      <div
        id="mobile-menu"
        inert={!mobileOpen}
        className={`absolute inset-x-0 top-full origin-top border-b border-line bg-bg shadow-[var(--shadow)] transition duration-200 ease-out motion-reduce:transition-none sm:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto max-h-[calc(100dvh-4rem)] max-w-5xl divide-y divide-line overflow-y-auto px-4 py-2"
        >
          {/* 변환 — featured converters + a link to the full home grid. */}
          <MobileSection title={t("nav.convert")}>
            {FEATURED_CONVERSIONS.map((l, i) => (
              <MobileLink
                key={l.href}
                href={l.href}
                active={isRouteActive(pathname, l.href)}
                innerRef={i === 0 ? firstLinkRef : undefined}
                onNavigate={closeMobile}
              >
                {l.label}
              </MobileLink>
            ))}
            <MobileLink
              href={ALL_TOOLS_HREF}
              active={false}
              onNavigate={closeMobile}
              className="flex items-center justify-between text-muted hover:text-accent"
            >
              {t("home.all", { n: CONVERSION_COUNT })}
              <span aria-hidden className="text-accent">
                →
              </span>
            </MobileLink>
          </MobileSection>

          {/* PDF — the four PDF tools. */}
          <MobileSection title={t("nav.pdf")}>
            {PDF_LINKS.map((l) => (
              <MobileLink
                key={l.href}
                href={l.href}
                active={isRouteActive(pathname, l.href)}
                onNavigate={closeMobile}
              >
                {l.label}
              </MobileLink>
            ))}
          </MobileSection>

          {/* 압축 / 자르기 — standalone editing tools (no heading needed). */}
          <div className="flex flex-col py-2">
            {EDIT_LINKS.map((l) => (
              <MobileLink
                key={l.href}
                href={l.href}
                active={isRouteActive(pathname, l.href)}
                onNavigate={closeMobile}
              >
                {t(l.labelKey)}
              </MobileLink>
            ))}
          </div>

          {/* 정보 — FAQ / 소개 / 개인정보 / 문의. */}
          <MobileSection title={t("nav.info")}>
            <MobileLink
              href={FAQ_LINK.href}
              active={isRouteActive(pathname, FAQ_LINK.href)}
              onNavigate={closeMobile}
            >
              {FAQ_LINK.label}
            </MobileLink>
            {INFO_LINKS.map((l) => (
              <MobileLink
                key={l.href}
                href={l.href}
                active={isRouteActive(pathname, l.href)}
                onNavigate={closeMobile}
              >
                {t(l.labelKey)}
              </MobileLink>
            ))}
          </MobileSection>
        </nav>
      </div>
    </header>
  );
}
