// Pixly mark: a tangerine app tile with two overlapping photo frames
// (the "conversion" idea) and a little image glyph. Reads down to 16px.

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
      <rect width="32" height="32" rx="8.5" fill="url(#pixly-grad)" />
      {/* ghost frame behind — the "from" format */}
      <rect
        x="7.4"
        y="7.4"
        width="12.6"
        height="12.6"
        rx="3.4"
        fill="#fff"
        fillOpacity="0.42"
      />
      {/* main photo frame — the "to" format */}
      <rect x="11.4" y="11.4" width="13.2" height="13.2" rx="3.7" fill="#fff" />
      {/* sun */}
      <circle cx="15" cy="15.7" r="1.9" fill="url(#pixly-grad)" />
      {/* mountains */}
      <path
        d="M12.5 23.2 L16.3 18.5 L18.5 21 L20.3 18.7 L23.6 23.2 Z"
        fill="url(#pixly-grad)"
      />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-8 w-8" />
      <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-ink">
        Pixly
      </span>
    </span>
  );
}
