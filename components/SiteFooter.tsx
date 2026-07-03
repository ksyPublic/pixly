import Link from "next/link";
import { LogoMark } from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <LogoMark className="h-5 w-5" />
          <span>© 2026 Pixly · Private, in-browser image tools.</span>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/about/" className="transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/privacy/" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link href="/contact/" className="transition-colors hover:text-ink">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
