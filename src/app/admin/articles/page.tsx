import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ExternalLink, Edit3, Clock, Sparkles } from "lucide-react";

import { isAdminAuthenticated } from "@/lib/auth";
import { getAllArticles, isCustomArticle } from "@/lib/articles";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";

export const metadata = {
  title: "Daftar Artikel — Admin Niscala",
};

export default async function AdminArticlesPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const articles = await getAllArticles();

  // Check which articles are custom
  const articlesWithCustomStatus = await Promise.all(
    articles.map(async (article) => ({
      ...article,
      isCustom: await isCustomArticle(article.slug),
    }))
  );

  const customCount = articlesWithCustomStatus.filter((a) => a.isCustom).length;
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Artikel Edukasi &amp; Wawasan
          </h1>
          <p className="text-xs text-on-surface-variant">
            Buat dan edit artikel yang langsung terbit di website publik secara real-time tanpa build/deploy ulang.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-container px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-deep-black shadow-sm transition-all hover:opacity-95"
        >
          <Plus className="size-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-hairline bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-gray">Total Artikel</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">{articles.length}</p>
        </div>
        <div className="rounded-lg border border-border-hairline bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-gray flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary" />
            Artikel Real-time (Kustom)
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">{customCount}</p>
        </div>
        <div className="rounded-lg border border-border-hairline bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-gray">Kategori Aktif</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">{categories.length}</p>
        </div>
      </div>

      {/* Articles Table/List */}
      <div className="overflow-hidden rounded-xl border border-border-hairline bg-surface shadow-sm">
        <div className="border-b border-border-hairline px-4 py-3 sm:px-6">
          <h2 className="text-sm font-semibold text-on-surface">
            Semua Artikel ({articles.length})
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-gray">Belum ada artikel yang tersedia.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-hairline">
            {articlesWithCustomStatus.map((article) => (
              <div
                key={article.slug}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-surface-container-lowest sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface">
                      {article.category}
                    </span>

                    {article.isCustom ? (
                      <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                        Real-time
                      </span>
                    ) : (
                      <span className="rounded bg-surface-container-low px-2 py-0.5 text-[10px] text-muted-gray">
                        Bawaan Sistem
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-gray">
                      <Clock className="size-3" />
                      {article.readingMinutes} mnt
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface truncate">
                    {article.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-1">
                    {article.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-gray">
                    <span>Slug: <code className="font-mono text-on-surface">{article.slug}</code></span>
                    <span>•</span>
                    <span>Terbit: {article.publishedAt}</span>
                    {article.updatedAt ? (
                      <>
                        <span>•</span>
                        <span>Update: {article.updatedAt}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/knowledge/${article.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-md border border-border-hairline px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                    title="Lihat tampilan publik"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Lihat</span>
                  </Link>

                  <Link
                    href={`/admin/articles/${article.slug}/edit`}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
                    title="Edit artikel"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit</span>
                  </Link>

                  {article.isCustom ? (
                    <DeleteArticleButton slug={article.slug} title={article.title} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
