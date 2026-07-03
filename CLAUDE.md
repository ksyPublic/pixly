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
- **pixly-reviewer** — code reviewer & full-project verifier: correctness bugs +
  adherence to the hard rules (tokens, client-side/static-export, ko/en i18n
  parity, dark mode/responsive, reduced-motion) + build/lint gates. Report-only.
- **pixly-animator** — owns motion across ALL pages: entrance/scroll reveals,
  hero canvas, micro-interactions, unified as one GPU-cheap, reduced-motion-safe
  system.
- **pixly-cx** — service-quality & UX-writing: audits copy/wording across every
  page for plain, clear, honest language (ko + en) and reports what the service
  still needs. Advisory; can refine copy.

Parallelize by file ownership to avoid conflicts. When possible, verify with
`pnpm build` and browser QA before reporting done.

### Full verification sweep ("전체 검증")

To validate the whole app, spawn these in parallel (independent lenses, minimal
file overlap) and merge their reports:

- **pixly-reviewer** — code correctness + hard-rule audit + `pnpm build`/`pnpm lint` gates.
- **pixly-qa** — real-browser convert/crop flows, mobile, dark mode, console errors.
- **pixly-cx** — copy/wording clarity (ko + en) + service-gap recommendations.

Then hand each finding to its owner agent (engineer / designer / i18n / animator)
to fix, and re-run pixly-reviewer to confirm the gates pass.

## Design tokens (never hard-code colors)

CSS variables in `app/globals.css`, exposed via Tailwind `@theme`: `bg`,
`surface`, `surface-2`, `ink`, `muted`, `line`, `line-strong`, `accent`
(tangerine), `accent-soft`, `good`. Fonts: `font-display` (Bricolage Grotesque),
`font-sans` (Geist), `font-mono`. Aesthetic: warm editorial-tech. Everything must
work in light + dark + mobile.
