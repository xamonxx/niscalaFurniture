import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Eyebrow } from "@/components/ui/typography";
import { articleSeoTitle, knowledgeArticles } from "@/data/knowledge";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

const KNOWLEDGE_DESCRIPTION =
  "Panduan praktis sebelum membuat custom furniture: pemilihan material, ergonomi dapur, perencanaan penyimpanan, dan persiapan sebelum renovasi.";

export const metadata = buildMetadata({
  title: "Panduan Furniture Custom",
  description: KNOWLEDGE_DESCRIPTION,
  path: "/knowledge",
});

/**
 * `Blog` rather than a bare CollectionPage: it is the type that ties a set of
 * articles to a publisher, which is what the knowledge centre is for.
 */
function knowledgeJsonLd() {
  return jsonLdGraph(
    {
      ...webPageJsonLd({
        path: "/knowledge",
        name: "Panduan Furniture Custom",
        description: KNOWLEDGE_DESCRIPTION,
        type: "CollectionPage",
        breadcrumb: true,
      }),
      "@type": ["CollectionPage", "Blog"],
      publisher: { "@id": ORGANISATION_ID },
      blogPost: knowledgeArticles.map((article) => ({
        "@type": "Article",
        "@id": `${absoluteUrl(`/knowledge/${article.slug}`)}#article`,
        headline: articleSeoTitle(article),
        description: article.summary,
        datePublished: article.publishedAt,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        url: absoluteUrl(`/knowledge/${article.slug}`),
        author: { "@id": ORGANISATION_ID },
      })),
    },
    breadcrumbJsonLd([{ name: "Panduan", path: "/knowledge" }])
  );
}

export default function KnowledgePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(knowledgeJsonLd())}
      />

      <PageHeader
        eyebrow="Edukasi & wawasan"
        title="Kenali apa yang akan menjadi bagian dari rumah Anda bertahun-tahun."
        lead="Empat panduan yang menjawab pertanyaan paling sering muncul sebelum sebuah proyek dimulai — ditulis sedetail yang biasanya kami jelaskan saat survey."
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <RevealGroup as="ul" className="grid gap-gutter-desktop md:grid-cols-2">
            {knowledgeArticles.map((article) => (
              <RevealItem as="li" key={article.slug}>
                <Link
                  href={`/knowledge/${article.slug}`}
                  className="group flex h-full flex-col justify-between gap-space-lg rounded-md bg-surface-container-lowest p-space-xl shadow-hairline transition-shadow hover:shadow-panel"
                >
                  <div className="space-y-space-sm">
                    <Eyebrow>{article.category}</Eyebrow>
                    <h2 className="text-headline-sm font-semibold leading-snug text-on-surface">
                      {article.title}
                    </h2>
                    <p className="text-body-sm leading-relaxed text-on-surface-variant">
                      {article.summary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-label-md">
                    <span className="inline-flex items-center gap-space-2xs text-muted-gray">
                      <Clock aria-hidden className="size-4" />
                      {article.readingMinutes} menit baca
                    </span>
                    <span className="inline-flex items-center gap-space-2xs font-semibold text-on-surface transition-colors group-hover:text-primary">
                      Baca panduan
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
