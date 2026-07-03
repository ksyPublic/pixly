import Link from "next/link";
import Logo from "./Logo";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Pixly home" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium">
          <NavLink href="/">Convert</NavLink>
          <NavLink href="/crop/">Crop</NavLink>
          <NavLink href="/about/">About</NavLink>
        </nav>
      </div>
    </header>
  );
}
