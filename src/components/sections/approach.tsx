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
          className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:grid-cols-4"
        >
          {approach.map((item) => (
            <RevealItem
              as="li"
              key={item.index}
              className="space-y-space-xs rounded-md bg-surface-container-low p-space-sm shadow-hairline transition-shadow hover:shadow-panel sm:space-y-space-sm sm:p-space-lg lg:space-y-space-md lg:p-space-xl"
            >
              <span
                aria-hidden
                className="block text-2xl font-bold leading-none text-primary-container sm:text-3xl lg:text-[44px]"
              >
                {item.index}
              </span>
              <h3 className="text-sm font-semibold leading-snug text-on-surface sm:text-base lg:text-headline-sm">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-on-surface-variant sm:text-body-sm">
                {item.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
