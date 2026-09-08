import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/ui/project-card";
import type { Project } from "@/types";

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
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
            priority={index < 3}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
