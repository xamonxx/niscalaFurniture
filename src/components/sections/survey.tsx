import { SurveyForm } from "@/components/forms/survey-form";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { SURVEY_ANCHOR_ID } from "@/components/layout/sticky-mobile-cta";

/** Section 15 - Multi-step survey form. */
export function Survey() {
  return (
    <section
      id={SURVEY_ANCHOR_ID}
      className="bg-surface pb-space-4xl pt-[calc(var(--spacing-space-4xl)+var(--spacing-space-lg))] lg:pt-[calc(var(--spacing-space-4xl)+var(--spacing-space-2xl))]"
    >
      <div className="container-editorial">
        <Reveal className="mx-auto max-w-3xl">
          {/*
            24px of padding on a phone, not 32.

            On a 320px screen the container already spends 40px on its own
            margins; another 64px here left the form 216px to work in, which is
            what put the submit button's label on three lines. The card still
            reads as a card at 24px and the fields get the difference.
          */}
          <div className="space-y-space-xl rounded-xl bg-surface-container-lowest p-space-lg shadow-panel sm:p-space-xl md:p-space-2xl">
            <div className="space-y-space-xs text-center">
              <Eyebrow>Formulir estimasi cepat</Eyebrow>
              <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                Rencanakan Ruangan Impian Anda
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Lengkapi empat langkah sederhana berikut untuk mendapatkan estimasi
                dan rekomendasi desain.
              </p>
            </div>
            <SurveyForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
