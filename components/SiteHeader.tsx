import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-sm text-white">
            P
          </span>
          <span className="text-lg tracking-tight">Pixly</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-black/60 dark:text-white/60">
          <Link href="/" className="hover:text-black dark:hover:text-white">
            All tools
          </Link>
          <Link href="/about/" className="hover:text-black dark:hover:text-white">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
