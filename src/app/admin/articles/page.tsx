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
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Artikel Edukasi &amp; Wawasan
          </h1>
          <p className="max-w-xl text-sm text-on-surface-variant">
            Kelola artikel publik secara real-time. Filter status{" "}
            <strong className="font-semibold text-primary">Aktif (Tayang)</strong> dan{" "}
            <strong className="font-semibold text-muted-gray">Tidak Aktif (Draft)</strong>.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-deep-black shadow-hairline transition-all hover:bg-primary-container-hover active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 divide-y divide-border-hairline overflow-hidden rounded-xl border border-border-hairline bg-surface shadow-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-3.5 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
            <FileText className="size-[1.125rem]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-gray">
              Total Artikel
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-on-surface">
              {articles.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="size-[1.125rem]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-gray">
              Aktif &middot; Tayang di Publik
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-muted-gray">
            <XCircle className="size-[1.125rem]" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-gray">
              Tidak Aktif &middot; Draft
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-muted-gray">
              {inactiveCount}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Filterable Articles List */}
      <ArticlesList articles={articlesWithCustomStatus} />
    </div>
  );
}
