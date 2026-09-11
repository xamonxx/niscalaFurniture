import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { arrowRowClasses, Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { cn } from "@/lib/cn";
import { services } from "@/data/content";
import { getProjectsByCategory } from "@/data/projects";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

// 167 characters was past the snippet cut; this keeps the whole service list
// and lands inside it.
const SERVICES_DESCRIPTION =
  "Kitchen set, lemari pakaian, lemari bawah tangga, backdrop TV, kamar tidur, hingga interior komersial — dirancang, diproduksi, dan dipasang satu tim.";

export const metadata = buildMetadata({
  title: "Layanan Furniture Custom",
  description: SERVICES_DESCRIPTION,
  path: "/services",
});

function servicesJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/services",
      name: "Layanan Furniture Custom",
      description: SERVICES_DESCRIPTION,
      breadcrumb: true,
    }),
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl("/services")}#list`,
      name: "Lingkup layanan Niscala Furniture",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.title,
          description: service.description,
          serviceType: service.title,
          provider: { "@id": ORGANISATION_ID },
          areaServed: { "@type": "Country", name: "Indonesia" },
          url: `${absoluteUrl("/services")}#${service.slug}`,
        },
      })),
    },
    breadcrumbJsonLd([{ name: "Layanan", path: "/services" }])
  );
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(servicesJsonLd())}
      />

      <PageHeader
        eyebrow="Lingkup layanan"
        title="Satu ruang atau satu rumah, dirancang sesuai kebutuhan Anda."
        lead="Setiap layanan di bawah ini dikerjakan dengan alur yang sama: survey aktual, desain terukur, produksi di workshop sendiri, lalu pemasangan oleh tim kami."
      />

      <div className="bg-surface">
        {services.map((service, index) => {
          const projectsForService = service.categorySlug
            ? getProjectsByCategory(service.categorySlug)
            : [];
          const showcase = projectsForService[0];
          const Icon = service.icon;
          const reversed = index % 2 === 1;

          return (
            <section
              key={service.slug}
              id={service.slug}
              className={
                reversed
                  ? "scroll-mt-28 bg-surface-container-low py-space-4xl"
                  : "scroll-mt-28 bg-surface py-space-4xl"
              }
            >
              <div className="container-editorial">
                <div className="grid items-center gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
                  <Reveal
                    className={
                      reversed
                        ? "space-y-space-md lg:order-2 lg:col-span-6"
                        : "space-y-space-md lg:col-span-6"
                    }
                  >
                    <span className="flex size-12 items-center justify-center rounded-md bg-surface-container text-primary">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <Eyebrow>{`0${index + 1} / Layanan`}</Eyebrow>
                    <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                      {service.title}
                    </h2>
                    <p className="text-body-lg leading-relaxed text-on-surface-variant">
                      {service.description}
                    </p>
                    <p className="text-body-md leading-relaxed text-on-surface-variant">
                      {service.detail}
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md pt-space-2xs">
                      <WhatsAppCta
                        source="services"
                        context={`Layanan yang saya butuhkan: ${service.title}.`}
                      >
                        {service.ctaLabel}
                      </WhatsAppCta>
                      {service.categorySlug && projectsForService.length > 0 ? (
                        <Link
                          href={`/portfolio/kategori/${service.categorySlug}`}
                          className={cn(arrowRowClasses, "text-on-surface hover:text-primary")}
                        >
                          Lihat {projectsForService.length} proyek
                          <ArrowRight
                            aria-hidden
                            className="size-4 transition-transform group-hover:translate-x-0.5"
                          />
                        </Link>
                      ) : null}
                    </div>
                  </Reveal>

                  {showcase ? (
                    <Reveal
                      className={
                        reversed
                          ? "lg:order-1 lg:col-span-6"
                          : "lg:col-span-6"
                      }
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-container-high shadow-hairline">
                        <Image
                          src={showcase.coverImage}
                          alt={showcase.gallery[0]?.alt ?? showcase.title}
                          fill
                          sizes="(min-width: 1024px) 46vw, 92vw"
                          className="object-cover"
                        />
                      </div>
                    </Reveal>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CtaBanner />
    </>
  );
}
