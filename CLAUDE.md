@AGENTS.md

## Project agents (reusable — invoke via the Agent tool's `subagent_type`)

Pixly ships specialized subagents in `.claude/agents/`. Use them proactively and
run independent work in parallel (spawn multiple in one message):

- **pixly-designer** — UI polish, animations, dark mode, responsive layout,
  hero/marketing visuals. Works in Tailwind 4 with the CSS-variable tokens.
- **pixly-engineer** — client-side features & engines: converters, crop editor,
  Canvas/heic2any/ImageMagick-WASM pipelines, the format data model. Zero-server.
- **pixly-i18n** — Korean/English localization (default Korean); maintains the
  ko/en dictionary and keeps translations natural.
- **pixly-qa** — real-browser QA (convert/crop flows, mobile, dark mode, console
  errors) with screenshot evidence. Report-only.

Parallelize by file ownership to avoid conflicts. When possible, verify with
`pnpm build` and browser QA before reporting done.

## Design tokens (never hard-code colors)

CSS variables in `app/globals.css`, exposed via Tailwind `@theme`: `bg`,
`surface`, `surface-2`, `ink`, `muted`, `line`, `line-strong`, `accent`
(tangerine), `accent-soft`, `good`. Fonts: `font-display` (Bricolage Grotesque),
`font-sans` (Geist), `font-mono`. Aesthetic: warm editorial-tech. Everything must
work in light + dark + mobile.
