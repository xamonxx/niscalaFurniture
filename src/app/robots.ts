import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Crawler policy.
 *
 * The whole site is public marketing content, so everything is open. The AI
 * crawlers are named explicitly rather than left to the wildcard because their
 * silence is ambiguous: several of them treat "no rule for me" as a reason to
 * back off, and the studio wants to be quotable in AI answers.
 *
 * Nothing is disallowed. There is no admin area, and blocking the Next.js
 * build output would stop Googlebot rendering the pages it is trying to index.
 *
 * `/llms.txt` (see `src/app/llms.txt/route.ts`) carries the brand summary those
 * AI crawlers are looking for.
 */

/**
 * Crawlers that feed AI answer engines and model training sets.
 *
 * Split from the search crawlers so a future decision to opt out of one group
 * does not require untangling it from the other.
 */
const AI_CRAWLERS = [
  // OpenAI: training, search index, and on-demand user fetches.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic.
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Perplexity.
  "PerplexityBot",
  "Perplexity-User",
  // Google's separate opt-in for Gemini and AI Overviews grounding.
  "Google-Extended",
  // Apple Intelligence / Siri summaries.
  "Applebot",
  "Applebot-Extended",
  // Meta AI.
  "meta-externalagent",
  "FacebookBot",
  // Common Crawl, which most other models are trained from.
  "CCBot",
  // Others that respect robots.txt.
  "DuckAssistBot",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
  "YouBot",
];

const SEARCH_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: SEARCH_CRAWLERS, allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
