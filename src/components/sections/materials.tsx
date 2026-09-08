import Image from "next/image";
import { CircleCheck } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/typography";
import { materials } from "@/data/content";
import { materialImages } from "@/data/projects";

/** Section 10 - Material & quality. */
export function Materials() {
  // Woodgrain HPL beside duco: one frame per finish the list below claims.
  const [first, second] = materialImages;

  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <div className="grid items-center gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          <div className="space-y-space-sm lg:col-span-5">
            <Reveal>
              <SectionHeading
                eyebrow="Kualitas tanpa kompromi"
                title="Material pilihan untuk durabilitas harian bertahun-tahun."
                lead="Kekuatan custom furniture terletak pada bahan yang tidak tampak dari luar: struktur multipleks yang padat, lapisan penahan air, serta engsel yang teruji ribuan siklus buka-tutup."
              />
            </Reveal>

            <Reveal delay={2}>
              <ul className="space-y-space-md pt-space-md">
                {materials.map((material) => (
                  <li key={material.title} className="flex items-start gap-space-sm">
                    <CircleCheck
                      aria-hidden
                      className="mt-0.5 size-5 shrink-0 text-primary"
                    />
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">
                        {material.title}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {material.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal variant="image">
              <div className="grid grid-cols-2 gap-space-md">
                {first ? (
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface-container-high shadow-hairline">
                    <Image
                      src={first.src}
                      alt={first.alt}
                      fill
                      sizes="(min-width: 1024px) 27vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {second ? (
                  <div className="relative mt-space-lg aspect-[3/4] overflow-hidden rounded-md bg-surface-container-high shadow-hairline">
                    <Image
                      src={second.src}
                      alt={second.alt}
                      fill
                      sizes="(min-width: 1024px) 27vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
