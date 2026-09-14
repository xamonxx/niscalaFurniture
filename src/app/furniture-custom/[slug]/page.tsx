import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { FurnitureCategoryGallery } from "@/components/custom-furniture/furniture-category-gallery";
import {
  customFurnitureCategories,
  getCustomFurnitureCategoryBySlug,
  getAllCustomFurnitureCategorySlugs,
} from "@/data/custom-furniture";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllCustomFurnitureCategorySlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCustomFurnitureCategoryBySlug(slug);

  if (!category) {
    return buildMetadata({
      title: "Kategori Custom Tidak Ditemukan",
      description: "Halaman kategori custom furniture yang Anda cari tidak tersedia.",
      path: `/furniture-custom/${slug}`,
    });
  }

  return buildMetadata({
    title: category.seoTitle,
    description: category.seoDescription,
    path: `/furniture-custom/${category.slug}`,
  });
}

function categoryJsonLd(category: ReturnType<typeof getCustomFurnitureCategoryBySlug>) {
  if (!category) return null;

  return jsonLdGraph(
    webPageJsonLd({
      path: `/furniture-custom/${category.slug}`,
      name: category.name,
      description: category.seoDescription,
      breadcrumb: true,
    }),
    {
      "@type": "ProductCollection",
      "@id": `${absoluteUrl(`/furniture-custom/${category.slug}`)}#collection`,
      name: category.name,
      description: category.lead,
      provider: { "@id": ORGANISATION_ID },
      url: absoluteUrl(`/furniture-custom/${category.slug}`),
    },
    breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: "Furniture Custom", path: "/furniture-custom" },
      { name: category.name, path: `/furniture-custom/${category.slug}` },
    ])
  );
}

export default async function CustomFurnitureCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCustomFurnitureCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const otherCategories = customFurnitureCategories.filter(
    (item) => item.slug !== category.slug
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(categoryJsonLd(category))}
      />

      <PageHeader
        eyebrow={`Furniture Custom • Koleksi Desain`}
        title={category.headline}
        lead={category.lead}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-border-hairline bg-surface-container-lowest/50 py-3"
      >
        <div className="container-editorial flex items-center gap-1.5 text-xs text-muted-gray">
          <Link href="/" className="hover:text-on-surface transition-colors">
            Beranda
          </Link>
          <ChevronRight className="size-3.5 text-muted-gray/60" />
          <Link
            href="/furniture-custom"
            className="hover:text-on-surface transition-colors"
          >
            Furniture Custom
          </Link>
          <ChevronRight className="size-3.5 text-muted-gray/60" />
          <span className="font-semibold text-on-surface truncate">
            {category.name}
          </span>
        </div>
      </nav>

      {/* Category Highlights Grid */}
      <section
        aria-labelledby="highlights-heading"
        className="bg-surface py-space-3xl"
      >
        <div className="container-editorial">
          <div className="mb-6">
            <Eyebrow>Standar Produksi & Keunggulan</Eyebrow>
            <h2
              id="highlights-heading"
              className="mt-1.5 text-headline-sm text-on-surface"
            >
              Kenapa Memilih {category.name} di Niscala?
            </h2>
          </div>

          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.highlights.map((hl) => (
              <RevealItem key={hl.title}>
                <div className="h-full rounded-xl border border-border-hairline bg-surface-container-lowest/80 p-5 shadow-hairline hover:border-primary-container/60 hover:shadow-panel transition-[border-color,box-shadow] duration-200">
                  <div className="flex items-center gap-2.5 text-primary">
                    <CheckCircle2 className="size-5 shrink-0 text-primary-container" />
                    <h3 className="font-semibold text-sm text-on-surface">
                      {hl.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    {hl.desc}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Main Gallery Section with Grid & Lightbox */}
      <section
        aria-labelledby="gallery-heading"
        className="bg-surface-container-lowest/30 py-space-4xl"
      >
        <div className="container-editorial">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <Eyebrow>Galeri Inspirasi</Eyebrow>
              <h2
                id="gallery-heading"
                className="mt-1.5 text-headline-sm sm:text-headline-md text-on-surface"
              >
                Koleksi Referensi {category.name}
              </h2>
            </div>
            <WhatsAppCta
              source="portfolio"
              context={`Kategori: ${category.name}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-primary-container text-inverse-on-surface hover:opacity-95 transition-opacity"
            >
              <span>Konsultasi Gratis via WhatsApp</span>
              <ArrowRight className="size-4" />
            </WhatsAppCta>
          </div>

          {/* Interactive Responsive Grid with Lightbox */}
          <FurnitureCategoryGallery
            references={category.references}
            categoryName={category.name}
          />
        </div>
      </section>

      {/* Explore Other Custom Furniture Categories */}
      <section
        aria-labelledby="other-categories-heading"
        className="bg-surface border-t border-border-hairline py-space-4xl"
      >
        <div className="container-editorial">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Layers className="size-4 text-primary" />
              <Eyebrow>Koleksi Lainnya</Eyebrow>
            </div>
            <h2
              id="other-categories-heading"
              className="mt-2 text-headline-sm sm:text-headline-md text-on-surface"
            >
              Jelajahi Kategori Furniture Custom Lainnya
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-on-surface-variant">
              Setiap ruangan memiliki kebutuhan fungsional dan estetika tersendiri.
              Temukan referensi terbaik untuk hunian Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {otherCategories.map((other) => {
              const coverItem = other.references[0];
              return (
                <Link
                  key={other.slug}
                  href={`/furniture-custom/${other.slug}`}
                  className="group relative flex flex-col rounded-xl overflow-hidden border border-border-hairline bg-surface-container-lowest hover:border-primary-container hover:shadow-panel transition-[border-color,box-shadow,transform] duration-200"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
                    {coverItem && (
                      <Image
                        src={coverItem.src}
                        alt={other.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-pure-white">
                      <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded bg-pure-white/20 backdrop-blur-sm">
                        {other.references.length} Desain
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold mt-1 line-clamp-1 group-hover:text-primary-container transition-colors">
                        {other.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-primary">
                    <span>Lihat Referensi</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <CtaBanner />
    </>
  );
}
