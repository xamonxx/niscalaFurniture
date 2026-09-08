import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ProjectGallery } from "@/components/portfolio/project-gallery";
import { ProjectCard } from "@/components/ui/project-card";
import { Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  getProjectBySlug,
  getProjectsByCategory,
  projects,
} from "@/data/projects";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import type { Project } from "@/types";

/**
 * Every valid slug comes from generateStaticParams, so anything else is a real
 * 404. Without this, the root loading.tsx boundary starts streaming a 200
 * response before the page can call notFound(), turning every unknown URL into
 * a soft 404 that search engines treat as a duplicate page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/portfolio/[slug]">) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return buildMetadata({
      title: "Proyek tidak ditemukan",
      description: "Halaman proyek yang Anda cari tidak tersedia.",
      path: `/portfolio/${slug}`,
    });
  }

  return buildMetadata({
    title: project.title,
    description: project.seoDescription,
    path: `/portfolio/${project.slug}`,
    image: project.coverImage,
  });
}

/**
 * Structured data for one delivered project.
 *
 * `CreativeWork` rather than `Product`: nothing here is on sale at a listed
 * price, and dressing a portfolio entry up as a purchasable product would
 * invite an offer-less Product warning for no gain. Every field traces back to
 * the studio archive - client, town, finishing style and year - so the graph
 * says exactly what the page says.
 */
function projectGraph(project: Project) {
  const path = `/portfolio/${project.slug}`;
  const url = absoluteUrl(path);
  const categoryPath = `/portfolio/kategori/${project.categorySlug}`;

  return jsonLdGraph(
    {
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      name: project.title,
      description: project.description,
      url,
      inLanguage: "id-ID",
      genre: project.categoryName,
      creator: { "@id": ORGANISATION_ID },
      provider: { "@id": ORGANISATION_ID },
      ...(project.year ? { dateCreated: String(project.year) } : {}),
      ...(project.location
        ? { locationCreated: { "@type": "Place", name: project.location } }
        : {}),
      ...(project.style ? { artform: project.style } : {}),
      image: project.gallery.map((photo) => ({
        "@type": "ImageObject",
        url: absoluteUrl(photo.src),
        width: photo.width,
        height: photo.height,
        caption: photo.alt,
        representativeOfPage: photo.src === project.coverImage,
      })),
      isPartOf: {
        "@type": "CollectionPage",
        name: `Portfolio ${project.categoryName}`,
        url: absoluteUrl(categoryPath),
      },
    },
    webPageJsonLd({
      path,
      name: project.title,
      description: project.seoDescription,
      type: "ItemPage",
      breadcrumb: true,
      primaryImage: project.coverImage,
    }),
    breadcrumbJsonLd([
      { name: "Portofolio", path: "/portfolio" },
      { name: project.categoryShort, path: categoryPath },
      { name: project.title, path },
    ])
  );
}

export default async function ProjectPage(props: PageProps<"/portfolio/[slug]">) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const related = getProjectsByCategory(project.categorySlug)
    .filter((candidate) => candidate.slug !== project.slug)
    .slice(0, 3);

  const facts = [
    project.client ? { label: "Klien", value: project.client } : null,
    project.location ? { label: "Lokasi", value: project.location } : null,
    project.style ? { label: "Finishing", value: project.style } : null,
    project.year ? { label: "Tahun", value: String(project.year) } : null,
    { label: "Kategori", value: project.categoryName },
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(projectGraph(project))}
      />

      <section className="border-b border-border-hairline bg-surface py-space-3xl">
        <div className="container-editorial">
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-space-2xs text-label-md font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform group-hover:-translate-x-0.5"
            />
            Semua proyek
          </Link>

          <div className="mt-space-lg grid gap-space-xl lg:grid-cols-12 lg:gap-gutter-desktop">
            <div className="space-y-space-sm lg:col-span-7">
              <Eyebrow>{project.categoryShort}</Eyebrow>
              <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
                {project.title}
              </h1>
              <p className="max-w-xl text-body-lg leading-relaxed text-on-surface-variant">
                {project.description}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-space-md self-end lg:col-span-5">
              {facts.map((fact) => (
                <div key={fact.label} className="space-y-space-2xs">
                  <dt className="text-label-eyebrow uppercase text-muted-gray">
                    {fact.label}
                  </dt>
                  <dd className="text-body-md font-medium text-on-surface">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <ProjectGallery images={project.gallery} />

          <Reveal className="mt-space-2xl">
            <div className="flex flex-col items-start justify-between gap-space-md rounded-md bg-surface-container-lowest p-space-xl shadow-hairline sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className="text-headline-sm font-semibold text-on-surface">
                  Punya kebutuhan serupa?
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Kirimkan ukuran dan kondisi ruangan Anda, kami bantu hitung
                  estimasinya.
                </p>
              </div>
              <WhatsAppCta
                source="project_detail"
                className="shrink-0"
                context={`Saya tertarik dengan project: ${project.title}.`}
              >
                Diskusikan Proyek Serupa
              </WhatsAppCta>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="bg-surface py-space-4xl">
          <div className="container-editorial">
            <div className="mb-space-xl flex flex-wrap items-end justify-between gap-space-md">
              <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                Proyek lain di kategori {project.categoryShort}
              </h2>
              <Link
                href={`/portfolio/kategori/${project.categorySlug}`}
                className="group inline-flex items-center gap-space-2xs text-label-md font-semibold text-on-surface transition-colors hover:text-primary"
              >
                Lihat semua {project.categoryShort}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
            <ul className="grid gap-gutter-desktop sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <ProjectCard
                    project={item}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
