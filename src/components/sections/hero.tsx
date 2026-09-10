import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HeroFrames } from "@/components/motion/hero-frames";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";
import {
  heroProject,
  heroSlides,
  photoCount,
  populatedCategories,
  projectCount,
  servedLocations,
} from "@/data/projects";
import { site } from "@/lib/site";

/**
 * Section 01 - Hero.
 *
 * A single full-window photograph with the offer standing on top of it. The
 * frames cross-dissolve and drift with the scroll, so the first screen is the
 * work itself rather than a picture placed beside a description of it.
 *
 * The floating "Studio & Workshop" badge is gone. In its place is a proof bar
 * built from the portfolio data itself, so the first screen carries verifiable
 * numbers instead of a decorative label.
 */
export function Hero() {
  const caption = [heroProject.location, heroProject.categoryShort]
    .filter(Boolean)
    .join(" · ");

  const proof = [
    { value: projectCount, label: "Proyek terdokumentasi" },
    { value: photoCount, label: "Foto pengerjaan" },
    { value: servedLocations.length, label: "Kota & area" },
    { value: populatedCategories.length, label: "Kategori pengerjaan" },
  ];

  return (
    // `-mt-20` cancels the 5rem `main` gives every page to clear the fixed
    // header: this hero runs underneath it instead, which is the whole point of
    // a transparent bar. The content below adds that 5rem back as padding.
    //
    // `min-h` rather than a fixed height: the hero is exactly one screen tall
    // in every ordinary case, and grows instead of clipping the proof bar on a
    // short window or at large text sizes.
    <section className="relative isolate -mt-20 flex min-h-[100dvh] items-center overflow-hidden bg-deep-black">
      <ParallaxMedia distance={40} className="absolute inset-0">
        <HeroFrames images={heroSlides} sizes="100vw" />
      </ParallaxMedia>

      {/*
        Two scrims, because the type sits in a different place on each layout.
        Below lg the column runs the full width, so the cover has to be even.
        From lg the stops follow the text column, which is a fixed 46rem and so
        eats a different share of the window at each width: 78% of it at 1024px
        but only 54% past 1440px. The scrim stays heavy to the end of that
        column and opens up after it, so the wider the window the more
        photograph is left alone. Both hold white body text above 4.5:1 even
        where a frame is at its brightest.
      */}
      <div aria-hidden className="absolute inset-0 bg-deep-black/85 lg:hidden" />
      {/*
        The header floats over this section with no surface of its own, and its
        links sit to the right where the side scrim has already faded out. This
        band is what keeps them legible: heavy across the 5rem bar, gone by the
        time the headline starts.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-deep-black/92 via-deep-black/80 via-50% to-transparent lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-deep-black/92 via-deep-black/85 via-82% to-deep-black/10 lg:block xl:via-66% 2xl:via-58%"
      />

      <div className="container-editorial relative w-full pb-space-xl pt-[calc(5rem+var(--spacing-space-md))] sm:pb-space-2xl">
        <div className="max-w-2xl lg:max-w-[46rem]">
          <Reveal>
            <h1 className="text-display-mobile text-inverse-on-surface sm:text-5xl sm:leading-[1.12] md:text-6xl md:leading-[1.1] lg:text-display">
              Ruang yang dirancang untuk cara Anda{" "}
              <span className="text-primary-container">hidup</span>.
            </h1>
          </Reveal>

          <Reveal delay={1}>
            <p className="mt-space-sm sm:mt-space-md max-w-2xl text-body-md sm:text-body-lg leading-relaxed text-inverse-on-surface/85">
              {site.name} merancang interior dan furniture custom berdasarkan
              ukuran ruang, kebutuhan, dan cara Anda menggunakannya — dari
              konsultasi, survey, desain, produksi di workshop sendiri, hingga
              pemasangan.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <div className="mt-space-md flex flex-col sm:flex-row sm:items-center gap-space-sm sm:gap-space-md">
              <WhatsAppCta source="hero" className="w-full sm:w-auto">
                Konsultasikan Ruangan Anda
              </WhatsAppCta>
              <Button
                href="/portfolio"
                variant="outline-inverse"
                className="w-full sm:w-auto"
              >
                Lihat Portofolio Proyek
              </Button>
            </div>
          </Reveal>

          {/* Proof bar. Every number is counted from the published portfolio,
              so it cannot drift away from what the site actually shows. */}
          <Reveal delay={3}>
            <dl className="mt-space-md sm:mt-space-lg grid grid-cols-2 gap-x-space-md gap-y-space-sm border-t border-border-hairline-dark pt-space-sm sm:pt-space-md sm:grid-cols-4 lg:gap-x-space-md">
              {proof.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="block text-2xl font-semibold text-inverse-on-surface sm:text-headline-md-mobile lg:text-headline-md">
                      {item.value}
                    </span>
                    <span className="mt-space-2xs block text-label-eyebrow uppercase leading-snug text-inverse-on-surface/70 sm:max-w-[12ch]">
                      {item.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Credit for the photograph, moved to the right so it never collides
          with the text column. */}
      {caption ? (
        <span className="absolute bottom-0 right-0 bg-deep-black/80 px-space-md py-space-xs text-label-eyebrow uppercase text-pure-white backdrop-blur-sm">
          {caption}
        </span>
      ) : null}
    </section>
  );
}
