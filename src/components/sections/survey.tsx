import { Clock, MessageCircle, ShieldCheck } from "lucide-react";

import { SurveyForm } from "@/components/forms/survey-form";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { SURVEY_ANCHOR_ID } from "@/components/layout/sticky-mobile-cta";
import { projectCount, servedLocations } from "@/data/projects";

/**
 * Why visitors hesitate before a 4-step form, addressed in order: cost,
 * effort, and "then what happens." Each claim already exists elsewhere on the
 * site (RAB tanpa biaya tersembunyi, konsultasi gratis, WhatsApp hand-off) -
 * restated here at the one moment a visitor is deciding whether to start.
 */
const REASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Konsultasi & estimasi awal gratis",
    desc: "Tanpa biaya tersembunyi, dan tidak ada kewajiban lanjut ke produksi.",
  },
  {
    icon: Clock,
    title: "4 langkah singkat, sekitar 2 menit",
    desc: "Tombol Kembali selalu tersedia - jawaban Anda tidak hilang saat pindah langkah.",
  },
  {
    icon: MessageCircle,
    title: "Dibalas langsung via WhatsApp",
    desc: "Rekomendasi desain dan estimasi biaya, sebelum kami jadwalkan survey ke lokasi.",
  },
] as const;

/** Section 15 - Multi-step survey form. */
export function Survey() {
  return (
    <section
      id={SURVEY_ANCHOR_ID}
      className="bg-surface py-space-3xl lg:py-space-4xl"
    >
      <div className="container-editorial">
        <div className="grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          {/* The pitch: why finish this, not just what it is. */}
          <Reveal className="lg:col-span-5">
            <div className="space-y-space-lg">
              <div className="space-y-space-xs">
                <Eyebrow>Formulir estimasi cepat &middot; gratis</Eyebrow>
                <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-lg">
                  Rencanakan ruangan impian Anda, mulai dari estimasi gratis
                  ini.
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  Ceritakan kebutuhan ruang Anda lewat 4 langkah singkat. Tim
                  kami balas via WhatsApp dengan rekomendasi desain dan
                  estimasi biaya, sebelum survey ke lokasi Anda.
                </p>
              </div>

              <ul className="space-y-space-md">
                {REASSURANCES.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-space-sm">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container/15 text-primary">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <div>
                      <p className="text-label-lg font-semibold text-on-surface">
                        {title}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-space-md rounded-lg border border-border-hairline bg-surface-container-low px-space-md py-space-sm">
                <span className="text-headline-sm font-bold text-primary">
                  {projectCount}+
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  proyek terdokumentasi di {servedLocations.length} kota &amp;
                  area
                </span>
              </div>
            </div>
          </Reveal>

          {/* The form itself - untouched. */}
          <Reveal className="lg:col-span-7">
            {/*
              24px of padding on a phone, not 32.

              On a 320px screen the container already spends 40px on its own
              margins; another 64px here left the form 216px to work in, which is
              what put the submit button's label on three lines. The card still
              reads as a card at 24px and the fields get the difference.
            */}
            <div className="space-y-space-xl rounded-xl bg-surface-container-lowest p-space-lg shadow-panel sm:p-space-xl md:p-space-2xl">
              <SurveyForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
