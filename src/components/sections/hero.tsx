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
            <h1 className="text-display-mobile text-inverse-on-surface lg:text-display">
              Ruang yang dirancang untuk cara Anda{" "}
              <span className="text-primary-container">hidup</span>.
            </h1>
          </Reveal>

          <Reveal delay={1}>
            <p className="mt-space-md max-w-2xl text-body-lg leading-relaxed text-inverse-on-surface/85">
              {site.name} merancang interior dan furniture custom berdasarkan
              ukuran ruang, kebutuhan, dan cara Anda menggunakannya — dari
              konsultasi, survey, desain, produksi di workshop sendiri, hingga
              pemasangan.
            </p>
          </Reveal>

          <Reveal delay={2}>
            {/*
              A one-column grid until `sm`, a row after it.

              As a wrapping flex row the two buttons sized to their own labels,
              so on a phone they stacked at 301px and 230px - two left-aligned
              buttons of different widths, which reads as a mistake rather than
              a pair. Grid items stretch, so stacked they always match.

              `items-stretch` on the row is for the other axis: the outline
              button carries a 1px border the filled one does not, so side by
              side they stand 46px and 44px unless something makes them agree.
            */}
            <div className="mt-space-md grid gap-space-sm sm:flex sm:flex-wrap sm:items-stretch sm:gap-space-md">
              {/*
                Narrower padding while the buttons are full width, the size's
                own `px-space-xl` back once they size to their labels again.

                Padding is what sets the width of an auto-width button and dead
                weight on a stretched one, where it only eats into the room the
                label has. At 320px it left 190px for a label needing 200, so
                "Konsultasikan Ruangan Anda" wrapped and stood 64px against its
                46px neighbour.
              */}
              <WhatsAppCta
                source="hero"
                className="px-space-md sm:px-space-xl"
              >
                Konsultasikan Ruangan Anda
              </WhatsAppCta>
              <Button
                href="/portfolio"
                variant="outline-inverse"
                className="px-space-md sm:px-space-xl"
              >
                Lihat Portofolio Proyek
              </Button>
            </div>
          </Reveal>

          {/* Proof bar. Every number is counted from the published portfolio,
              so it cannot drift away from what the site actually shows. */}
          <Reveal delay={3}>
            <dl className="mt-space-md grid grid-cols-2 gap-y-space-md border-t border-border-hairline-dark pt-space-md sm:grid-cols-4 lg:gap-x-space-md">
              {proof.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="block text-headline-md-mobile font-semibold text-inverse-on-surface">
                      {item.value}
                    </span>
                    {/*
                      The 10ch cap keeps the captions honest in the four-column
                      layout. Below `sm` there are two columns of about 154px
                      and the cap squeezed them to 77px, wrapping every label
                      onto a second line for no reason and making the proof bar
                      34px taller than it needed to be.
                    */}
                    <span className="mt-space-2xs block text-label-eyebrow uppercase leading-snug text-inverse-on-surface/70 sm:max-w-[10ch]">
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
