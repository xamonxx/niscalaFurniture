import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { Reveal } from "@/components/motion/reveal";
import { CtaBannerDecor } from "@/components/sections/cta-banner-decor";
import { cn } from "@/lib/cn";

/**
 * Section 14 - Primary call to action, on the signature yellow banner.
 *
 * Type on the brand yellow is always charcoal: white would fail contrast and
 * breaks the design system's one hard colour rule.
 */
export function CtaBanner({
  reserveCurveSpace = true,
}: {
  reserveCurveSpace?: boolean;
}) {
  return (
    <section
      className={cn(
        // overflow-x-clip, not overflow-visible: the curve below is 130vw wide
        // so its arc reads shallow, and left unclipped it pushed the whole
        // document 224px wider than the viewport and put a horizontal
        // scrollbar on every page carrying this banner. `clip` on one axis
        // keeps `visible` on the other, so the curve still spills downwards.
        "relative isolate overflow-x-clip overflow-y-visible bg-primary-container pb-[calc(var(--spacing-space-4xl)+var(--spacing-space-2xl))] pt-space-4xl text-deep-black",
        reserveCurveSpace && "mb-20 sm:mb-24 lg:mb-28",
      )}
    >
      <CtaBannerDecor />
      <div className="container-editorial relative z-10 space-y-space-md text-center">
        <Reveal>
          <span className="block text-label-eyebrow font-bold uppercase text-deep-black/80">
            Mulai sekarang
          </span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mx-auto max-w-3xl text-display-mobile text-deep-black lg:text-display">
            Punya ruang yang ingin Anda wujudkan?
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto max-w-2xl text-body-lg leading-relaxed text-deep-black/80">
            Ceritakan kebutuhan Anda. Mulai dari ruang, fungsi, dan apa yang ingin
            dicapai. Tim kami siap membantu dari sketsa awal hingga ruangan siap
            ditempati.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
            <WhatsAppCta source="final_cta" variant="dark">
              Konsultasi via WhatsApp
            </WhatsAppCta>
            <Button
              href="/survey"
              className="bg-pure-white text-deep-black hover:bg-surface-container-low"
            >
              Ajukan Jadwal Survey
            </Button>
          </div>
        </Reveal>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-0 h-20 w-[130vw] -translate-x-1/2 rounded-b-[50%] bg-primary-container sm:h-24 lg:h-28"
      />
    </section>
  );
}
