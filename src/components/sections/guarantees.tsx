import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/typography";
import { guarantees } from "@/data/content";

/** Section 11 - Risk reversal. */
export function Guarantees() {
  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Kepastian & kenyamanan"
            title="Produksi tidak dimulai dari asumsi."
            lead="Enam komitmen kejelasan untuk memastikan Anda tenang sebelum kayu pertama dipotong."
            className="mx-auto mb-space-3xl max-w-2xl text-center [&_p]:mx-auto"
          />
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid gap-gutter-desktop md:grid-cols-2 lg:grid-cols-3"
        >
          {guarantees.map((guarantee) => (
            <RevealItem
              as="li"
              key={guarantee.index}
              className="space-y-space-xs rounded-md bg-surface-container-low p-space-lg"
            >
              <span
                aria-hidden
                className="flex size-8 items-center justify-center rounded-full bg-primary-container text-body-sm font-bold text-deep-black"
              >
                {guarantee.index}
              </span>
              <h3 className="text-headline-sm font-semibold text-on-surface">
                {guarantee.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant">{guarantee.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
