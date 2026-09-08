/**
 * Portfolio data.
 *
 * Every field here traces back to the studio archive: client names, locations,
 * finishing styles and years are parsed from the original file names by
 * `scripts/prepare-images.mjs`. Nothing is invented - a project with no
 * recorded client simply has none.
 */

import manifest from "@/data/generated/portfolio-manifest.json";
import { categories, categoryBySlug } from "@/data/categories";
import type { Orientation, Project, ProjectImage } from "@/types";

type ManifestImage = {
  src: string;
  width: number;
  height: number;
  orientation: string;
  bytes: number;
  source: string;
};

type ManifestProject = {
  slug: string;
  categorySlug: string;
  categoryName: string;
  categoryShort: string;
  client: string | null;
  location: string | null;
  style: string | null;
  year: number | null;
  coverImage: string;
  coverOrientation: string;
  images: ManifestImage[];
};

/** The before/after pair is a case study, not a portfolio entry. */
const CASE_STUDY_CATEGORY = "before-after";

function asOrientation(value: string): Orientation {
  return value === "landscape" || value === "square" ? value : "portrait";
}

/**
 * Project titles read as they would in conversation: "Kitchen Set Ibu Qisty",
 * "Lemari Bawah Tangga Ibu Yeni". Galleries grouped by finishing style or by
 * shoot year get named for that instead.
 */
function buildTitle(
  project: ManifestProject,
  category: { name: string; short: string }
): string {
  if (project.client) return `${category.short} ${project.client}`;
  if (project.style) return `${category.short} ${project.style}`;
  if (project.year) return `${category.short} Koleksi ${project.year}`;
  return category.name;
}

function buildDescription(project: ManifestProject, categoryName: string): string {
  const parts: string[] = [];

  if (project.client) {
    parts.push(
      `Pengerjaan ${categoryName.toLowerCase()} untuk ${project.client}`
    );
  } else {
    parts.push(`Dokumentasi pengerjaan ${categoryName.toLowerCase()}`);
  }

  if (project.location) parts.push(`di ${project.location}`);
  if (project.style) parts.push(`dengan finishing ${project.style.toLowerCase()}`);

  let sentence = `${parts.join(" ")}.`;
  if (project.year) {
    sentence += ` Diselesaikan pada ${project.year}.`;
  }
  return sentence;
}

/**
 * Meta-description variant of the caption above.
 *
 * The bare caption for a style gallery lands around 68 characters, which
 * Google pads out with whatever it scrapes off the page. These suffixes are
 * appended longest-first until the line sits in the 120-155 band a snippet
 * actually renders, and every one of them is a claim the site already makes
 * elsewhere - no invented detail is added to reach a character count.
 */
const SEO_DESCRIPTION_SUFFIXES = [
  "Dari survey ukuran aktual, produksi di workshop sendiri, sampai pemasangan.",
  "Dirancang, diproduksi, dan dipasang langsung oleh tim Niscala Furniture.",
  "Foto asli hasil pengerjaan, bukan render.",
] as const;

const SEO_DESCRIPTION_MIN = 120;
const SEO_DESCRIPTION_MAX = 158;

function buildSeoDescription(base: string): string {
  let line = base;
  for (const suffix of SEO_DESCRIPTION_SUFFIXES) {
    if (line.length >= SEO_DESCRIPTION_MIN) break;
    if (line.length + 1 + suffix.length <= SEO_DESCRIPTION_MAX) {
      line = `${line} ${suffix}`;
    }
  }
  return line;
}

/** Alt text describes the cabinetry and where it stands, not the file. */
function buildAlt(project: ManifestProject, index: number): string {
  const resolved = resolveCategory(project.categorySlug, project.categoryName, project.categoryShort);
  const parts = [`${resolved.name} custom karya Niscala Furniture`];
  if (project.location) parts.push(`di ${project.location}`);
  if (project.style) parts.push(`finishing ${project.style.toLowerCase()}`);
  const base = parts.join(", ");
  return index === 0 ? base : `${base} - detail ${index + 1}`;
}

