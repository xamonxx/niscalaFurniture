# SEO Action Plan - Niscala Furniture

Audit date: 2026-09-08
Implementation date: 2026-09-08

## Status Summary

Everything that could be fixed in code is done. What remains needs business
input (real address, hours, price band, Google Business Profile) or a live
production URL.

| Phase | Item | Status |
| --- | --- | --- |
| 1 | Remove FAQPage JSON-LD | Done |
| 1 | Enrich LocalBusiness JSON-LD | Done - fields wired, env values pending |
| 1 | BreadcrumbList JSON-LD | Done - every non-home route |
| 2 | `/llms.txt` | Done |
| 2 | AI crawler policy in robots.txt | Done - explicit allow |
| 2 | WebSite JSON-LD | Done - no SearchAction |
| 3 | Shorten long article titles | Done - `seoTitle` per article |
| 3 | Remove brand duplication on `/about` | Done |
| 3 | Expand short project descriptions | Done - `seoDescription` builder |
| 3 | Trim long descriptions | Done - home 155, services 149 |
| 4 | Stable sitemap `lastModified` | Done |
| 4 | Article `dateModified` | Done - emitted when `updatedAt` is set |
| 5 | Privacy policy page | Done - `/privacy`, linked from footer + consent |
| 5 | Article E-E-A-T byline and date | Done |
| 5 | Local/service proof | Partly - service areas now in schema |
| 5 | Testimonials stay gated | Unchanged, still correct |
| 6 | Production validation | Pending deployment |

Also fixed along the way: `next build` crashed on Windows because Tailwind's
source scanning walked the audit tool's leftover Chrome profile in
`.seo-audit/`. That directory is now gitignored and excluded via
`@source not` in `globals.css`.

## Outstanding - Needs a Decision, Not Code

These are the highest-value items left, and each one is a value in
`.env.local` rather than a code change. Structured data publishes each field
only once it is filled in, so nothing is claimed until it is confirmed:

1. `NEXT_PUBLIC_GOOGLE_MAPS_URL` - a claimed Google Business Profile. Single
   biggest remaining local-search win.
2. `NEXT_PUBLIC_STREET_ADDRESS` / `_LOCALITY` / `_REGION` / `_POSTAL_CODE` -
   public workshop or showroom address, if one should be published.
3. `NEXT_PUBLIC_LATITUDE` / `NEXT_PUBLIC_LONGITUDE` - coordinates for that
   address.
4. `NEXT_PUBLIC_OPENING_DAYS` / `_OPENING_TIME` / `_CLOSING_TIME` - fixed hours.
5. `NEXT_PUBLIC_PRICE_RANGE` - a band the studio will actually honour.
6. `NEXT_PUBLIC_FOUNDED_YEAR` - still blank, still correctly hidden.

Content work that still needs the studio, not the codebase:

- Real workshop, team and process photography.
- Real client testimonials, before flipping `NEXT_PUBLIC_SHOW_TESTIMONIALS`.
- `updatedAt` on knowledge articles, once any of them is actually revised.

---

## Phase 1 - Fix High-Risk Structured Data

1. **Done.** Removed `FAQPage` JSON-LD from `src/components/sections/faq.tsx`.
   - Visible FAQ accordion kept.
   - No review/rating schema added.

2. **Done.** `LocalBusiness` JSON-LD in `src/lib/seo.ts` now emits:
   - `@type: ["LocalBusiness", "HomeAndConstructionBusiness"]`
   - `address`, `geo`, `openingHoursSpecification`, `priceRange`, `hasMap` -
     each gated on its env var
   - `contactPoint` for WhatsApp and email
   - `areaServed` listing the real towns from the delivery records
   - `logo`, `alternateName`, `slogan`, `currenciesAccepted`

3. **Done.** `BreadcrumbList` JSON-LD on every route below the homepage,
   including the top-level pages.

## Phase 2 - Strengthen AI/GEO Discoverability

1. **Done.** `/llms.txt` at `src/app/llms.txt/route.ts`, generated from the
   same data the pages render. Includes a "Yang belum dipublikasikan" section
   that tells a model what the studio has *not* claimed.

2. **Done.** `src/app/robots.ts` names AI crawlers explicitly and allows them.
   Nothing is disallowed - blocking build output would break rendering.

3. **Done.** `WebSite` JSON-LD in the root layout, in one `@graph` with the
   business entity. No `SearchAction`: there is no internal search.

## Phase 3 - Metadata Cleanup

1. **Done.** `seoTitle` added to each article; rendered titles now 57-60 chars.
2. **Done.** `/about` title is `Profil Studio & Workshop`.
3. **Done.** `buildSeoDescription` in `src/data/projects.ts` pads project meta
   descriptions into the 120-158 band using claims the site already makes.
4. **Done.** Homepage 177 to 155, `/services` 167 to 149, category pages 159
   to ~148.

## Phase 4 - Sitemap Freshness

1. **Done.** Runtime `new Date()` replaced:
   - static pages use `CONTENT_LAST_REVIEWED`, bumped by hand
   - portfolio and category pages use the manifest's `generatedAt`, capped
     against the project year
   - `/privacy` added

2. **Done.** Articles use `updatedAt ?? publishedAt`, and `dateModified` is
   emitted in Article JSON-LD only when `updatedAt` exists.

## Phase 5 - Trust and Local SEO Content

1. **Done.** `/privacy` describes what the survey form collects, where it goes,
   the WhatsApp follow-up, retention and deletion. Linked from the footer and
   from the consent checkbox.
2. **Partly done.** Service areas are now in structured data and on the
   category pages. Workshop photography still needed.
3. **Unchanged.** Testimonials stay behind the env gate.
4. **Done.** Articles carry an author line and a published/updated date, and
   `wordCount` plus `timeRequired` in Article JSON-LD.

## Phase 6 - Production Validation

Site went live on Hostinger 2026-09-08. Validated 2026-09-09.

| Check | Status |
| --- | --- |
| Sitemap submitted to Search Console | Done - Sukses, 51 pages found |
| `/llms.txt` and `/robots.txt` live | Done - AI crawler block present |
| Open Graph image | Done - 200, image/png, 59 KB |
| Icons and manifest | Done - all 200 |
| Broken-link crawl | Done - 0 broken links, 0 broken images |
| On-page crawl (51 pages) | Done - every page one H1, canonical, description |
| External links | Done - all resolve |
| Image format negotiation | Done - AVIF 53 KB vs JPEG 131 KB |
| HTTP to HTTPS | Done - 301 |
| Trailing slash | Done - 308 to the canonical form |
| Real 404s on unknown routes | Done - no soft 404 |
| www duplicate hostname | Found and fixed - 301 added, commit a4d407c |
| PageSpeed Insights | Not run - API quota exhausted, run in browser |
| Rich Results Test | Not run - browser only |

### Still to do

1. PageSpeed Insights, mobile and desktop:
   https://pagespeed.web.dev/analysis?url=https://niscalafurniture.com
2. Rich Results Test on homepage, an article, a category and a project page:
   https://search.google.com/test/rich-results
3. Search Console page-indexing report - check roughly a week after submission,
   not before. Indexing is not immediate.
4. Add `www.niscalafurniture.com` as a second property in Search Console, or
   switch to a Domain property, so the redirect can be seen working.

### Note on testimonials

`NEXT_PUBLIC_SHOW_TESTIMONIALS` was set to `true` on 2026-09-09, so the four
entries in `src/data/testimonials.ts` are now published. They are still the
generated sample copy the file warns about, attributed to invented names.
Replacing them with real, permitted client quotes - and setting
`isPlaceholder: false` on each - remains outstanding.
