import { Approach } from "@/components/sections/approach";
import { BehindTheScenes } from "@/components/sections/behind-the-scenes";
import { CaseStudy } from "@/components/sections/case-study";
import { ClosingCta } from "@/components/sections/closing-cta";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Faq } from "@/components/sections/faq";
import { Guarantees } from "@/components/sections/guarantees";
import { Hero } from "@/components/sections/hero";
import { KnowledgePreview } from "@/components/sections/knowledge-preview";
import { Materials } from "@/components/sections/materials";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { Problems } from "@/components/sections/problems";
import { Process } from "@/components/sections/process";
import { ServicesGrid } from "@/components/sections/services-grid";
import { Survey } from "@/components/sections/survey";
import { Testimonials } from "@/components/sections/testimonials";
import { Timeline } from "@/components/sections/timeline";
import { populatedCategories } from "@/data/projects";
import {
  ORGANISATION_ID,
  absoluteUrl,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = buildMetadata({
  title: `${site.name} — Interior & Furniture Custom`,
  // The full site.description runs to 177 characters; a SERP shows about 155.
  description: site.metaDescription,
  path: "/",
});

/**
 * Homepage graph.
 *
 * The business and website entities live in the root layout; this adds the
 * page node and the list of services the studio actually publishes work for,
 * each pointing back at the same organisation @id.
 */
function homeJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/",
      name: `${site.name} — Interior & Furniture Custom`,
      description: site.metaDescription,
    }),
    {
      "@type": "ItemList",
      "@id": `${site.url}/#services`,
      name: "Layanan Niscala Furniture",
      itemListElement: populatedCategories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          "@id": `${absoluteUrl(`/portfolio/kategori/${category.slug}`)}#service`,
          name: category.seoTitle,
          description: category.description,
          serviceType: category.name,
          provider: { "@id": ORGANISATION_ID },
          url: absoluteUrl(`/portfolio/kategori/${category.slug}`),
        },
      })),
    }
  );
}

/**
 * Homepage.
 *
 * A Server Component that composes the seventeen sections of the approved
 * layout. Only the sections that genuinely need the browser - the process
 * storyteller, the before/after slider, the FAQ accordion and the survey form -
 * ship any client JavaScript (pasal 18).
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(homeJsonLd())}
      />

      <Hero />
      <Problems />
      <Approach />
      <PortfolioPreview />
      <CaseStudy />
      <ServicesGrid />
      <KnowledgePreview />
      <Process />
      <Timeline />
      <Materials />
      <Guarantees />
      <Testimonials />
      <Faq />
      <CtaBanner reserveCurveSpace={false} />
      <Survey />
      <BehindTheScenes />
      <ClosingCta />
    </>
  );
}
