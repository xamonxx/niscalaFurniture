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

        <RevealGroup as="ol" className="grid gap-space-md md:grid-cols-5">
          {timeline.map((phase) => (
            <RevealItem
              as="li"
              key={phase.index}
              className={cn(
                "space-y-space-xs rounded-md p-space-lg",
                phase.emphasis
                  ? "bg-surface-container-high shadow-hairline"
                  : "bg-surface-container-low"
              )}
            >
              <span
                className={cn(
                  "block text-label-eyebrow uppercase",
                  phase.emphasis ? "text-primary" : "text-muted-gray"
                )}
              >
                {phase.index}
              </span>
              <h3 className="text-label-lg font-bold text-on-surface">
                {phase.title}
              </h3>
              <span
                className={cn(
                  "inline-block rounded-sm px-space-xs py-space-2xs text-label-eyebrow font-semibold",
                  phase.emphasis
                    ? "bg-primary-container text-deep-black"
                    : "bg-surface-container-highest text-on-surface"
                )}
              >
                {phase.duration}
              </span>
              {phase.note ? (
                <span className="block text-label-eyebrow uppercase text-muted-gray">
                  {phase.note}
                </span>
              ) : null}
              <p className="pt-space-2xs text-body-sm text-on-surface-variant">
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
