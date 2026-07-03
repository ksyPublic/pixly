# Pixly — AdSense Readiness & De-AI Content Plan

Google AdSense (and Search) actively reject sites that read as **auto-generated,
templated, low-value content made for ads/search engines**. This is the #1
rejection reason ("Low value content" / "scaled content abuse"). Our tool works
great, but the *copy* is currently the weak point. This plan documents exactly
what looks AI-generated today and how to fix it, in priority order.

**Do this AFTER connecting a custom domain and BEFORE applying to AdSense.**

---

## What Google actually flags

It is not "AI was used." It is these observable signals:

1. **Doorway pages** — many near-identical pages that differ only by a swapped
   keyword. Our 16 `/x-to-y/` pages share one template.
2. **Templated phrasing** — the same H2s ("How to…", "Why convert…", "Is it
   safe?") and sentence shapes on every page.
3. **Generic filler** — sentences that could apply to any tool ("changes how the
   image is stored to fit your needs").
4. **No E-E-A-T** — no named author, no real experience, no expertise signal, no
   evidence a human stands behind it.
5. **AI writing tells** — em-dash overuse, triads ("compatibility, smaller size,
   or transparency"), uniform sentence rhythm, words like *seamless, effortless,
   robust, comprehensive*.
6. **Thin unique value** — each page adds little a user couldn't guess.

---

## Phase 1 — Kill the doorway-page signal (highest priority)

Make every conversion page carry **unique, specific** content instead of a
swapped keyword.

- [ ] Per-format **fact box** with real specs: color depth, compression type,
      transparency support, animation, typical file size, first browser/OS to
      support it, who uses it. (HEIC=iPhone, AVIF=AV1/2019, GIF=1987/256 colors,
      BMP=uncompressed, WebP=Google/2010.)
- [ ] Per-conversion **real gotchas**: e.g. "HEIC won't open on Windows 10
      without the HEVC codec", "AVIF isn't supported in Safari before 16.4",
      "GIF→PNG keeps only the first frame", "BMP→JPG can be 95%+ smaller".
- [ ] A **mini-FAQ of real questions** per page (pull from Google "People Also
      Ask" for that exact query). 3–5 Q&As, answered specifically.
- [ ] **Vary the structure** — not every page needs the same three H2s. Some
      lead with the FAQ, some with a comparison, some with a use case.

## Phase 2 — Add E-E-A-T (a real human behind it)

- [ ] **Named author/maker** + a genuine "About the maker" story: why Pixly was
      built (the privacy motivation — files never leaving the browser), what
      problem it solves. First person, specific, not corporate.
- [ ] **"How it works" technical page** — Canvas API + WebAssembly, why nothing
      is uploaded, how HEIC decoding works client-side. This demonstrates real
      expertise and is 100% unique content.
- [ ] **Last-updated dates** on pages; a short **changelog**.
- [ ] Real contact (replace `hello@pixly.app` placeholder with a monitored inbox).

## Phase 3 — Rewrite the voice (remove AI tells)

Apply to ALL existing copy (home, `[slug]`, about, privacy, how-it-works):

- [ ] **No em dashes.** Use periods, commas, parentheses.
- [ ] **Kill triads** — "broader compatibility, smaller size, or transparency"
      → pick the one that matters for that format.
- [ ] **Ban AI vocabulary**: seamless, effortless, robust, comprehensive,
      elevate, unlock, dive in, in today's digital world.
- [ ] **Vary sentence length and rhythm.** Mix short punchy lines with longer
      ones. Read it aloud — if it sounds like a brochure, rewrite.
- [ ] **Add specifics**: real numbers, real file-size examples, real scenarios
      ("You AirDropped 40 photos from your iPhone and Windows won't open them").
- [ ] **First person where natural** ("I built Pixly because…").

## Phase 4 — Add genuinely useful unique content (carries E-E-A-T + traffic)

A small **/guides** section of real articles (1,000+ words, specific, helpful):

- [ ] "Why your iPhone photos are HEIC and how to open them on Windows"
- [ ] "AVIF vs WebP vs JPG: which should you actually use in 2026"
- [ ] "How to convert HEIC to JPG without uploading your photos anywhere"
- [ ] "Do image converters steal your photos? How to tell"

These are the real value. The tool pages support them; the guides earn trust.

## Phase 5 — Pre-application checklist

- [ ] Custom `.com` domain connected (not `*.workers.dev`)
- [ ] 15–25 substantive, genuinely-different pages
- [ ] No two pages near-identical (Phase 1 done)
- [ ] Author + About + Privacy + Contact all real
- [ ] Every page passes the "read aloud" test (Phase 3)
- [ ] Optional: run a few pages through an AI-content detector; aim to not read
      as templated
- [ ] Sitemap submitted to Google Search Console; pages indexed
- [ ] *Then* apply to AdSense

---

## Concrete AI-tells in the current copy (fix list)

| File | Current text | Problem | Fix direction |
|------|--------------|---------|---------------|
| `app/[slug]/page.tsx` | "changes how the image is stored to fit your needs — broader compatibility, smaller file size, or transparency support" | generic + em dash + triad | format-specific reason, one benefit, no dash |
| `app/[slug]/page.tsx` | identical How-to / Why / Is-it-safe on all 16 pages | doorway template | Phase 1 unique blocks |
| `app/page.tsx` | "Free image converter that respects your privacy" | brochure-y | concrete hook |
| `app/about/page.tsx` | "your photos are yours" / "unobtrusive advertising" | no named human, no story | Phase 2 first-person maker story |
| everywhere | em dashes, "100% in your browser" repeated | uniform AI rhythm | vary, Phase 3 |

---

## Execution note

Claude can execute Phases 1–4 (rewrite copy, add author, build /guides, add fact
boxes + FAQs). Recommended order when resumed: **custom domain → Phase 1 → Phase
2 → Phase 3 → Phase 4 → Phase 5 checklist → apply to AdSense.**
