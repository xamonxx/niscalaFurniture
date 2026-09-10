import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";
import { SectionHeading, TextLink } from "@/components/ui/typography";
import { problems } from "@/data/content";
import { site } from "@/lib/site";

/** Section 02 - Problem awareness. */
export function Problems() {
  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Sebelum memilih furniture"
            title="Furniture yang bagus belum tentu tepat untuk ruangan Anda."
            lead="Setiap rumah memiliki ukuran, aktivitas, kebutuhan penyimpanan, dan karakter yang berbeda. Karena itu, custom furniture seharusnya tidak dimulai dari sekadar memilih model di katalog. Ia dimulai dari memahami ruang."
            className="max-w-3xl"
          />
        </Reveal>

        <RevealGroup
          as="ul"
          className="mt-space-xl sm:mt-space-2xl grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:grid-cols-4"
        >
          {problems.map((problem) => (
            <RevealItem
              as="li"
              key={problem.index}
              className="group flex flex-col justify-between overflow-hidden rounded-md bg-surface-container-lowest shadow-hairline transition-shadow hover:shadow-panel"
            >
              <div>
                {problem.image ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                    <Image
                      src={problem.image}
                      alt={problem.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 45vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="space-y-space-2xs p-space-sm sm:space-y-space-xs sm:p-space-md lg:p-space-lg">
                  <span className="block text-[10px] sm:text-label-eyebrow uppercase tracking-wider text-muted-gray">
                    {problem.index}
                  </span>
                  <h3 className="text-sm sm:text-base lg:text-headline-sm font-semibold leading-snug text-on-surface">
                    {problem.title}
                  </h3>
                  <p className="text-xs sm:text-body-sm leading-relaxed text-on-surface-variant">
                    {problem.body}
                  </p>
                </div>
              </div>
              <div className="px-space-sm pb-space-sm sm:px-space-md sm:pb-space-md lg:px-space-lg lg:pb-space-lg">
                <span aria-hidden className="block h-0.5 sm:h-1 w-6 sm:w-8 rounded-full bg-primary-container" />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-space-2xl">
          <div className="flex flex-col items-start justify-between gap-space-md rounded-md bg-surface-container p-space-lg md:flex-row md:items-center">
            <p className="flex items-start gap-space-sm text-body-md font-medium text-on-surface">
              <BadgeCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" />
              Di {site.shortName}, setiap proyek dimulai dari kebutuhan ruang dan
              orang yang menggunakannya — bukan dari katalog massal.
            </p>
            <TextLink href="/survey" className="shrink-0 uppercase">
              Jadwalkan Diskusi
            </TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
