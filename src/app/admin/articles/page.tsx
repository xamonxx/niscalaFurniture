import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, CheckCircle2, XCircle, FileText } from "lucide-react";

import { isAdminAuthenticated } from "@/lib/auth";
import { getAllArticles, isCustomArticle } from "@/lib/articles";
import { ArticlesList } from "@/components/admin/articles-list";

export const metadata = {
  title: "Daftar Artikel — Admin Niscala",
};

export default async function AdminArticlesPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  // Include both active and inactive articles for admin view
  const articles = await getAllArticles({ includeInactive: true });

  // Attach isCustom flag to distinguish system baseline articles
  const articlesWithCustomStatus = await Promise.all(
    articles.map(async (article) => ({
      ...article,
      status: article.status || "aktif",
      isCustom: await isCustomArticle(article.slug),
    }))
  );

  const activeCount = articlesWithCustomStatus.filter(
    (a) => a.status === "aktif"
  ).length;
  const inactiveCount = articlesWithCustomStatus.filter(
    (a) => a.status === "tidak_aktif"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Artikel Edukasi &amp; Wawasan
          </h1>
          <p className="text-xs text-on-surface-variant">
            Kelola artikel publik secara real-time. Anda dapat memfilter status <strong className="text-primary font-semibold">Aktif (Tayang)</strong> dan <strong className="text-muted-gray font-semibold">Tidak Aktif (Draft)</strong>.
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
          <p className="text-xs font-medium text-muted-gray flex items-center gap-1.5">
            <FileText className="size-3.5 text-on-surface-variant" />
            Total Artikel
          </p>
          <p className="mt-1 text-2xl font-bold text-on-surface">
            {articles.length}
          </p>
        </div>

        <div className="rounded-lg border border-border-hairline bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-gray flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-primary" />
            Artikel Aktif (Tayang di Publik)
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">{activeCount}</p>
        </div>

        <div className="rounded-lg border border-border-hairline bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-gray flex items-center gap-1.5">
            <XCircle className="size-3.5 text-muted-gray" />
            Artikel Tidak Aktif (Draft)
          </p>
          <p className="mt-1 text-2xl font-bold text-muted-gray">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Interactive Filterable Articles List */}
      <ArticlesList articles={articlesWithCustomStatus} />
    </div>
  );
}
