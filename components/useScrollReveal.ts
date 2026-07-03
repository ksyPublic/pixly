"use client";

import { useEffect, type RefObject } from "react";

/**
 * useScrollReveal — the shared, site-wide scroll-entrance driver.
 *
 * Give the hook a ref to a container and mark any descendants you want to
 * animate with `data-reveal` + the `.reveal` class (see `app/globals.css`).
 * As each element scrolls into view it gets `.is-visible`, which plays the
 * shared `reveal-in` keyframe — the same soft ease-out / rise the hero uses
 * on load, so load and scroll motion read as one language. Per-item stagger
 * is expressed purely in CSS via the `--reveal-delay` custom property, so
 * this file carries no timing magic numbers.
 *
 * Reveals fire once (each element is unobserved after it shows) and honour
 * prefers-reduced-motion by revealing everything immediately with no motion.
 * The CSS already keeps `.reveal` visible under reduced-motion, so content is
 * never trapped at opacity 0 even if this effect never runs.
 */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;

    // Static final state, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) el.classList.add("is-visible");
      return;
    }

    // Defensive fallback: if IntersectionObserver is unavailable (or throws
    // on construction), reveal everything immediately so below-fold content
    // is never trapped at opacity 0. Uses the same `.is-visible` mechanism.
    let io: IntersectionObserver;
    try {
      if (!("IntersectionObserver" in window)) throw new Error("no IO");
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        },
        // Reveal a touch before the element is fully in view, and only once
        // a sliver has cleared the bottom edge, so it lands as you arrive.
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
      );
    } catch {
      for (const el of els) el.classList.add("is-visible");
      return;
    }

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);
}
