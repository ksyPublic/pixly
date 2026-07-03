import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-black/50 sm:flex-row dark:text-white/50">
        <p>© {2026} Pixly · Private, in-browser image conversion.</p>
        <nav className="flex items-center gap-5">
          <Link href="/about/" className="hover:text-black dark:hover:text-white">
            About
          </Link>
          <Link href="/privacy/" className="hover:text-black dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/contact/" className="hover:text-black dark:hover:text-white">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
