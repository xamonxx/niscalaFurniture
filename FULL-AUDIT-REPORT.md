# Full SEO Audit Report - Niscala Furniture

Audit date: 2026-09-08  
Skill used: `agentic-seo-skill` installed from `https://github.com/Bhanunamikaze/Agentic-SEO-Skill.git`  
Scope: local Next.js project and rendered local site at `http://localhost:3000`

## Executive Summary

Overall SEO foundation is solid. The site already has indexable pages, unique metadata, canonical URLs, sitemap, robots.txt, Open Graph/Twitter metadata, semantic headings, useful internal links, and image alt text. The main SEO risks are structured-data eligibility, local trust completeness, AI/GEO discoverability, and a few metadata/content refinements.

Estimated readiness: 78/100 for technical SEO. This is a local audit, not a live production audit with Google Search Console, PageSpeed Insights, server logs, or real CrUX data.

## Evidence Collected

- Rendered homepage HTML: `.seo-audit/home.html`
- Parsed HTML report: `.seo-audit/parse-home.json`
- Rich result guard: `.seo-audit/rich-results.json`
- Readability report: `.seo-audit/readability.json`
- Route metadata sample: `.seo-audit/routes-meta.json`
- Robots render checked via `http://localhost:3000/robots.txt`
- Sitemap render checked via `http://localhost:3000/sitemap.xml`

Some URL-based skill scripts blocked localhost because the URL resolved to private IP `127.0.0.1`. Those results were treated as environment limitations, and source/render evidence was used instead.

## What Is Working Well

- Homepage is indexable with `meta robots: index, follow`.
- Canonical exists on sampled routes:
  - `/`
  - `/portfolio`
  - `/services`
  - `/knowledge`
  - `/about`
  - `/survey`
  - `/contact`
  - sample category, project, and article routes
- Each sampled route returns HTTP 200 and has exactly one H1.
- Invalid dynamic routes return HTTP 404, not soft 404:
  - `/portfolio/tidak-ada`
  - `/knowledge/tidak-ada`
- Sitemap renders 50 URLs.
- Robots.txt renders and points to the production sitemap.
- Open Graph and Twitter card metadata are present on the homepage.
- Homepage parse found 19 images and 0 missing alt attributes.
- Homepage parse found 40 internal links and 16 external links.
- LocalBusiness JSON-LD exists and includes name, description, URL, image, email, telephone, social profiles, country service area, and language.
- Article pages include `Article` JSON-LD with headline, description, date published, language, author, publisher, and main entity page.

## Priority Findings

### P1 - FAQPage Schema Is Not Eligible for This Commercial Site

Evidence:
- `src/components/sections/faq.tsx:14`
- `src/components/sections/faq.tsx:17`
- `.seo-audit/rich-results.json`

The homepage includes `FAQPage` JSON-LD. The rich-result guard flags this because FAQ rich results are now mainly eligible for authoritative government and health sites. For a commercial furniture/interior site, this can create structured-data quality risk without much upside.

Recommendation:
- Keep the visible FAQ section.
- Remove the `FAQPage` JSON-LD script from the homepage.
- Do not replace it with fake review, aggregate rating, or FAQ markup.

### P1 - LocalBusiness Schema Is Missing Strong Local Trust Fields

Evidence:
- `src/lib/seo.ts:66`
- `src/lib/seo.ts:73`
- `src/lib/seo.ts:74`
- `src/lib/seo.ts:76`

The `LocalBusiness` schema exists, but it does not include address, geo, opening hours, price range, or contact point. For an interior/furniture business, these fields help local trust, entity confidence, and conversion confidence.

Recommendation:
- Add only verified data:
  - `address` if there is a real public workshop/showroom address.
  - `geo` if the public address is fixed.
  - `openingHoursSpecification` if operating hours are fixed.
  - `priceRange` if a realistic range can be stated.
  - `contactPoint` for WhatsApp/consultation.
- If no public address should be displayed, keep `areaServed` and add clearer service-area text on page content.

### P2 - No `llms.txt` for AI Search/GEO Readiness

Evidence:
- `http://localhost:3000/llms.txt` returned 404.
- `src/app/robots.ts` only has a broad `User-Agent: *` allow rule.

The site has no `llms.txt`. This is not required for Google ranking, but it is useful for AI answer engines and crawler-friendly brand/entity summaries.

Recommendation:
- Add `/llms.txt` with concise facts:
  - brand name
  - service categories
  - service areas
  - official contact URL
  - important portfolio and knowledge URLs
- Keep it factual and avoid invented claims.

### P2 - Robots.txt Has No Explicit AI Crawler Policy

Evidence:
- `src/app/robots.ts:5`
- Rendered robots:
  - `User-Agent: *`
  - `Allow: /`
  - sitemap and host