/**
 * Category names come from categories.ts, never from the manifest.
 *
 * The image pipeline writes a snapshot of the names into the manifest, so
 * renaming a category in categories.ts would otherwise leave stale English
 * labels on every card until someone re-ran the script.
 */
function resolveCategory(slug: string, fallbackName: string, fallbackShort: string) {
  const category = categoryBySlug(slug);
  return {
    name: category?.name ?? fallbackName,
    short: category?.short ?? fallbackShort,
  };
}

function toProject(source: ManifestProject): Project {
  const gallery: ProjectImage[] = source.images.map((image, index) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    orientation: asOrientation(image.orientation),
    alt: buildAlt(source, index),
  }));

  const category = resolveCategory(
    source.categorySlug,
    source.categoryName,
    source.categoryShort
  );

  const description = buildDescription(source, category.name);

  return {
    slug: source.slug,
    title: buildTitle(source, category),
    categorySlug: source.categorySlug,
    categoryName: category.name,
    categoryShort: category.short,
    client: source.client,
    location: source.location,
    style: source.style,
    year: source.year,
    coverImage: source.coverImage,
    coverOrientation: asOrientation(source.coverOrientation),
    gallery,
    description,
    seoDescription: buildSeoDescription(description),
  };
}

/**
 * When the portfolio content itself last changed.
 *
 * Written by `scripts/prepare-images.mjs`, so it moves only when the archive is
 * re-processed. The sitemap uses it instead of `new Date()`, which used to mark
 * every project URL as freshly modified on each build.
 */
export const portfolioUpdatedAt: string = manifest.generatedAt;

const allEntries = (manifest.projects as ManifestProject[]).map(toProject);

/** Public portfolio, newest first, case study excluded. */
export const projects: Project[] = allEntries
  .filter((project) => project.categorySlug !== CASE_STUDY_CATEGORY)
  .sort((a, b) => {
    const byYear = (b.year ?? 0) - (a.year ?? 0);
    if (byYear !== 0) return byYear;
    return a.title.localeCompare(b.title, "id");
  });

export const projectCount = projects.length;

/** Total number of individual photographs published across the portfolio. */
export const photoCount = projects.reduce(
  (total, project) => total + project.gallery.length,
  0
);

/** Distinct locations we have actually delivered to, alphabetically. */
export const servedLocations: string[] = Array.from(
  new Set(
    projects
      .map((project) => project.location)
      .filter((location): location is string => Boolean(location))
  )
).sort((a, b) => a.localeCompare(b, "id"));

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsByCategory(categorySlug: string): Project[] {
  return projects.filter((project) => project.categorySlug === categorySlug);
}

/** Categories that actually have published work behind them. */
export const populatedCategories = categories.filter(
  (category) =>
    category.slug !== CASE_STUDY_CATEGORY &&
    projects.some((project) => project.categorySlug === category.slug)
);

/**
 * Homepage selection: the strongest single project from each populated
 * category, so the grid shows range rather than six wardrobes.
 */
export const featuredProjects: Project[] = populatedCategories
  .map((category) => {
    const inCategory = getProjectsByCategory(category.slug);
    return (
      inCategory.find((project) => project.gallery.length >= 3) ?? inCategory[0]
    );
  })
  .filter((project): project is Project => Boolean(project));

/** The photograph that leads the homepage. */
export const heroProject: Project =
  featuredProjects.find((project) => project.categorySlug === "kitchen-set") ??
  featuredProjects[0] ??
  projects[0];

/**
 * The two frames beside the materials copy.
 *
 * Chosen for what they show rather than picked off the story spread: one flat
 * run of woodgrain HPL where the panel joints and edging are legible, and one
 * duco-finished front with its profile and hardware. Between them they carry
 * the two finishes that section actually claims.
 *
 * The archive holds no material or hardware photography - no plywood edge, no
 * hinge, no swatch - so these are the nearest true thing the studio has shot.
 * A stock swatch would illustrate the copy better and prove nothing.
 */
