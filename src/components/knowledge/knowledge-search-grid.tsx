"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, X, FileQuestion } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { formatArticleDateShort } from "@/lib/article-utils";
import type { KnowledgeArticle } from "@/types";

type Props = {
  articles: KnowledgeArticle[];
};

/**
 * Client-side search over the full guide list.
 *
 * The list is small enough (dozens, not thousands) that filtering the array
 * already in memory is simpler and faster than a round trip - no debounce,
 * no loading state, no server action.
 */
export function KnowledgeSearchGrid({ articles }: Props) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? articles.filter((article) =>
        [article.title, article.category, article.summary]
          .join(" ")
          .toLowerCase()
          .includes(trimmed)
      )
    : articles;

  return (
    <div className="space-y-space-xl">
      <div className="relative ml-auto w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-gray" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari panduan berdasarkan judul atau topik..."
          className="w-full rounded-lg border border-border-hairline bg-surface-container-lowest py-2.5 pl-10 pr-9 text-body-sm text-on-surface placeholder:text-muted-gray transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-gray hover:text-on-surface"
            title="Hapus pencarian"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container-lowest py-space-4xl text-center shadow-hairline">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-muted-gray">
            <FileQuestion className="size-5" />
          </span>
          <p className="text-body-md font-semibold text-on-surface">
            Tidak ada panduan yang cocok
          </p>
          <p className="text-body-sm text-muted-gray">
            Coba kata kunci lain, misalnya nama material atau ruangan.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-space-xs text-label-md font-semibold text-primary underline underline-offset-2"
          >
            Hapus pencarian
          </button>
        </div>
      ) : (
        <RevealGroup as="ul" className="grid gap-gutter-desktop md:grid-cols-2">
          {filtered.map((article, index) => (
            <RevealItem as="li" key={article.slug}>
              <Link
                href={`/knowledge/${article.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-hairline transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-panel"
              >
                {article.coverImage ? (
                  <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-container-high">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Cover is an admin upload/pasted URL with no pipeline variants, same reasoning as in-body images. */}
                    <img
                      src={article.coverImage}
                      alt={article.coverImageAlt || article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  // No photo yet: the ghost index number is the only
                  // "image" a text-only card gets, enough to stop cards
                  // reading as one undifferentiated block of type.
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-2 -top-4 text-6xl font-bold text-on-surface/[0.04] transition-colors duration-300 group-hover:text-primary/10"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}

                <div className="relative flex flex-1 flex-col gap-space-sm p-space-xl">
                  <span className="inline-flex items-center gap-space-2xs text-label-md text-muted-gray">
                    <Clock aria-hidden className="size-3.5" />
                    {article.readingMinutes} menit baca
                  </span>

                  <div className="flex items-start justify-between gap-space-sm">
                    <h2 className="text-headline-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
                      {article.title}
                    </h2>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-hairline-strong transition-all duration-300 group-hover:border-primary-container group-hover:bg-primary-container">
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-deep-black"
                      />
                    </span>
                  </div>

                  <p className="flex-1 text-body-sm leading-relaxed text-on-surface-variant">
                    {article.summary}
                  </p>

                  <div className="flex items-center justify-between gap-space-sm border-t border-border-hairline/60 pt-space-sm">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-muted-gray">
                      {formatArticleDateShort(article.updatedAt ?? article.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
