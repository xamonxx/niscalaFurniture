# Changelog

What changed and why. Newest first. The format is defined in `AGENTS.md`;
every agent and developer adds an entry for anything that alters behaviour,
output, build steps or deploy steps.

The "Watch" lines are the point of this file: they are what a later change can
break by not knowing.

## Unreleased

### A runnable migration prompt for the second developer's agent
- **What** `SYNC-AGENT.md`: step-by-step instructions an AI agent executes to
  move Developer B's clone onto this repository, with a proof step before the
  switch and guardrails against force-pushing or committing secrets.
- **Why** `CONTRIBUTING.md` explains the workflow to a person; this is written
  to be run. The steps are ordered so nothing is discarded before it is proven
  to exist on `master`.
- **Watch** It describes `master`, not the open `feat/optimasi-gambar` branch.
  The first draft claimed `public/v`, `prepare:variants` and a 98-page build,
  all of which live only on that branch - `master` builds 65 pages and has no
  image pipeline. Re-check those numbers when the branch merges.

### Migration steps for the second developer now cover the admin credentials
- **What** `CONTRIBUTING.md` gains three steps: `npm install` (sharp moved to
  `dependencies`), the first `npm run build` that creates `public/v`, and
  generating `ADMIN_SECRET` / `ADMIN_PASSWORD_HASH` locally.
- **Why** The migration was written before the admin panel failed closed. A
  developer following the old steps would land on a working site with a dead
  `/admin` and no clue why, since the reason only appears in the server log.
- **Watch** Those values are per machine. `.env.local` is git-ignored, so they
  are never shared between developers, and production must not reuse a local
  one.

### Closed an authentication bypass in the admin panel
- **What** Removed every credential default from `src/lib/auth.ts`, split the
  session signing key from the password, bounded the session timestamp at both
  ends, and added `npm run admin:secret` / `npm run admin:password` plus
  scrypt-hashed password storage.
- **Why** `ADMIN_PASSWORD` defaulted to a literal in the source and the signing
  key defaulted to that literal plus a fixed suffix. The repository is public
  and none of the variables were set, so the key was the public constant
  `niscala2026_salt_niscala`. Anyone could compute
  `<timestamp>.HMAC(timestamp, key)`, set the session cookie, and hold a full
  admin session without touching the login form - which meant the rate limiter
  never saw them. Verified by forging a token and using it; the admin list
  returned 72 KB with four articles. After the fix the same token returns a
  response byte-identical to sending no cookie at all.
- **Watch** Three things a later change can get wrong here.
  (1) `isAdminAuthenticated()` denies rather than throws when the config is
  missing, on purpose: throwing would fail `next build` and turn a
  misconfiguration into a dead site instead of a disabled panel. Verified the
  build still succeeds with no admin variables set.
  (2) scrypt, not bcrypt or argon2, because those are native addons and a build
  on this host has already died over a native binary and an old glibc.
  (3) The scrypt cost parameters live *inside* the hash string. Keeping them as
  a shared constant is what broke the first attempt - the generator used
  N=32768 while the verifier fell through to Node's default of 16384, and the
  correct password was rejected.

### Agent and contributor documentation
- **What** Added `CHANGELOG.md`, `CONTRIBUTING.md`, and a project-rules section
  in `AGENTS.md` covering commands, document ownership, and the traps that have
  already cost time.
- **Why** Two developers and several agents were each re-deriving the same
  constraints. `CODEX_MEMORY.md` had already gone stale — it still described a
  Turbopack build and knew nothing about the admin panel or the image loader.
- **Watch** `AGENTS.md` is loaded automatically by Claude Code via `CLAUDE.md`
  and read directly by other agents, so it is the only file guaranteed to be
  seen. Anything an agent must not get wrong belongs there, not here.

### Merged the admin-panel branch
- **What** Brought Developer B's four commits (article admin panel, login,
  editor, image and YouTube embeds) into `master`, then merged `master` into
  `feat/optimasi-gambar`. Five files conflicted and were resolved by taking
  whichever side was more complete per hunk.
