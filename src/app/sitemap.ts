import type { MetadataRoute } from "next";

import { knowledgeArticles } from "@/data/knowledge";
import {
  getProjectsByCategory,
  populatedCategories,
  portfolioUpdatedAt,
  projects,
} from "@/data/projects";
import { site } from "@/lib/site";

/**
 * Sitemap.
 *
 * `lastModified` is deliberately not `new Date()`. A timestamp that moves on
 * every build tells crawlers all fifty URLs changed whenever anything was
 * deployed, and once that turns out to be false they stop reading the field at
 * all. Each group is pinned to a date that reflects its actual content instead:
 *
 * - static marketing pages -> the manual review date below
 * - portfolio + category pages -> when the image archive was last processed
 * - articles -> the article's own revision or publish date
 */

/**
 * Bump this by hand when the copy on the static marketing pages is genuinely
 * rewritten. Format: YYYY-MM-DD.
 */
const CONTENT_LAST_REVIEWED = "2026-09-08";

const portfolioDate = new Date(portfolioUpdatedAt);
const staticDate = new Date(CONTENT_LAST_REVIEWED);

/** Latest publish date across the knowledge centre, for the listing page. */
const latestArticleDate = knowledgeArticles.reduce((latest, article) => {
  const stamp = new Date(article.updatedAt ?? article.publishedAt);
  return stamp > latest ? stamp : latest;
}, staticDate);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/portfolio`,
      lastModified: portfolioDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/services`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/knowledge`,
      lastModified: latestArticleDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/about`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${site.url}/survey`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site.url}/contact`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: staticDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = populatedCategories.map(
    (category) => {
      // A category is only as fresh as the newest project filed under it.
      const newestYear = getProjectsByCategory(category.slug).reduce(
        (latest, project) => Math.max(latest, project.year ?? 0),
        0
      );

      return {
        url: `${site.url}/portfolio/kategori/${category.slug}`,
        lastModified: newestYear
          ? new Date(Math.min(Date.UTC(newestYear, 11, 31), portfolioDate.getTime()))
          : portfolioDate,
        changeFrequency: "monthly",
        priority: 0.8,
      };
    }
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${site.url}/portfolio/${project.slug}`,
    lastModified: project.year
      ? new Date(Math.min(Date.UTC(project.year, 11, 31), portfolioDate.getTime()))
      : portfolioDate,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = knowledgeArticles.map((article) => ({
    url: `${site.url}/knowledge/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...projectRoutes,
    ...articleRoutes,
  ];
}
