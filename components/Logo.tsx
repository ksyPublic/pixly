// Pixly logo — a wordmark-only brand.
//
// No app-tile icon: the mark IS the word. "Pixly" is drawn as confident,
// humanist geometric lettering — the caps/x-height are kept comfortably short
// relative to the glyph widths so the word reads balanced, not condensed or
// stretched. Letters use currentColor so the wordmark flips cleanly between
// light and dark themes; the dot of the "i" is the one brand accent — a solid
// "pixel" (fill-accent), the seed of the whole identity.
//
// Metrics (user units): cap-top y6, baseline y26 (cap height 20), x-height
// top y12 (x-height 14 ≈ 0.7 cap), descender y33. Glyph widths ~9–13 give a
// ~1.4:1 height:width feel. The viewBox is trimmed to the ink so there is no
// dead vertical space.

function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="2 2 61 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* P */}
        <path d="M6 6 V26" />
        <path d="M6 6 C14.5 6 18.5 8 18.5 11 C18.5 14 14.5 15.8 6 15.8" />
        {/* i (stem — the dot is the accent pixel above) */}
        <path d="M24.5 12 V26" />
        {/* x */}
        <path d="M30.5 12 L39.5 26" />
        <path d="M39.5 12 L30.5 26" />
        {/* l */}
        <path d="M45 6 V26" />
        {/* y — left arm meets the descender stroke cleanly */}
        <path d="M50 12 L55.1 21.7" />
        <path d="M59 12 L50.5 33" />
      </g>
      {/* the dot of the "i" — the brand pixel */}
      <rect x="22.2" y="5.2" width="4.6" height="4.6" rx="1.4" className="fill-accent" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center text-ink ${className ?? ""}`}>
      <Wordmark className="h-[1.7rem] w-auto" />
    </span>
  );
}
