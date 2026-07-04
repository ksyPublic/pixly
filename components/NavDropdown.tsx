"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// A single role="menuitem" link inside a NavDropdown panel. The active route
// gets the tangerine pill. Closing on click is handled by the panel (it watches
// for any anchor click), so items don't need an onSelect callback.
export function NavMenuLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
        active
          ? "bg-accent-soft text-accent"
          : "text-ink hover:bg-surface-2 hover:text-accent"
      } ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

// Reusable desktop nav dropdown (≥ sm), used for 변환 and PDF. Controlled: the
// parent owns `open`/`onOpenChange` so only ONE dropdown can be open at a time
// (opening one closes the other). The <button> trigger owns
// aria-haspopup="menu"/aria-expanded; the panel is a role="menu" holding
// role="menuitem" links. It closes on Escape (focus returns to the trigger),
// outside pointerdown, and any item (anchor) click inside — the last case also
// covers same-page anchor links, where the route never changes. The panel stays
// mounted and is toggled with opacity/transform so it animates both ways;
// `inert` keeps its links out of the tab order and a11y tree while hidden.
// Motion is gated by motion-reduce:* so it snaps under prefers-reduced-motion.
export default function NavDropdown({
  label,
  active,
  open,
  onOpenChange,
  menuLabel,
  panelClassName,
  children,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name for the menu panel (defaults to `label`). */
  menuLabel?: string;
  /** Extra classes for the panel (e.g. width). */
  panelClassName?: string;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside pointerdown + Escape only matter while open.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
          active || open
            ? "bg-accent-soft text-accent"
            : "text-muted hover:bg-surface-2 hover:text-ink"
        }`}
      >
        {label}
        <ChevronDown
          className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        inert={!open}
        role="menu"
        aria-label={menuLabel ?? label}
        // Any click landing on (or inside) an anchor is an item selection — close
        // the panel. This is what dismisses the menu for same-page anchor links
        // (e.g. the "all tools" jump), where the route change never fires.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onOpenChange(false);
        }}
        className={`absolute left-0 top-full z-50 mt-2 origin-top-left rounded-2xl border border-line bg-surface p-2 shadow-[var(--shadow)] transition duration-150 ease-out motion-reduce:transition-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        } ${panelClassName ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}
