import { Reveal } from "@/components/motion/reveal";
import { ProcessStorytelling } from "@/components/sections/process-storytelling";
import { SectionHeading } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { processSteps } from "@/data/content";
import { processImages } from "@/data/projects";

/** Section 08 - Order process, on the charcoal block. */
export function Process() {
  return (
    <section id="process" className="bg-deep-black py-space-4xl text-pure-white">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow="Alur kerja terstruktur"
            title="Dari percakapan pertama hingga ruang siap digunakan."
            lead="Setiap tahapan dikelola secara transparan dengan dokumentasi spesifikasi teknis yang jelas."
            className="mb-space-3xl max-w-3xl"
          />
        </Reveal>

        <ProcessStorytelling steps={processSteps} images={processImages} />

        <Reveal className="mt-space-3xl">
          <div className="flex flex-col items-center justify-between gap-space-md rounded-md bg-inverse-surface/60 p-space-xl sm:flex-row">
            <div className="space-y-1">
              <p className="text-headline-sm font-semibold text-pure-white">
                Siap mendiskusikan ruangan Anda?
              </p>
              <p className="text-body-sm text-tertiary-fixed-dim">
                Konsultasi awal &amp; estimasi perkiraan tidak dikenakan biaya.
              </p>
            </div>
            <WhatsAppCta source="process" className="shrink-0">
              Mulai dari Konsultasi Gratis
            </WhatsAppCta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