Robots is technically fine for normal search crawling, but it does not state whether AI crawlers should be allowed or blocked.

Recommendation:
- Decide a policy for AI crawlers such as GPTBot, Google-Extended, ClaudeBot, PerplexityBot, CCBot, and Applebot-Extended.
- Add explicit allow/disallow rules according to business preference.
- If the goal is brand discovery in AI answers, allow crawling of public marketing pages and block only private/admin paths if any.

### P2 - Sitemap `lastModified` Uses Runtime `new Date()` for Many Routes

Evidence:
- `src/app/sitemap.ts:8`
- `src/app/sitemap.ts:20`
- `src/app/sitemap.ts:24`
- `src/app/sitemap.ts:31`

Sitemap has 50 URLs. Article URLs use article publish dates, but static, category, and project URLs use the current generation time. This makes many URLs look updated every build/render even when content did not change.

Recommendation:
- Use stable content dates where possible:
  - project year/date from the data manifest
  - category latest project date
  - static page last reviewed dates
- Keep `lastmod` meaningful.

### P2 - Some Titles/Descriptions Need Tightening

Evidence:
- `.seo-audit/routes-meta.json`

Examples:
- `/knowledge/plywood-mdf-atau-hmr` title length is 83 characters.
- `/about` title is `Tentang Niscala Furniture - Niscala Furniture`, repeating the brand.
- `/portfolio/kitchen-set-2024-07` description length is 68 characters.
- Homepage and `/services` descriptions are slightly above common SERP snippet comfort range.

Recommendation:
- Keep most titles under roughly 50 to 60 characters.
- Avoid repeating brand inside page title when the layout template already appends it.
- Expand short project descriptions with location, furniture type, and outcome.

### P2 - Portfolio Detail Pages Lack Project/CreativeWork JSON-LD

Evidence:
- `src/app/portfolio/[slug]/page.tsx` has metadata but no JSON-LD script.

Portfolio category pages include `Service` and `CollectionPage` schema, but individual project pages do not expose structured data for the project itself.

Recommendation:
- Add JSON-LD on project detail pages using `CreativeWork`, `ImageObject`, or `Service` linked to the organization.
- Include verified project facts already shown in UI: name, description, category, location, year, image, provider, and URL.

### P2 - BreadcrumbList Schema Is Missing

Evidence:
- No `BreadcrumbList` found in source search.

The site has nested URL paths such as `/portfolio/kategori/kitchen-set`, `/portfolio/kitchen-set-2024-07`, and `/knowledge/plywood-mdf-atau-hmr`. Breadcrumb schema would help search engines understand hierarchy.

Recommendation:
- Add `BreadcrumbList` JSON-LD for category, project detail, and article pages.
- Keep visible breadcrumbs optional, but JSON-LD should match the real hierarchy.

### P3 - Article Schema Missing `dateModified`

Evidence:
- `src/app/knowledge/[slug]/page.tsx:50`
- No `dateModified` in article JSON-LD.

Articles include publish dates, which is good. If articles are edited later, there is no modification date for freshness.

Recommendation:
- Add `updatedAt`/`modifiedAt` to the article data model.
- Emit `dateModified` when available.

### P3 - Readability Checker Flags Dense Copy

Evidence:
- `.seo-audit/readability.json`
- Homepage estimated reading time: 6.4 minutes.
- Complex-word rate: 38.7%.

The readability script is English-biased, so the exact grade score is not reliable for Indonesian. Still, it correctly signals that the homepage is content-heavy and has many technical phrases.

Recommendation:
- Keep the premium tone, but simplify some long section descriptions.
- Add more scannable bullets for buying concerns:
  - ukuran
  - material
  - estimasi
  - jadwal
  - survey

### P3 - E-E-A-T Trust Signals Can Be Stronger

Evidence:
- Contact details exist.
- Testimonials are hidden by env until real quotes are available.
- Founding year intentionally blank until verified.

This is honest and good, but the site can still build more trust with verifiable signals.

Recommendation:
- Add real workshop/showroom/service-area proof if available.
- Add real team/process photos.
- Add project dates and locations consistently.
- Add privacy policy page for survey/contact data collection.
- Add real testimonials only after verified client approval.

## Technical Notes

- `FAQPage` should not be recommended for this commercial site.
- Do not add fake `Review` or `AggregateRating` schema.
- Do not use deprecated `HowTo` schema as an SEO shortcut.
- Prefer JSON-LD for all structured data.
- PageSpeed/Core Web Vitals were not measured because localhost is not public and no production URL or CrUX data was audited.

## Suggested Next Audit After Deployment

Run a production audit after deployment with:
- Google Search Console indexing and coverage data.
- PageSpeed Insights or Lighthouse on the live URL.
- Real Open Graph image preview check.
- Broken-link crawl on production.
- Search result title/snippet review after indexing.
