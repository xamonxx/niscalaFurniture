import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { approach } from "@/data/content";

/** Section 03 - The Niscala approach. */
export function Approach() {
  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl grid items-end gap-space-lg lg:grid-cols-12 lg:gap-gutter-desktop">
            <div className="space-y-space-xs lg:col-span-8">
              <Eyebrow>Pendekatan Niscala</Eyebrow>
              <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
                Bukan sekadar membuat furniture.
                <br />
                Kami merancang bagaimana ruang Anda bekerja.
              </h2>
            </div>
            <p className="text-body-sm text-on-surface-variant lg:col-span-4">
              Integrasi desain arsitektural dan produksi mandiri memastikan setiap
              sentimeter lemari, kabinet, dan panel terpasang rapi sesuai anatomi
              rumah Anda.
            </p>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid gap-gutter-desktop md:grid-cols-2 lg:grid-cols-4"
        >
          {approach.map((item) => (
            <RevealItem
              as="li"
              key={item.index}
              className="space-y-space-md rounded-md bg-surface-container-low p-space-xl"
            >
              <span
                aria-hidden
                className="block text-[44px] font-bold leading-none text-primary-container"
              >
                {item.index}
              </span>
              <h3 className="text-headline-sm font-semibold text-on-surface">
                {item.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-on-surface-variant">
                {item.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
