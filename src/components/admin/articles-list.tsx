"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Edit3,
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  FileQuestion,
} from "lucide-react";
import type { KnowledgeArticle } from "@/types";
import { ToggleStatusButton } from "./toggle-status-button";
import { DeleteArticleButton } from "./delete-article-button";

type ArticleWithMeta = KnowledgeArticle & {
  isCustom: boolean;
};

type Props = {
  articles: ArticleWithMeta[];
};

export function ArticlesList({ articles }: Props) {
  const [filter, setFilter] = useState<"semua" | "aktif" | "tidak_aktif">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const activeArticles = articles.filter(
    (a) => (a.status || "aktif") === "aktif"
  );
  const inactiveArticles = articles.filter(
    (a) => a.status === "tidak_aktif"
  );

  const filtered = articles
    .filter((a) => {
      const currentStatus = a.status || "aktif";
      if (filter === "aktif") return currentStatus === "aktif";
      if (filter === "tidak_aktif") return currentStatus === "tidak_aktif";
      return true;
    })
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.slug.toLowerCase().includes(query)
      );
    });

  const hasActiveFilter = filter !== "semua" || searchQuery.trim().length > 0;

  const clearFilters = () => {
    setFilter("semua");
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div
          role="tablist"
          className="inline-flex w-full flex-wrap gap-1 rounded-lg border border-border-hairline bg-surface-container-low p-1 sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "semua"}
            onClick={() => setFilter("semua")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "semua"
                ? "bg-surface text-on-surface shadow-hairline"
                : "text-muted-gray hover:text-on-surface"
            }`}
          >
            Semua <span className="tabular-nums">({articles.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "aktif"}
            onClick={() => setFilter("aktif")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "aktif"
                ? "bg-surface text-primary shadow-hairline"
                : "text-muted-gray hover:text-on-surface"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            Aktif <span className="tabular-nums">({activeArticles.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "tidak_aktif"}
            onClick={() => setFilter("tidak_aktif")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "tidak_aktif"
                ? "bg-surface text-on-surface shadow-hairline"
                : "text-muted-gray hover:text-on-surface"
            }`}
          >
            <XCircle className="size-3.5" />
            Tidak Aktif <span className="tabular-nums">({inactiveArticles.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau kategori..."
            className="w-full rounded-lg border border-border-hairline bg-surface py-2 pl-9 pr-8 text-xs text-on-surface placeholder:text-muted-gray transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-gray hover:text-on-surface"
              title="Hapus pencarian"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Articles Table/List Container */}
      <div className="overflow-hidden rounded-xl border border-border-hairline bg-surface shadow-hairline">
        <div className="flex items-center justify-between border-b border-border-hairline bg-surface-container-low/40 px-4 py-3 sm:px-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-gray">
            Menampilkan:{" "}
            <span className="text-on-surface">
              {filter === "semua" && `Semua Artikel (${filtered.length})`}
              {filter === "aktif" && `Artikel Aktif / Publik (${filtered.length})`}
              {filter === "tidak_aktif" && `Artikel Tidak Aktif / Draft (${filtered.length})`}
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-muted-gray">
              <FileQuestion className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-on-surface">
                Tidak ada artikel yang cocok
              </p>
              <p className="text-xs text-muted-gray">
                Coba ubah kata kunci pencarian atau filter status di atas.
              </p>
            </div>
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border-hairline px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Reset filter &amp; pencarian
              </button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-border-hairline">
            {filtered.map((article) => {
              const isActive = (article.status || "aktif") === "aktif";

              return (
                <div
                  key={article.slug}
                  className={`group relative flex flex-col gap-4 border-l-2 p-4 transition-colors hover:bg-surface-container-lowest sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                    isActive
                      ? "border-l-transparent"
                      : "border-l-border-hairline-strong bg-surface-container-low/30"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <span className="size-1.5 rounded-full bg-primary" />
                          Aktif (Publik)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted-gray/15 px-2 py-0.5 text-[10px] font-bold text-muted-gray">
                          <span className="size-1.5 rounded-full bg-muted-gray" />
                          Tidak Aktif (Draft)
                        </span>
                      )}

                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-surface">
                        {article.category}
                      </span>

                      {article.isCustom ? (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary/15 px-2 py-0.5 text-[10px] font-medium text-on-surface">
                          <Sparkles className="size-2.5 text-primary" />
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

                    <h3 className="text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {article.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-gray">
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

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0 pt-2 sm:pt-0">
                    {/* Toggle Active / Inactive status button */}
                    <ToggleStatusButton
                      slug={article.slug}
                      currentStatus={isActive ? "aktif" : "tidak_aktif"}
                    />

                    {/* View Live Article (only if active) */}
                    {isActive ? (
                      <Link
                        href={`/knowledge/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-border-hairline px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                        title="Lihat tampilan publik"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Lihat</span>
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-border-hairline/40 px-2.5 py-1.5 text-xs font-medium text-muted-gray opacity-50 cursor-not-allowed"
                        title="Artikel berstatus Tidak Aktif (Draft), tidak dapat diakses publik"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Draft</span>
                      </span>
                    )}

                    {/* Edit button */}
                    <Link
                      href={`/admin/articles/${article.slug}/edit`}
                      className="inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2.5 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-highest transition-colors"
                      title="Edit artikel"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit</span>
                    </Link>

                    {/* Delete button (for custom articles) */}
                    {article.isCustom ? (
                      <DeleteArticleButton slug={article.slug} title={article.title} />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
