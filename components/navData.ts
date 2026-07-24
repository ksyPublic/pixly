// Shared navigation model for the site header (desktop horizontal categories +
// mobile panel). One source of truth for hrefs, i18n label keys, and
// route-active detection so the desktop and mobile menus never drift apart.

import type { TKey } from "@/lib/i18n";
import { CONVERSIONS, FORMATS, getConversionBySlug } from "@/lib/conversions";

export interface NavItem {
  href: string;
  /** i18n key for the localized label. */
  labelKey: TKey;
}

export interface LinkItem {
  href: string;
  /** Language-neutral label (e.g. a format arrow) — no i18n key needed. */
  label: string;
}

// Featured converters surfaced at the top of the Tools menu. Labels are derived
// from FORMATS (language-neutral "FROM → TO") and hrefs point at the generated
// /<from>-to-<to>/ landing pages. Any slug missing from CONVERSIONS is skipped,
// so this can never link to a page that doesn't exist.
const FEATURED_SLUGS = [
  "heic-to-jpg",
  "png-to-jpg",
  "png-to-webp",
  "webp-to-jpg",
  "heic-to-png",
  "avif-to-jpg",
] as const;

export const FEATURED_CONVERSIONS: LinkItem[] = FEATURED_SLUGS.flatMap((slug) => {
  const c = getConversionBySlug(slug);
  if (!c) return [];
  return [
    { href: `/${slug}/`, label: `${FORMATS[c.from].label} → ${FORMATS[c.to].label}` },
  ];
});

// Total converter count — drives the localized "see all converters" link.
export const CONVERSION_COUNT = CONVERSIONS.length;

// Anchor to the full 27-item converter grid on the home page (the "All tools"
// section — NOT the shorter "Popular" section at #tools).
export const ALL_TOOLS_HREF = "/#all-tools";

// Standalone editing tools (each its own page).
export const EDIT_LINKS: NavItem[] = [
  { href: "/compress/", labelKey: "nav.compress" },
  { href: "/crop/", labelKey: "nav.crop" },
  { href: "/video/", labelKey: "nav.video" },
];

// PDF tools. Labels are format arrows (language-neutral), so no i18n keys.
export const PDF_LINKS: LinkItem[] = [
  { href: "/jpg-to-pdf/", label: "JPG → PDF" },
  { href: "/png-to-pdf/", label: "PNG → PDF" },
  { href: "/pdf-to-jpg/", label: "PDF → JPG" },
  { href: "/pdf-to-png/", label: "PDF → PNG" },
];

// FAQ — its own top-level nav entry (a single dedicated /faq page, deliberately
// NOT repeated on every tool page). "FAQ" reads the same in ko + en, so no key.
export const FAQ_LINK: LinkItem = { href: "/faq/", label: "FAQ" };

// Info pages (surfaced in the mobile panel; desktop keeps them in the footer).
export const INFO_LINKS: NavItem[] = [
  { href: "/about/", labelKey: "nav.about" },
  { href: "/privacy/", labelKey: "footer.privacy" },
  { href: "/contact/", labelKey: "footer.contact" },
];

// The app uses `trailingSlash: true`, so usePathname() returns e.g. "/compress/".
// Normalize by trimming a single trailing slash (never the root "/").
export function normalizePath(path: string): string {
  if (!path) return "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isRouteActive(pathname: string, href: string): boolean {
  return normalizePath(pathname) === normalizePath(href);
}

// The PDF group reads as active on any /*-to-pdf or /pdf-to-* route.
export function isPdfActive(pathname: string): boolean {
  const p = normalizePath(pathname);
  return /-to-pdf$/.test(p) || /^\/pdf-to-/.test(p);
}

// The 변환 (Convert) trigger reads as active on any image-converter landing page
// (e.g. /heic-to-jpg/), but NOT on PDF routes, /compress, or /crop — each of
// those has its own top-level nav entry.
export function isConvertActive(pathname: string): boolean {
  if (isPdfActive(pathname)) return false;
  const p = normalizePath(pathname);
  if (p === "/compress" || p === "/crop" || p === "/video") return false;
  return getConversionBySlug(p.replace(/^\//, "")) !== undefined;
}

// The Tools trigger reads as active on ANY tool route: a converter landing page,
// /compress, /crop, or any PDF route. The home page and info pages stay inactive.
export function isToolsActive(pathname: string): boolean {
  const p = normalizePath(pathname);
  if (p === "/compress" || p === "/crop" || p === "/video") return true;
  if (isPdfActive(pathname)) return true;
  return getConversionBySlug(p.replace(/^\//, "")) !== undefined;
}
