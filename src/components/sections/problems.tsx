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
          className="mt-space-2xl grid gap-gutter-desktop md:grid-cols-2 lg:grid-cols-4"
        >
          {problems.map((problem) => (
            <RevealItem
              as="li"
              key={problem.index}
              className="flex flex-col justify-between gap-space-md rounded-md bg-surface-container-lowest p-space-lg shadow-hairline"
            >
              <div className="space-y-space-xs">
                <span className="block text-label-eyebrow uppercase text-muted-gray">
                  {problem.index}
                </span>
                <h3 className="text-headline-sm font-semibold text-on-surface">
                  {problem.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  {problem.body}
                </p>
              </div>
              <span aria-hidden className="h-1 w-8 rounded-full bg-primary-container" />
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
