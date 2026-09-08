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
          className="grid gap-gutter-desktop sm:grid-cols-2 lg:grid-cols-3"
        >
          {selection.map((project, index) => (
            <RevealItem as="li" key={project.slug}>
              <ProjectCard
                project={project}
                ratio={index === 0 ? "tall" : "standard"}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
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
