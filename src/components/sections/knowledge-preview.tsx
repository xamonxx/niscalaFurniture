import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow, TextLink } from "@/components/ui/typography";
import { getAllArticles } from "@/lib/articles";
import { formatArticleDateShort } from "@/lib/article-utils";

/** Section 07 - Knowledge centre. */
export async function KnowledgePreview() {
  const all = await getAllArticles();
  const articles = all.slice(0, 4);

  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl flex flex-wrap items-end justify-between gap-space-md">
            <div className="max-w-2xl space-y-space-xs">
              <Eyebrow>Edukasi &amp; wawasan</Eyebrow>
              <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
                Kenali apa yang akan menjadi bagian dari rumah Anda bertahun-tahun.
              </h2>
            </div>
            {/* Only worth a link once there is more to see than the four cards below. */}
            {all.length > 4 ? (
              <TextLink href="/knowledge" className="shrink-0">
                Lihat Semua Panduan
              </TextLink>
            ) : null}
          </div>
        </Reveal>

        <RevealGroup as="ul" className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 sm:gap-gutter-desktop">
          {articles.map((article) => (
            <RevealItem as="li" key={article.slug}>
              {/*
                The whole card is the target now, not just the bottom row - a
                48x220px tap area invites a read far more than a single 16px
                text link buried under two paragraphs of unlinked type did.
              */}
              <Link
                href={`/knowledge/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-md bg-surface-container-lowest shadow-hairline transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-panel"
              >
                {article.coverImage ? (
                  <div className="aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface-container-high">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Cover is an admin upload/pasted URL with no pipeline variants. */}
                    <img
                      src={article.coverImage}
                      alt={article.coverImageAlt || article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col gap-space-sm p-space-lg">
                  <span className="inline-flex items-center gap-space-2xs text-label-md text-muted-gray">
                    <Clock aria-hidden className="size-3.5" />
                    {article.readingMinutes} menit baca
                  </span>
                  <div className="flex items-start justify-between gap-space-sm">
                    <h3 className="text-headline-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border-hairline-strong transition-colors duration-300 group-hover:border-primary-container group-hover:bg-primary-container">
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
      </div>
    </section>
  );
}
