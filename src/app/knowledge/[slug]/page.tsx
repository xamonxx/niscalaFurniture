import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { arrowRowClasses, Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  articleSeoTitle,
  knowledgeArticles,
  knowledgeBySlug,
} from "@/data/knowledge";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import type { KnowledgeArticle } from "@/types";

/**
 * Every valid slug comes from generateStaticParams, so anything else is a real
 * 404. Without this, the root loading.tsx boundary starts streaming a 200
 * response before the page can call notFound(), turning every unknown URL into
 * a soft 404 that search engines treat as a duplicate page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return knowledgeArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(props: PageProps<"/knowledge/[slug]">) {
  const { slug } = await props.params;
  const article = knowledgeBySlug(slug);

  if (!article) {
    return buildMetadata({
      title: "Artikel tidak ditemukan",
      description: "Panduan yang Anda cari tidak tersedia.",
      path: `/knowledge/${slug}`,
    });
  }

  return buildMetadata({
    title: articleSeoTitle(article),
    description: article.summary,
    path: `/knowledge/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  });
}

/** "2026-01-15" -> "15 Januari 2026". */
function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function articleGraph(article: KnowledgeArticle) {
  const path = `/knowledge/${article.slug}`;
  const url = absoluteUrl(path);

  return jsonLdGraph(
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: articleSeoTitle(article),
      alternativeHeadline: article.title,
      description: article.summary,
      articleSection: article.category,
      datePublished: article.publishedAt,
      // Emitted only when the article has genuinely been revised: a
      // dateModified that tracks the build would be a freshness claim the
      // content does not back up.
      ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
      wordCount: countWords(article),
      timeRequired: `PT${article.readingMinutes}M`,
      inLanguage: "id-ID",
      author: { "@id": ORGANISATION_ID },
      publisher: { "@id": ORGANISATION_ID },
      isPartOf: { "@id": `${url}#webpage` },
      mainEntityOfPage: { "@id": `${url}#webpage` },
    },
    webPageJsonLd({
      path,
      name: articleSeoTitle(article),
      description: article.summary,
      breadcrumb: true,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: "Panduan", path: "/knowledge" },
      { name: article.category, path },
    ])
  );
}

/** Rough word count over the typed body blocks, for Article structured data. */
function countWords(article: KnowledgeArticle): number {
  const text = article.body
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
          return block.text;
        case "list":
          return block.items.join(" ");
        case "callout":
          return `${block.title} ${block.text}`;
      }
    })
    .join(" ");

  return text.split(/\s+/).filter(Boolean).length;
}

export default async function ArticlePage(props: PageProps<"/knowledge/[slug]">) {
  const { slug } = await props.params;
  const article = knowledgeBySlug(slug);

  if (!article) notFound();

  const others = knowledgeArticles.filter((item) => item.slug !== article.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(articleGraph(article))}
      />

      <article className="bg-surface py-space-3xl lg:py-space-4xl">
        <div className="container-editorial">
          <Link
            href="/knowledge"
            className={cn(arrowRowClasses, "text-on-surface-variant hover:text-on-surface")}
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            Semua panduan
          </Link>

          <header className="mx-auto mt-space-lg max-w-3xl space-y-space-sm">
            <Eyebrow>{article.category}</Eyebrow>
            <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              {article.title}
            </h1>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {article.summary}
            </p>
            {/*
              Author and dates are on the page, not just in the markup: this is
              the byline a reader (and an E-E-A-T assessment) looks for.
            */}
            <div className="flex flex-wrap items-center gap-x-space-md gap-y-space-2xs text-label-md text-muted-gray">
              <span>
                Ditulis oleh{" "}
                <span className="font-semibold text-on-surface-variant">
                  Tim Teknis {site.name}
                </span>
              </span>
              <span aria-hidden>&bull;</span>
              <span>
                {article.updatedAt ? "Diperbarui" : "Dipublikasikan"}{" "}
                <time dateTime={article.updatedAt ?? article.publishedAt}>
                  {formatArticleDate(article.updatedAt ?? article.publishedAt)}
                </time>
              </span>
              <span aria-hidden>&bull;</span>
              <span className="inline-flex items-center gap-space-2xs">
                <Clock aria-hidden className="size-4" />
                {article.readingMinutes} menit baca
              </span>
            </div>
          </header>

          <div className="mx-auto mt-space-2xl max-w-3xl space-y-space-lg">
            {article.body.map((block, index) => {
              switch (block.type) {
                case "heading":
                  return (
                    <h2
                      key={index}
                      className="pt-space-md text-headline-md-mobile text-on-surface lg:text-headline-md"
                    >
                      {block.text}
                    </h2>
                  );
                case "paragraph":
                  return (
                    <p
                      key={index}
                      className="text-body-lg leading-relaxed text-on-surface-variant"
                    >
                      {block.text}
                    </p>
                  );
                case "list":
                  return (
                    <ul key={index} className="space-y-space-xs">
                      {block.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-space-sm text-body-md leading-relaxed text-on-surface-variant"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-container"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                case "callout":
                  return (
                    <aside
                      key={index}
                      className="space-y-space-2xs rounded-md border-l-2 border-primary-container bg-surface-container-low p-space-lg"
                    >
                      <p className="text-label-lg font-semibold text-on-surface">
                        {block.title}
                      </p>
                      <p className="text-body-md leading-relaxed text-on-surface-variant">
                        {block.text}
                      </p>
                    </aside>
                  );
              }
            })}
          </div>

          <div className="mx-auto mt-space-3xl max-w-3xl rounded-md bg-surface-container-low p-space-xl">
            <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className="text-headline-sm font-semibold text-on-surface">
                  Masih ragu menentukan pilihan?
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Kirimkan kondisi ruangan Anda, kami bantu rekomendasikan yang
                  paling masuk akal.
                </p>
              </div>
              <WhatsAppCta
                source="faq"
                className="shrink-0"
                context={`Saya membaca panduan: ${article.title}.`}
              >
                Tanya Tim Teknis
              </WhatsAppCta>
            </div>
          </div>
        </div>
      </article>

      {others.length > 0 ? (
        <section className="border-t border-border-hairline bg-surface-container-low py-space-4xl">
          <div className="container-editorial">
            <h2 className="mb-space-xl text-headline-md-mobile text-on-surface lg:text-headline-md">
              Panduan lainnya
            </h2>
            <ul className="grid gap-gutter-desktop md:grid-cols-3">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/knowledge/${item.slug}`}
                    className="group block h-full space-y-space-sm rounded-md bg-surface-container-lowest p-space-lg shadow-hairline transition-shadow hover:shadow-panel"
                  >
                    <Eyebrow>{item.category}</Eyebrow>
                    <h3 className="text-headline-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
