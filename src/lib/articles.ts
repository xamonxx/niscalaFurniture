import fs from "fs/promises";
import path from "path";

import { knowledgeArticles as baselineArticles } from "@/data/knowledge";
import type { KnowledgeArticle } from "@/types";
export { parseRawTextToBlocks, estimateReadingMinutes } from "./article-utils";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "custom-articles.json");

/**
 * Reads dynamic custom articles stored on the filesystem.
 */
async function readCustomArticles(): Promise<KnowledgeArticle[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: unknown) {
    // If file doesn't exist yet, attempt to create it
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "ENOENT") {
      try {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      } catch {
        // ignore write error
      }
    }
    return [];
  }
}

/**
 * Writes dynamic custom articles to the filesystem.
 */
async function writeCustomArticles(articles: KnowledgeArticle[]): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(articles, null, 2), "utf-8");
}

/**
 * Returns all articles (custom articles + baseline articles),
 * sorted chronologically with newest published first.
 */
export async function getAllArticles(): Promise<KnowledgeArticle[]> {
  const custom = await readCustomArticles();

  // Create a map to allow custom articles to override baseline articles if same slug
  const map = new Map<string, KnowledgeArticle>();

  // Add baseline first
  for (const article of baselineArticles) {
    map.set(article.slug, article);
  }

  // Overlay custom articles (or add new ones)
  for (const article of custom) {
    map.set(article.slug, article);
  }

  const all = Array.from(map.values());

  // Sort newest first
  return all.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Finds an article by its slug.
 */
export async function getArticleBySlug(slug: string): Promise<KnowledgeArticle | undefined> {
  const custom = await readCustomArticles();
  const foundCustom = custom.find((a) => a.slug === slug);
  if (foundCustom) return foundCustom;

  return baselineArticles.find((a) => a.slug === slug);
}

/**
 * Checks if an article is a custom article (can be deleted or edited).
 */
export async function isCustomArticle(slug: string): Promise<boolean> {
  const custom = await readCustomArticles();
  return custom.some((a) => a.slug === slug);
}

/**
 * Saves (creates or updates) an article.
 */
export async function saveArticle(article: KnowledgeArticle): Promise<{ success: boolean; error?: string }> {
  try {
    if (!article.slug || !article.title || !article.summary) {
      return { success: false, error: "Slug, Judul, dan Ringkasan wajib diisi." };
    }

    const custom = await readCustomArticles();
    const existingIndex = custom.findIndex((a) => a.slug === article.slug);

    if (existingIndex >= 0) {
      // Update existing
      custom[existingIndex] = {
        ...article,
        updatedAt: new Date().toISOString().split("T")[0],
      };
    } else {
      // Insert new
      custom.push({
        ...article,
        publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
      });
    }

    await writeCustomArticles(custom);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan artikel.";
    return { success: false, error: message };
  }
}

/**
 * Deletes a custom article by slug.
 */
export async function deleteArticle(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const custom = await readCustomArticles();
    const isCustom = custom.some((a) => a.slug === slug);

    if (!isCustom) {
      return {
        success: false,
        error: "Artikel bawaan sistem (baseline) tidak dapat dihapus, hanya artikel kustom yang dapat dihapus.",
      };
    }

    const filtered = custom.filter((a) => a.slug !== slug);
    await writeCustomArticles(filtered);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus artikel.";
    return { success: false, error: message };
  }
}
