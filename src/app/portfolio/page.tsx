import { PageHeader } from "@/components/layout/page-header";
import { CategoryFilter } from "@/components/portfolio/category-filter";
import { ProjectGrid } from "@/components/portfolio/project-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import {
  photoCount,
  projectCount,
  projects,
  servedLocations,
} from "@/data/projects";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

// Naming all ten categories no longer fits the 158-character snippet, so this
// names the two the studio is best known for and then the property segments,
// which is what the newer half of the portfolio is actually indexed on.
const PORTFOLIO_DESCRIPTION = `Dokumentasi ${projectCount} proyek furniture custom Niscala: kitchen set, lemari pakaian, sampai interior rumah penuh di apartemen, perumahan, dan rumah subsidi.`;

export const metadata = buildMetadata({
  title: "Portofolio Proyek",
  description: PORTFOLIO_DESCRIPTION,
  path: "/portfolio",
});

function portfolioJsonLd() {
  return jsonLdGraph(
    {
      ...webPageJsonLd({
        path: "/portfolio",
        name: "Portofolio Proyek Niscala Furniture",
        description: PORTFOLIO_DESCRIPTION,
        type: "CollectionPage",
        breadcrumb: true,
        primaryImage: projects[0]?.coverImage,
      }),
      hasPart: projects.map((project) => ({
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(`/portfolio/${project.slug}`)}#project`,
        name: project.title,
        url: absoluteUrl(`/portfolio/${project.slug}`),
      })),
    },
    breadcrumbJsonLd([{ name: "Portofolio", path: "/portfolio" }])
  );
}

export default function PortfolioPage() {
  const locations = servedLocations.slice(0, 10).join(", ");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(portfolioJsonLd())}
      />

      <PageHeader
        eyebrow="Portofolio"
        title="Setiap proyek punya ukuran, kebutuhan, dan cerita yang berbeda."
        lead={
          <>
            {projectCount} proyek dengan {photoCount} foto pengerjaan nyata.
            {locations ? ` Tersebar di ${locations}, dan kota lainnya.` : ""}
          </>
        }
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial space-y-space-xl">
          <CategoryFilter />
          <ProjectGrid projects={projects} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
