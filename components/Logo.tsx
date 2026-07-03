// Pixly logo.
// - LogoMark: a tangerine "photo tile" app icon (mountain + sun). Reads to 16px.
// - Logo: the mark + a custom-drawn "Pixly" wordmark. The wordmark is hand-tuned
//   monoline lettering with rounded terminals; the dot of the "i" is the tangerine
//   "pixel" — the same warm mark language as the tile. Letters use currentColor so
//   the wordmark flips cleanly between light and dark themes.

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="pixly-grad"
          x1="4"
          y1="2"
          x2="28"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A45" />
          <stop offset="1" stopColor="#E8431A" />
        </linearGradient>
      </defs>
      {/* app tile */}
      <rect width="32" height="32" rx="8.5" fill="url(#pixly-grad)" />
      {/* sun + mountains — a landscape, bold enough to read at 16px */}
      <circle cx="11" cy="11" r="3" fill="#fff" />
      <path
        d="M4.5 25.5 L12.6 15 L17 20.6 L20.6 16.4 L28 25.5 Z"
        fill="#fff"
      />
    </svg>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="2 0 51 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="pixly-dot-grad"
          x1="18"
          y1="4"
          x2="22"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A45" />
          <stop offset="1" stopColor="#E8431A" />
        </linearGradient>
      </defs>
      <g
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* P */}
        <path d="M6 4 V25" />
        <path d="M6 4 C13 4 15 6 15 9.25 C15 12.5 13 14.5 6 14.5" />
        {/* i (stem — dot is the tangerine pixel above) */}
        <path d="M20 11 V25" />
        {/* x */}
        <path d="M24 11 L31.5 25" />
        <path d="M31.5 11 L24 25" />
        {/* l */}
        <path d="M36 4 V25" />
        {/* y — left arm meets the descender cleanly */}
        <path d="M40 11 L45 21" />
        <path d="M49 11 L41 31" />
      </g>
      {/* the dot of the "i" — the tangerine pixel */}
      <rect x="17.9" y="4.3" width="4.2" height="4.2" rx="1.35" fill="url(#pixly-dot-grad)" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-ink ${className ?? ""}`}
    >
      <LogoMark className="h-8 w-8" />
      <Wordmark className="h-[1.6rem] w-auto" />
    </span>
  );
}
