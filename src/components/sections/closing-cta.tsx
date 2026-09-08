import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

/** Section 17 - Final closing statement. */
export function ClosingCta() {
  return (
    <section className="bg-surface py-space-5xl">
      <div className="container-editorial space-y-space-md text-center">
        <Reveal>
          <span className="inline-flex items-center text-label-eyebrow uppercase text-muted-gray">
            Interior & Furniture Custom Niscala
          </span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mx-auto max-w-4xl text-display-mobile text-on-surface lg:text-display">
            Ruang yang lebih baik dimulai dari perencanaan yang lebih baik.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto max-w-xl text-body-lg leading-relaxed text-on-surface-variant">
            Jadikan rumah Anda tempat yang tidak hanya nyaman dipandang, tetapi juga
            bekerja sempurna untuk keluarga setiap hari.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
            <WhatsAppCta source="final_cta">
              Mulai Konsultasi Ruang Sekarang
            </WhatsAppCta>
            <Button href="/portfolio" variant="surface">
              Lihat Karya Sebelumnya
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
