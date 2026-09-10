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
 * Writes dynamic custom articles to the filesystem atomically using a temp file.
 */
async function writeCustomArticles(articles: KnowledgeArticle[]): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${DATA_FILE_PATH}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(articles, null, 2), "utf-8");
  await fs.rename(tempPath, DATA_FILE_PATH);
}

/**
 * Returns articles.
 * - If includeInactive is false (default for public), only returns status === 'aktif'.
 * - If includeInactive is true (for admin), returns all articles including drafts/tidak_aktif.
 */
export async function getAllArticles(options?: {
  includeInactive?: boolean;
}): Promise<KnowledgeArticle[]> {
  const custom = await readCustomArticles();

  // Create a map to allow custom articles to override baseline articles if same slug
  const map = new Map<string, KnowledgeArticle>();

  // Add baseline first (default status: 'aktif')
  for (const article of baselineArticles) {
    map.set(article.slug, {
      ...article,
      status: article.status || "aktif",
    });
  }

  // Overlay custom articles (or add new ones)
  for (const article of custom) {
    map.set(article.slug, {
      ...article,
      status: article.status || "aktif",
    });
  }

  let all = Array.from(map.values());

  // Filter out inactive articles for public views
  if (!options?.includeInactive) {
    all = all.filter((a) => a.status !== "tidak_aktif");
  }

  // Sort newest first
  return all.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Finds an article by its slug.
 * - For public views (allowInactive = false), returns undefined if article is 'tidak_aktif'.
 * - For admin views (allowInactive = true), returns the article regardless of status.
 */
export async function getArticleBySlug(
  slug: string,
  options?: { allowInactive?: boolean }
): Promise<KnowledgeArticle | undefined> {
  const custom = await readCustomArticles();
  const foundCustom = custom.find((a) => a.slug === slug);

  const article =
    foundCustom || baselineArticles.find((a) => a.slug === slug);

  if (!article) return undefined;

  const normalized: KnowledgeArticle = {
    ...article,
    status: article.status || "aktif",
  };

  if (!options?.allowInactive && normalized.status === "tidak_aktif") {
    return undefined;
  }

  return normalized;
}

/**
 * Checks if an article is stored in custom storage.
 */
export async function isCustomArticle(slug: string): Promise<boolean> {
  const custom = await readCustomArticles();
  return custom.some((a) => a.slug === slug);
}

/**
 * Saves (creates or updates) an article with publication status.
 */
export async function saveArticle(
  article: KnowledgeArticle
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!article.slug || !article.title || !article.summary) {
      return { success: false, error: "Slug, Judul, dan Ringkasan wajib diisi." };
    }

    const custom = await readCustomArticles();
    const existingIndex = custom.findIndex((a) => a.slug === article.slug);

    const articleToSave: KnowledgeArticle = {
      ...article,
      status: article.status || "aktif",
    };

    if (existingIndex >= 0) {
      // Update existing
      custom[existingIndex] = {
        ...articleToSave,
        updatedAt: new Date().toISOString().split("T")[0],
      };
    } else {
      // Insert new
      custom.push({
        ...articleToSave,
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
 * Toggles an article status between 'aktif' and 'tidak_aktif'.
 */
export async function toggleArticleStatus(
  slug: string
): Promise<{ success: boolean; newStatus?: "aktif" | "tidak_aktif"; error?: string }> {
  try {
    const custom = await readCustomArticles();
    const existingIndex = custom.findIndex((a) => a.slug === slug);

    let targetArticle: KnowledgeArticle | undefined;

    if (existingIndex >= 0) {
      targetArticle = custom[existingIndex];
      const newStatus = targetArticle.status === "tidak_aktif" ? "aktif" : "tidak_aktif";
      custom[existingIndex] = {
        ...targetArticle,
        status: newStatus,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      await writeCustomArticles(custom);
      return { success: true, newStatus };
    }

    // If it's a baseline article, copy to custom with toggled status
    const baseline = baselineArticles.find((a) => a.slug === slug);
    if (baseline) {
      const currentStatus = baseline.status || "aktif";
      const newStatus = currentStatus === "tidak_aktif" ? "aktif" : "tidak_aktif";
      const newCustomArticle: KnowledgeArticle = {
        ...baseline,
        status: newStatus,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      custom.push(newCustomArticle);
      await writeCustomArticles(custom);
      return { success: true, newStatus };
    }

    return { success: false, error: "Artikel tidak ditemukan." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengubah status artikel.";
    return { success: false, error: message };
  }
}

/**
 * Deletes a custom article by slug.
 */
export async function deleteArticle(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const custom = await readCustomArticles();
    const isCustom = custom.some((a) => a.slug === slug);

    if (!isCustom) {
      return {
        success: false,
        error: "Artikel bawaan sistem (baseline) tidak dapat dihapus permanen. Anda dapat mengubah statusnya menjadi 'Tidak Aktif' agar tidak muncul di publik.",
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
