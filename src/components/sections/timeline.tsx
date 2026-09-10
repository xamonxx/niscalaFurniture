import { cn } from "@/lib/cn";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { timeline, timelineNote } from "@/data/content";

/** Section 09 - Project timeline. */
export function Timeline() {
  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl space-y-space-xs">
            <Eyebrow>Timeline pengerjaan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Estimasi waktu yang realistis &amp; terukur.
            </h2>
          </div>
        </Reveal>

        <RevealGroup as="ol" className="grid grid-cols-2 gap-space-sm sm:gap-space-md md:grid-cols-5">
          {timeline.map((phase) => (
            <RevealItem
              as="li"
              key={phase.index}
              className={cn(
                "space-y-space-2xs sm:space-y-space-xs rounded-md p-space-sm sm:p-space-lg",
                phase.emphasis
                  ? "bg-surface-container-high shadow-hairline"
                  : "bg-surface-container-low"
              )}
            >
              <span
                className={cn(
                  "block text-[10px] sm:text-label-eyebrow uppercase",
                  phase.emphasis ? "text-primary" : "text-muted-gray"
                )}
              >
                {phase.index}
              </span>
              <h3 className="text-xs sm:text-label-lg font-bold text-on-surface leading-snug">
                {phase.title}
              </h3>
              <span
                className={cn(
                  "inline-block rounded-sm px-1.5 py-0.5 sm:px-space-xs sm:py-space-2xs text-[10px] sm:text-label-eyebrow font-semibold",
                  phase.emphasis
                    ? "bg-primary-container text-deep-black"
                    : "bg-surface-container-highest text-on-surface"
                )}
              >
                {phase.duration}
              </span>
              {phase.note ? (
                <span className="block text-[10px] sm:text-label-eyebrow uppercase text-muted-gray">
                  {phase.note}
                </span>
              ) : null}
              <p className="pt-1 sm:pt-space-2xs text-[11px] sm:text-body-sm text-on-surface-variant leading-relaxed">
                {phase.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal>
          <p className="mt-space-md text-center text-body-sm text-muted-gray">
            *{timelineNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
