import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import {
  featuredProjects,
  getProjectsByCategory,
  heroProject,
  photoCount,
  projectCount,
} from "@/data/projects";

/*
 * Slot widths for this section's own grid.
 *
 * Deliberately not `portfolioGridSizes`: that one describes /portfolio, which
 * is a single column below 640px, while this preview is two-up all the way
 * down. Everything from 640px up is identical - container capped at 1440px,
 * 64px gutters above 1024px, 32px grid gap - so only the last clause differs,
 * where the pair sits inside a 20px margin and a 12px gap.
 */
const PREVIEW_SIZES = [
  "(min-width: 1440px) 416px",
  "(min-width: 1024px) calc((100vw - 192px) / 3)",
  "(min-width: 640px) calc((100vw - 72px) / 2)",
  "calc((100vw - 52px) / 2)",
].join(", ");

/**
 * Section 04 - Selected portfolio.
 *
 * One project per category so the grid demonstrates range. The counts in the
 * call to action come from the data itself rather than a rounded-up claim.
 */
export function PortfolioPreview() {
  // The hero already shows one project in full bleed; swap it out here so the
  // same photograph does not appear twice on one page.
  const selection = featuredProjects
    .map((project) => {
      if (project.slug !== heroProject.slug) return project;
      const alternative = getProjectsByCategory(project.categorySlug).find(
        (candidate) => candidate.slug !== heroProject.slug
      );
      return alternative ?? project;
    })
    .slice(0, 6);

  return (
    <section id="portfolio" className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <div className="max-w-2xl space-y-space-xs">
              <Eyebrow>Portofolio terpilih</Eyebrow>
              <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
                Lihat bagaimana sebuah kebutuhan berubah menjadi ruang.
              </h2>
            </div>
            <p className="shrink-0 text-body-sm text-on-surface-variant">
              {projectCount} proyek • {photoCount} foto pengerjaan
            </p>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop sm:grid-cols-2 lg:grid-cols-3"
        >
          {selection.map((project, index) => (
            <RevealItem as="li" key={project.slug}>
              <ProjectCard
                project={project}
                ratio={index === 0 ? "tall" : "standard"}
                sizes={PREVIEW_SIZES}
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-space-2xl text-center">
          <Button href="/portfolio" variant="surface">
            Jelajahi Semua Proyek
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
