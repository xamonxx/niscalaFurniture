"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteArticle, saveArticle } from "@/lib/articles";
import type { KnowledgeArticle } from "@/types";

export type ArticleActionResult = {
  success?: boolean;
  error?: string;
  slug?: string;
};

export async function saveArticleAction(
  article: KnowledgeArticle
): Promise<ArticleActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  if (!article.title?.trim()) {
    return { error: "Judul artikel wajib diisi." };
  }
  if (!article.slug?.trim()) {
    return { error: "Slug artikel wajib diisi." };
  }
  if (!article.category?.trim()) {
    return { error: "Kategori artikel wajib diisi." };
  }
  if (!article.summary?.trim()) {
    return { error: "Ringkasan artikel wajib diisi." };
  }
  if (!article.body || article.body.length === 0) {
    return { error: "Konten artikel tidak boleh kosong." };
  }

  // Format slug to be URL safe
  const formattedSlug = article.slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const toSave: KnowledgeArticle = {
    ...article,
    slug: formattedSlug,
    publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
    readingMinutes: Number(article.readingMinutes) || 5,
  };

  const result = await saveArticle(toSave);
  if (!result.success) {
    return { error: result.error || "Gagal menyimpan artikel." };
  }

  // Real-time on-demand revalidation
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${toSave.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/articles");

  return { success: true, slug: toSave.slug };
}

export async function deleteArticleAction(
  slug: string
): Promise<ArticleActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const result = await deleteArticle(slug);
  if (!result.success) {
    return { error: result.error || "Gagal menghapus artikel." };
  }

  // Real-time on-demand revalidation
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/articles");

  return { success: true };
}
