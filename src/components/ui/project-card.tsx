import Image from "next/image";
import Link from "next/link";

import { blurPlaceholder } from "@/lib/image-placeholder";
import { cn } from "@/lib/cn";
import type { Project } from "@/types";

/**
 * Aspect ratios are portrait-first by design: every photograph in the studio
 * archive is a vertical frame, so forcing a 16:10 editorial crop would throw
 * away most of the cabinetry in each shot.
 */
const RATIO = {
  tall: "aspect-[3/4]",
  standard: "aspect-[4/5]",
} as const;

export type ProjectCardProps = {
  project: Project;
  /** Taller frame for the lead item in a grid. */
  ratio?: keyof typeof RATIO;
  /** `sizes` for the underlying image - must match the grid slot. */
  sizes: string;
  /**
   * How eagerly to fetch the cover.
   *
   * `"high"` for the one card that is the page's LCP candidate, `"eager"` for
   * the rest of the first row so they do not pop in, `false` below the fold.
   * Not `priority`: Next 16 deprecated that prop, and it now only emits a
   * <link rel=preload> without setting fetchpriority on the tag.
   */
  loadPriority?: "high" | "eager" | false;
  className?: string;
};

export function ProjectCard({
  project,
  ratio = "standard",
  sizes,
  loadPriority = false,
  className,
}: ProjectCardProps) {
  const meta = [project.location, project.year ? String(project.year) : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className={cn("group", className)}>
      <Link
        href={`/portfolio/${project.slug}`}
        className="block focus-visible:outline-offset-4"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-surface-container-high",
            RATIO[ratio]
          )}
        >
          {/* The scroll drift lives on a wrapper, not on the image: an
              animation on `transform` would override the hover transition
              below, and the two need to compose rather than fight. */}
          <div className="media-drift absolute inset-0">
            <Image
              src={project.coverImage}
              alt={project.gallery[0]?.alt ?? project.title}
              fill
              sizes={sizes}
              loading={loadPriority ? "eager" : "lazy"}
              fetchPriority={loadPriority === "high" ? "high" : "auto"}
              /*
                The blur stand-in matters more here than it would on a fast
                host. Covers are served through the Next image optimiser, and
                the first request for a variant is a cold AVIF encode - low
                seconds on this shared plan. Without a placeholder the whole
                grid is flat grey rectangles for that entire window.
              */
              {...blurPlaceholder(project.coverBlurDataURL)}
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          </div>
          {/* Scrim keeps the metadata legible over bright kitchen photography.
              Sized at half the card rather than two fifths: a title that wraps
              to three lines would otherwise reach past the gradient and land on
              the photograph itself. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-deep-black/85 via-deep-black/45 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-space-md text-pure-white">
            <span className="text-label-eyebrow uppercase text-primary-container">
              {project.categoryShort}
            </span>
            <h3 className="mt-space-2xs text-headline-sm font-semibold leading-tight">
              {project.title}
            </h3>
            {meta ? (
              <p className="mt-space-2xs text-body-sm text-surface-container-highest">
                {meta}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
