import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { services } from "@/data/content";

/**
 * Section 06 - Services.
 *
 * Seven cards, not the prototype's six: "Lemari Bawah Tangga" is the studio's
 * single largest body of work and had no slot in the original layout.
 */
export function ServicesGrid() {
  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl space-y-space-xs">
            <Eyebrow>Lingkup layanan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Satu ruang atau satu rumah.
              <br />
              Dirancang sesuai kebutuhan Anda.
            </h2>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <RevealItem
                as="li"
                key={service.slug}
                className="flex flex-col gap-space-xs sm:gap-space-md rounded-md bg-surface-container-lowest p-space-sm sm:p-space-xl shadow-hairline transition-shadow hover:shadow-panel"
              >
                <span className="flex size-8 sm:size-12 items-center justify-center rounded-md bg-surface-container text-primary">
                  <Icon aria-hidden className="size-4 sm:size-6" />
                </span>
                <h3 className="text-xs sm:text-headline-sm font-semibold text-on-surface leading-snug">
                  {service.title}
                </h3>
                <p className="flex-1 text-[11px] sm:text-body-sm leading-relaxed text-on-surface-variant">
                  {service.description}
                </p>
                <Link
                  href={`/services#${service.slug}`}
                  className="group inline-flex items-center gap-1 sm:gap-space-2xs text-[11px] sm:text-label-md font-semibold text-on-surface transition-colors hover:text-primary pt-1 sm:pt-0"
                >
                  {service.ctaLabel}
                  <ArrowRight
                    aria-hidden
                    className="size-3 sm:size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
