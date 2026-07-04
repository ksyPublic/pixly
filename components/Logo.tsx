// Pixly logo — an icon mark + wordmark lockup (like CapCut's [mark][CapCut]).
//
// The mark is a tangerine gradient tile carrying a white "P" drawn in the exact
// same humanist geometric style as the wordmark's "P", so the icon and the word
// read as one identity. The same tile is used for the browser-tab favicon and
// the app icon, so header, tab and home-screen all match. The wordmark "Pixly"
// is currentColor so it flips cleanly light↔dark; the dot of the "i" is the one
// brand accent — a solid tangerine "pixel".

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="pixly-logo-g"
          x1="4"
          y1="2"
          x2="36"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7A45" />
          <stop offset="1" stopColor="#E8431A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#pixly-logo-g)" />
      <g
        transform="translate(8.6 4.3) scale(0.95)"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M6 6 V26" />
        <path d="M6 6 C14.5 6 18.5 8 18.5 11 C18.5 14 14.5 15.8 6 15.8" />
      </g>
    </svg>
  );
}

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
    <span className={`inline-flex items-center gap-2 text-ink ${className ?? ""}`}>
      <Mark className="h-[1.5rem] w-auto shrink-0" />
      <Wordmark className="h-[1.5rem] w-auto" />
    </span>
  );
}
