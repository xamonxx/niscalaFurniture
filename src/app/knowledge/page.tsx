import { PageHeader } from "@/components/layout/page-header";
import { CtaBanner } from "@/components/sections/cta-banner";
import { KnowledgeSearchGrid } from "@/components/knowledge/knowledge-search-grid";
import { articleSeoTitle } from "@/data/knowledge";
import { getAllArticles } from "@/lib/articles";
import type { KnowledgeArticle } from "@/types";
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
function knowledgeJsonLd(articles: KnowledgeArticle[]) {
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
      blogPost: articles.map((article) => ({
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

export default async function KnowledgePage() {
  const articles = await getAllArticles();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(knowledgeJsonLd(articles))}
      />

      <PageHeader
        eyebrow="Edukasi & wawasan"
        title="Kenali apa yang akan menjadi bagian dari rumah Anda bertahun-tahun."
        lead="Panduan praktis yang menjawab pertanyaan paling sering muncul sebelum sebuah proyek dimulai — ditulis sedetail yang biasanya kami jelaskan saat survey."
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <KnowledgeSearchGrid articles={articles} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
