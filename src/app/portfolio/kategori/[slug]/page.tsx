import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CategoryFilter } from "@/components/portfolio/category-filter";
import { ProjectGrid } from "@/components/portfolio/project-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { categoryBySlug } from "@/data/categories";
import { services } from "@/data/content";
import { getProjectsByCategory, populatedCategories } from "@/data/projects";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import type { Project, ProjectCategory } from "@/types";

/**
 * Category listing.
 *
 * Namespaced under `/portfolio/kategori/` rather than sitting directly at
 * `/portfolio/<slug>`: project slugs are derived from the archive and some of
 * them ("bedroom") collide with category slugs, so the two must not share a
 * path segment.
 */
/**
 * Every valid slug comes from generateStaticParams, so anything else is a real
 * 404. Without this, the root loading.tsx boundary starts streaming a 200
 * response before the page can call notFound(), turning every unknown URL into
 * a soft 404 that search engines treat as a duplicate page.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return populatedCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/portfolio/kategori/[slug]">
) {
  const { slug } = await props.params;
  const category = categoryBySlug(slug);

  if (!category) {
    return buildMetadata({
      title: "Kategori tidak ditemukan",
      description: "Kategori portfolio yang Anda cari tidak tersedia.",
      path: `/portfolio/kategori/${slug}`,
    });
  }

  const inCategory = getProjectsByCategory(category.slug);

  return buildMetadata({
    title: category.seoTitle,
    description: categoryDescription(category, inCategory.length),
    path: `/portfolio/kategori/${category.slug}`,
    image: inCategory[0]?.coverImage,
  });
}

/**
 * Snippet copy for the category.
 *
 * The old suffix ("Lihat N proyek yang sudah dikerjakan Niscala Furniture")
 * pushed several categories to 159 characters, right past where Google cuts.
 * This one keeps the proof point and buys back sixteen characters.
 */
function categoryDescription(category: ProjectCategory, count: number): string {
  return `${category.description} ${count} proyek nyata dari arsip Niscala Furniture.`;
}

function categoryJsonLd(category: ProjectCategory, inCategory: Project[]) {
  const path = `/portfolio/kategori/${category.slug}`;
  const url = absoluteUrl(path);

  // Towns come straight from the delivery records, so the service area is
  // evidence rather than a keyword list.
  const areaServed = [
    { "@type": "Country", name: "Indonesia" },
    ...Array.from(
      new Set(
        inCategory
          .map((project) => project.location)
          .filter((location): location is string => Boolean(location))
      )
    ).map((name) => ({ "@type": "Place", name })),
  ];

  return jsonLdGraph(
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: category.seoTitle,
      description: category.description,
      serviceType: category.name,
      provider: { "@id": ORGANISATION_ID },
      areaServed,
      url,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `Portfolio ${category.name}`,
        itemListElement: inCategory.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/portfolio/${project.slug}`),
          name: project.title,
        })),
      },
    },
    {
      ...webPageJsonLd({
        path,
        name: `Portfolio ${category.name}`,
        description: categoryDescription(category, inCategory.length),
        type: "CollectionPage",
        breadcrumb: true,
        primaryImage: inCategory[0]?.coverImage,
      }),
      hasPart: inCategory.map((project) => ({
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(`/portfolio/${project.slug}`)}#project`,
        name: project.title,
        url: absoluteUrl(`/portfolio/${project.slug}`),
        image: absoluteUrl(project.coverImage),
        ...(project.location
          ? { locationCreated: { "@type": "Place", name: project.location } }
          : {}),
        ...(project.year ? { dateCreated: String(project.year) } : {}),
      })),
    },
    breadcrumbJsonLd([
      { name: "Portofolio", path: "/portfolio" },
      { name: category.short, path },
    ])
  );
}

export default async function CategoryPage(
  props: PageProps<"/portfolio/kategori/[slug]">
) {
  const { slug } = await props.params;
  const category = categoryBySlug(slug);

  if (!category) notFound();

  const inCategory = getProjectsByCategory(category.slug);
  if (inCategory.length === 0) notFound();

  // Locations are real delivery records, so they double as local-search proof.
  const locations = Array.from(
    new Set(
      inCategory
        .map((project) => project.location)
        .filter((location): location is string => Boolean(location))
    )
  );

  const relatedService = services.find(
    (service) => service.categorySlug === category.slug
  );

  const others = populatedCategories.filter((item) => item.slug !== category.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(categoryJsonLd(category, inCategory))}
      />

      <PageHeader
        eyebrow={`Portfolio / ${category.short}`}
        title={category.heading}
        lead={category.description}
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial space-y-space-xl">
          <CategoryFilter activeSlug={category.slug} />

          <p className="text-body-sm text-on-surface-variant">
            {inCategory.length} proyek {category.name.toLowerCase()}
            {locations.length > 0
              ? ` — pernah dikerjakan di ${locations.slice(0, 6).join(", ")}${
                  locations.length > 6 ? ", dan kota lainnya" : ""
                }`
              : ""}
            .
          </p>

          <ProjectGrid projects={inCategory} />

          {relatedService ? (
            <div className="flex flex-col items-start justify-between gap-space-md rounded-md bg-surface-container-lowest p-space-xl shadow-hairline sm:flex-row sm:items-center">
              <div className="max-w-2xl space-y-space-2xs">
                <p className="text-headline-sm font-semibold text-on-surface">
                  {relatedService.title}
                </p>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  {relatedService.description}
                </p>
                <Link
                  href={`/services#${relatedService.slug}`}
                  className="group inline-flex items-center gap-space-2xs pt-space-2xs text-label-md font-semibold text-on-surface transition-colors hover:text-primary"
                >
                  Baca detail layanan
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              <WhatsAppCta
                source="portfolio"
                className="shrink-0"
                context={`Saya tertarik dengan ${category.name}.`}
              >
                Konsultasi {category.short}
              </WhatsAppCta>
            </div>
          ) : null}
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-surface py-space-4xl">
          <div className="container-editorial">
            <h2 className="mb-space-lg text-headline-md-mobile text-on-surface lg:text-headline-md">
              Kategori lainnya
            </h2>
            <ul className="flex flex-wrap gap-space-sm">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/portfolio/kategori/${item.slug}`}
                    className="inline-flex items-center gap-space-xs rounded-md bg-surface-container-low px-space-lg py-space-sm text-label-lg font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    {item.name}
                    <span className="text-label-eyebrow text-muted-gray">
                      {getProjectsByCategory(item.slug).length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBanner />
    </>
  );
}