const MATERIAL_FRAMES = [
  "/images/portfolio/lemari-bawah-tangga/ibu-asih-bojongsoang-01.webp",
  "/images/portfolio/lemari-bawah-tangga/herna-batujajar-01.webp",
] as const;

export const materialImages: ProjectImage[] = MATERIAL_FRAMES.map((src) =>
  projects.flatMap((project) => project.gallery).find((image) => image.src === src)
).filter((image): image is ProjectImage => Boolean(image));

/**
 * The frames the homepage hero cross-dissolves between.
 *
 * All drawn from `heroProject`, so the caption printed over the photograph
 * stays true for every frame. Capped at three; a project with fewer photos
 * simply yields fewer frames rather than borrowing another job's work.
 */
export const heroSlides: ProjectImage[] = heroProject.gallery.slice(0, 3);

/* ------------------------------------------------------------------ */
/* Case study                                                          */
/* ------------------------------------------------------------------ */

const caseStudySource = (manifest.projects as ManifestProject[]).find(
  (project) => project.categorySlug === CASE_STUDY_CATEGORY
);

/**
 * Match the file name only. The archive folder is itself called
 * "BEFORE-AFTER", so testing the whole source path matched both needles on the
 * first image and the section showed the same frame on either side.
 */
function findBySourceName(needle: string): ManifestImage | undefined {
  return caseStudySource?.images.find((image) => {
    const fileName = image.source.split(/[\/]/).pop() ?? "";
    return fileName.toUpperCase().startsWith(needle);
  });
}

const beforeImage = findBySourceName("BEFORE");
const afterImage = findBySourceName("AFTER");

/**
 * Before/after pair for the case study section.
 *
 * The prototype asked for a Before -> 3D render -> After trio, but the archive
 * contains no render, so the section shows the two frames that genuinely exist
 * rather than filling the gap with a stand-in.
 */
export const caseStudy =
  beforeImage && afterImage
    ? {
        before: {
          src: beforeImage.src,
          width: beforeImage.width,
          height: beforeImage.height,
          orientation: asOrientation(beforeImage.orientation),
          alt: "Kondisi ruangan sebelum pengerjaan custom furniture Niscala",
        } satisfies ProjectImage,
        after: {
          src: afterImage.src,
          width: afterImage.width,
          height: afterImage.height,
          orientation: asOrientation(afterImage.orientation),
          alt: "Ruangan yang sama setelah pemasangan custom furniture Niscala",
        } satisfies ProjectImage,
      }
    : null;

export { categoryBySlug };

/**
 * The six staged frames that illustrate the order process, in step order.
 *
 * These are shot for the process section rather than pulled from the portfolio,
 * so frame N always shows what step N actually describes - the sticky panel
 * used to cycle unrelated project photos, which said nothing about the stage
 * the reader was on.
 */
export const processImages: ProjectImage[] = manifest.process
  .slice()
  .sort((a, b) => a.step.localeCompare(b.step))
  .map((frame) => ({
    src: frame.src,
    width: frame.width,
    height: frame.height,
    orientation: asOrientation(frame.orientation),
    alt: frame.alt,
  }));

/**
 * A spread of photographs used as the sticky media panel elsewhere on the site
 * (the about page and the behind-the-scenes strip). Drawn from as many
 * different projects as possible so the panel shows the breadth of the
 * workshop rather than one job from eight angles.
 */
export const storyImages: ProjectImage[] = (() => {
  const picked: ProjectImage[] = [];
  const usedSrc = new Set<string>();
  const usedCategory = new Set<string>();

  const take = (image: ProjectImage | undefined) => {
    if (!image || usedSrc.has(image.src) || picked.length >= 8) return;
    picked.push(image);
    usedSrc.add(image.src);
  };

  // First pass: one cover per category, so no two panels look alike.
  for (const project of projects) {
    if (usedCategory.has(project.categorySlug)) continue;
    usedCategory.add(project.categorySlug);
    take(project.gallery[0]);
  }

  // Second pass: top up to eight from whatever else is available.
  for (const project of projects) {
    if (picked.length >= 8) break;
    take(project.gallery[1] ?? project.gallery[0]);
  }

  return picked;
})();
