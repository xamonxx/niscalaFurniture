import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/ui/project-card";
import type { Project } from "@/types";

/*
 * Slot widths, spelled out rather than approximated.
 *
 * `container-editorial` caps at 1440px with a 64px gutter above 1024px and a
 * 20px one below, and the grid gap is 32px. The old `30vw` was a stand-in for
 * that arithmetic and it drifted badly on wide screens: on a 1920px display a
 * card is 416px, not 576px, so the browser was picking the 1200w variant where
 * 828w would have done - roughly twice the bytes, and a second cold AVIF
 * encode on the server for a variant nothing needed.
 */
export const portfolioGridSizes = [
  "(min-width: 1440px) 416px",
  "(min-width: 1024px) calc((100vw - 192px) / 3)",
  "(min-width: 640px) calc((100vw - 72px) / 2)",
  "calc(100vw - 40px)",
].join(", ");

/** Shared portfolio grid, used by the index and every category page. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="rounded-md bg-surface-container-low p-space-xl text-center text-body-md text-on-surface-variant">
        Belum ada project yang dipublikasikan untuk kategori ini. Hubungi kami
        untuk melihat dokumentasi lengkapnya.
      </p>
    );
  }

  return (
    <RevealGroup
      as="ul"
      className="grid gap-gutter-desktop sm:grid-cols-2 lg:grid-cols-3"
    >
      {projects.map((project, index) => (
        <RevealItem as="li" key={project.slug}>
          <ProjectCard
            project={project}
            sizes={portfolioGridSizes}
            /*
              One high-priority image, not three. Marking the whole first row
              high makes the browser split its bandwidth between them, which
              delays whichever one actually turns out to be the LCP element.
            */
            loadPriority={index === 0 ? "high" : index < 3 ? "eager" : false}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
