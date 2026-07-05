// hreflang helpers for the dual-route (ko / en) SEO setup.
//
// `path` is always the language-neutral, canonical (Korean) route — e.g.
// "/png-to-jpg/" or "/". Korean lives at the unprefixed path and English at the
// "/en" mirror. x-default points at Korean, the site's default language. Next
// resolves these relative paths to absolute URLs via `metadataBase`, emitting
// <link rel="alternate" hreflang="…"> for each entry.

export function altLanguages(path: string): Record<string, string> {
  const en = path === "/" ? "/en/" : `/en${path}`;
  return { ko: path, en, "x-default": path };
}

/** The /en mirror of a canonical (Korean) path. "/faq/" → "/en/faq/". */
export function enPath(path: string): string {
  return path === "/" ? "/en/" : `/en${path}`;
}
