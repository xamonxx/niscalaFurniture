import Image from "next/image";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { SocialLinks } from "@/components/layout/social-links";
import { storyImages } from "@/data/projects";

/**
 * Section 16 - Behind the scenes.
 *
 * The prototype filled this row with stock "workshop" imagery. Until the studio
 * supplies process photography, it shows four real finished installations
 * instead of pretending to show the workshop.
 */
export function BehindTheScenes() {
  const shots = storyImages.slice(0, 4);
  if (shots.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-xl space-y-space-xs">
            <Eyebrow>Dokumentasi pengerjaan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Ikuti perjalanan transformasi setiap ruang.
            </h2>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-gutter-desktop md:grid-cols-4"
        >
          {shots.map((shot) => (
            <RevealItem as="li" key={shot.src}>
              <div className="relative aspect-square overflow-hidden rounded-md bg-surface-container-high shadow-hairline">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="object-cover"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={2}>
          <SocialLinks className="mt-space-2xl" variant="showcase" />
        </Reveal>
      </div>
    </section>
  );
}
