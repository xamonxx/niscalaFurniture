import { Star } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { visibleTestimonials } from "@/data/testimonials";

/**
 * Section 12 - Client testimonials.
 *
 * Renders nothing at all when only placeholder copy exists and the site owner
 * has not opted in, so sample quotes can never be mistaken for real ones in
 * production. In development the section can still be reviewed.
 */
export function Testimonials() {
  const items = visibleTestimonials();
  if (items.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl space-y-space-xs">
            <Eyebrow>Kata mereka tentang Niscala</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Dipercaya untuk mengisi ruang paling berharga.
            </h2>
          </div>
        </Reveal>

        <RevealGroup as="ul" className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop md:grid-cols-2">
          {items.map((testimonial) => (
            <RevealItem
              as="li"
              key={testimonial.id}
              className="flex flex-col justify-between gap-space-sm rounded-md bg-surface-container-lowest p-space-sm shadow-hairline sm:gap-space-md sm:p-space-xl"
            >
              <div className="space-y-space-xs sm:space-y-space-sm">
                <span
                  aria-hidden
                  className="flex gap-0.5 text-primary-container"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 sm:size-5 fill-current" />
                  ))}
                </span>
                <blockquote className="text-xs sm:text-body-lg italic leading-relaxed text-on-surface">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <footer className="pt-space-xs sm:pt-space-sm">
                <p className="text-xs sm:text-label-lg font-bold text-on-surface">
                  {testimonial.author}
                </p>
                <p className="text-[10px] sm:text-body-sm text-muted-gray">{testimonial.context}</p>
              </footer>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
