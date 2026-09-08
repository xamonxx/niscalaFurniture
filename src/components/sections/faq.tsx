import { Reveal } from "@/components/motion/reveal";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { Eyebrow, TextLink } from "@/components/ui/typography";
import { faqs } from "@/data/content";

/**
 * Section 13 - FAQ.
 *
 * No `FAQPage` structured data. Since 2023 Google shows FAQ rich results only
 * for authoritative government and health sources, so on a commercial interior
 * site the markup earns nothing and still counts against the page if the
 * answers and the accordion ever drift apart. The questions stay in the HTML,
 * which is what both search engines and AI answer engines actually read.
 */
export function Faq() {
  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <div className="grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          <Reveal className="space-y-space-xs lg:col-span-4">
            <Eyebrow>Pertanyaan umum</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Hal yang sering ditanyakan.
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Masih memiliki pertanyaan lain yang belum terjawab di sini? Tim kami
              siap menjawab langsung.
            </p>
            <div className="pt-space-md">
              <TextLink href="/contact">Tanya Langsung ke Tim Teknis</TextLink>
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