- **Why** The two branches had diverged from `afc8d4e` and both had touched the
  homepage sections while independently fixing the same mobile problems.
- **Watch** `sticky-mobile-cta.tsx` merged with **no** conflict and was broken
  anyway: an early `/admin` return landed above a `useEffect`, leaving a
  conditional hook that throws on navigation out of `/admin`. Lint caught it,
  git could not. A clean merge here is not evidence of a working merge — run
  `npm run lint` and `npm run build` after every merge.

### Kept `--text-display-mobile` at 40px
- **What** Declined the admin branch's 34px for this token.
- **Why** `--text-headline-lg-mobile` is 36px. At 34px the largest step in the
  scale renders smaller than the step beneath it, everywhere the token is used —
  hero, closing CTA, CTA banner.
- **Watch** Both branches were chasing the same goal, a hero that does not push
  the proof bar below the fold on a 360px phone. If the hero specifically needs
  to be smaller, that belongs on the hero's own class.

### Pre-rendered responsive image variants; runtime optimiser off
- **What** `scripts/build-image-variants.mjs` writes every width in the ladder
  into `public/v` before the build. A custom `next/image` loader
  (`src/lib/image-loader.ts`) points at those files. `/_next/image` now 404s.
- **Why** On Hostinger shared hosting a cold `/_next/image` request measured
  **1.8–2.8s TTFB** because `sharp` encoded on demand, and the cache behind it
  lives in `.next/cache/images`, which every rebuild wipes — so the first
  visitor after each deploy paid it again. The same request now serves in
  **23ms**.
- **Watch** WebP only, deliberately. Measured on this project's own photography
  at 1280px: webp 202ms / 79.6 KB against avif 5081ms / 65.5 KB. AVIF is 25×
  slower to encode for 18% fewer bytes, which is a 45-minute build instead of a
  1-minute one. Do not "improve" this by re-enabling AVIF without re-measuring
  on the target host.

### Hard-linked the duplicate top ladder rung
- **What** Ladder steps at or above a source's own width are copied once and
  hard-linked thereafter, with a copy fallback.
- **Why** 227 of 232 sources are 1280px wide or narrower, so the 1600 rung was a
  byte-for-byte duplicate of 1280. The tree went from 63.2 MB to 39.9 MB.
- **Watch** Uploading over FTP expands links back into files. The saving is real
  only when the build runs on the server.

### Blur placeholders via `placeholder`, not `placeholder="blur"`
- **What** `npm run prepare:blur` writes a 16px LQIP into the manifests;
  `src/lib/image-placeholder.ts` passes it as a `data:` URI.
- **Why** `placeholder="blur"` wraps the URI in an inline SVG carrying two
  `feGaussianBlur` passes, a `feColorMatrix` and two `feComposite` nodes — about
  1 KB per image, repeated in the flight payload. That more than doubled
  `/portfolio`. Passing the URI directly paints it as a plain background, and
  the browser's own upscaling supplies the blur the filter was faking.
- **Watch** Roughly 150 bytes per image either way; the SVG is the expensive
  part, not the placeholder.

### Spelled out `sizes` instead of approximating with `vw`
- **What** Portfolio grids declare real slot widths.
- **Why** `30vw` was a stand-in for the container arithmetic and drifted on wide
  screens: the container caps at 1440px with 64px gutters, so a card is 416px on
  a 1920px display, not 576px.
- **Watch** Next narrows a srcset only when `sizes` contains a bare integer
  `vw` preceded by whitespace — its regex is `/(^|\s)(1?\d?\d)vw/`. A `calc()`
  disables that narrowing, so all ladder widths are offered. Measured cost:
  1.1 KB gzipped, accepted so low-DPR phones keep the small variants.

### Long-lived caching for images
- **What** `/images`, `/logo` and `/v` are served `immutable` for a year.
- **Why** The host returned them with no `Cache-Control` at all, so browsers
  fell back to heuristic caching and revalidated far more often than needed.
