"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { ProcessStep, ProjectImage } from "@/types";

type ProcessStorytellingProps = {
  steps: ProcessStep[];
  images: ProjectImage[];
};

/**
 * Sticky storytelling for the order process (pasal 15).
 *
 * Desktop: the eight steps scroll past a media panel that stays pinned; the
 * step nearest the middle of the viewport becomes active, turns brand yellow,
 * and crossfades the panel to a matching photograph.
 *
 * Below `lg` the sticky panel is dropped entirely and the same markup reads as
 * a plain vertical stepper - no pinning, no scroll hijacking on touch.
 */
/**
 * Gap between the intermediate steps when the panel is catching up.
 *
 * The step under the rail is committed the instant the rail reaches it - there
 * is no waiting period. This interval only applies when a single flick of the
 * wheel crossed several steps at once: the panel still refuses to skip a photo,
 * so it walks the ones in between. Short enough to read as a fast flip rather
 * than a queue.
 */
const STEP_INTERVAL_MS = 120;

/** Where the pinned block comes to rest. Mirrors `lg:top-24` on that wrapper. */
const STICKY_TOP = 96;

export function ProcessStorytelling({ steps, images }: ProcessStorytellingProps) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  /** The tall element whose scroll the pinned section spends. */
  const trackRef = useRef<HTMLDivElement | null>(null);
  /** The block that stays put inside it. */
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();

  /**
   * Whether the pinned, photo-driven layout is on screen at all.
   *
   * Starts false so the server and the first client render agree; the effect
   * below settles it immediately after mount.
   */
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Mirrors the `lg:` breakpoint that reveals the media panel.
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const commit = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  /** Drops any catch-up walk the scroll handler still has queued. */
  const cancelDwell = useRef<() => void>(() => {});

  /**
   * A step can also just be clicked. That answers a reader who has spotted the
   * stage they care about and wants its photo now rather than scrolling to it,
   * so any queued walk is dropped and the panel switches straight away. The
   * next scroll takes the panel back over, as usual.
   */
  const selectStep = useCallback(
    (index: number) => {
      cancelDwell.current();
      commit(index);
    },
    [commit]
  );

  useEffect(() => {
    /*
      Phones get none of this.

      There is no media panel below `lg`, so every scroll frame spent measuring
      six cards, every re-render it triggered, and every catch-up timer behind
      it bought nothing - and the one thing it did produce was
      wrong there: the highlight crawled a step at a time, seconds behind a
      thumb that had already stopped. Without the panel the list is a plain
      stepper, exactly as documented above, and the active step changes only
      when someone taps one.
    */
    if (!isDesktop) return;

    const nodes = stepRefs.current.filter(
      (node): node is HTMLLIElement => node !== null
    );
    if (nodes.length === 0) return;

    let frame = 0;
    let walk = 0;
    let progress = 0;

    const list = nodes[0].parentElement;

    /**
     * The step the progress rail is currently standing in.
     *
     * The rail is `scaleY(--progress)` over the full height of the list, so its
     * tip sits at `progress * listHeight`. Reading the step off the real row
     * boxes at that exact point is what keeps the photo and the rail in step:
     * the moment the rail crosses into row 02, row 02 is what the panel shows.
     *
     * Splitting the travel into six equal slices instead - the obvious shortcut -
     * drifts, because a slice is `listHeight / 6` while a row pitch is
     * `cardHeight + gap`. The two only agree when the gap is zero; here they
     * came apart by several pixels a row, so the swap landed just before or
     * just after the rail visibly reached the number.
     */
    const measure = () => {
      const track = trackRef.current;
      const pinned = pinnedRef.current;

      if (track && pinned && list) {
        const travel = track.offsetHeight - pinned.offsetHeight;

        if (travel > 0) {
          const raw = (STICKY_TOP - track.getBoundingClientRect().top) / travel;
          progress = Math.min(Math.max(raw, 0), 1);

          const listTop = list.getBoundingClientRect().top;
          const tip = progress * list.offsetHeight;

          // The last row whose top edge the rail has reached.
          let index = 0;
          nodes.forEach((node, i) => {
            if (node.getBoundingClientRect().top - listTop <= tip) index = i;
          });

          return index;
        }
      }

      // Nothing is pinned - phones, or a layout where the track has no extra
      // height to spend. Fall back to whichever card is nearest the middle.
      const middle = window.innerHeight / 2;

      let nearest = 0;
      let nearestDistance = Infinity;

      nodes.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - middle);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });

      progress = nodes.length > 1 ? nearest / (nodes.length - 1) : 0;
      return nearest;
    };

    /**
     * Move one step towards `target`, then keep going until we arrive.
     *
     * The guard the whole thing rests on is `Math.sign`: the committed index
     * only ever changes by one, so the panel cannot skip a photo no matter how
     * far a flick of the wheel carried the page. Each hop re-measures, so if
     * the reader is still moving the walk follows them to wherever they end up
     * instead of marching to a target that has gone stale.
     */
    const stepToward = (target: number) => {
      const current = activeRef.current;
      if (target === current) return;

      commit(current + Math.sign(target - current));

      window.clearTimeout(walk);
      walk = window.setTimeout(() => {
        walk = 0;
        stepToward(measure());
      }, STEP_INTERVAL_MS);
    };

    /**
     * Commit on the same frame the rail crosses the row. No waiting period.
     *
     * The dwell this used to run existed for the un-pinned layout, where all six
     * cards shared one screen and a single flick crossed the lot. The pinned
     * track spends roughly half a screen of scroll per step now, so there is
     * nothing left to debounce, and the wait only read as lag.
     */
    const sync = () => {
      frame = 0;

      const target = measure();

      // The rail and the backdrop read this straight from CSS, so the effect
      // stays smooth at scroll resolution instead of stepping once per commit -
      // and it costs no React render.
      pinnedRef.current?.style.setProperty("--progress", progress.toFixed(4));

      stepToward(target);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    cancelDwell.current = () => {
      window.clearTimeout(walk);
      walk = 0;
    };

    commit(measure());
    pinnedRef.current?.style.setProperty("--progress", progress.toFixed(4));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelDwell.current = () => {};
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(walk);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [commit, isDesktop]);

  // Indexed straight across, never wrapped: frame N belongs to step N. Wrapping
  // was a leftover from the days this panel cycled unrelated portfolio photos,
  // and it silently paired every later step with the wrong picture whenever a
  // frame was missing - while the caption below still named the right step.
  const activeImage = images[active];

  return (
    /*
      On desktop the whole section is pinned and the page holds still while the
      six steps play out; only once step 06 has had its turn does the page carry
      on. The tall outer track is the scroll that gets spent doing it - roughly
      half a screen per step - and the inner wrapper is what stays put.

      Below `lg` none of this applies: no track height, no pinning, and the
      panel is not rendered at all, so the same markup reads as an ordinary
      vertical stepper.
    */
    <div
      ref={trackRef}
      className="lg:[@media(min-height:700px)]:h-[400vh]"
    >
      <div ref={pinnedRef} className="relative lg:sticky lg:top-24">
        {/*
          A single soft glow that drifts down the block as the six steps go by,
          so the pinned view registers as moving through something rather than
          standing still. It reads the same `--progress` the rail does, which is
          written straight to the DOM by the scroll handler.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)] lg:block"
        >
          <div className="absolute left-1/2 top-[calc(var(--progress,0)*(100%_-_55vh))] aspect-square w-[55vh] -translate-x-1/2 rounded-full bg-primary-container/[0.07] blur-[100px]" />
        </div>

        <div className="relative grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          {/*
            The tail padding only exists when the section is NOT pinned. A
            sticky child is pinned for as long as its column has height left
            underneath it, and without this the column ran out while step 04 was
            centred - steps 05 and 06 reached the middle of the screen only
            after the panel had slid away. Widening the gaps between cards
            cannot fix that: the card pitch cancels out of the arithmetic on
            both sides, so the runway has to sit below the last card.
          */}
          <ol className="space-y-space-sm lg:relative lg:col-span-7 lg:space-y-[clamp(0.375rem,0.9vh,0.75rem)] lg:pl-space-lg lg:before:absolute lg:before:inset-y-0 lg:before:left-0 lg:before:w-px lg:before:bg-pure-white/12 lg:before:content-[''] lg:after:absolute lg:after:inset-y-0 lg:after:left-0 lg:after:w-px lg:after:origin-top lg:after:scale-y-[var(--progress,0)] lg:after:bg-primary-container lg:after:content-[''] lg:before:[-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)] lg:before:[mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)] lg:after:[-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)] lg:after:[mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_90%,transparent)] lg:[@media(max-height:699px)]:pb-[45vh]">
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li
              key={step.index}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "relative rounded-md border p-space-md transition-colors duration-300 lg:p-[clamp(0.5rem,1.3vh,1rem)]",
                isActive
                  ? "border-primary-container/40 bg-inverse-surface/70"
                  : "border-transparent bg-inverse-surface/30 hover:bg-inverse-surface/50"
              )}
            >
              <div className="flex items-start gap-space-sm">
                <span
                  aria-hidden
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-label-md font-bold transition-colors duration-300 lg:size-7",
                    isActive
                      ? "bg-primary-container text-deep-black"
                      : "bg-inverse-surface text-tertiary-fixed-dim"
                  )}
                >
                  {step.index}
                </span>
                <div className="space-y-space-2xs">
                  <h3
                    className={cn(
                      "text-body-lg font-semibold transition-colors duration-300 lg:text-body-md",
                      isActive ? "text-primary-container" : "text-pure-white"
                    )}
                  >
                    {/* Only the title is the control, but its ::after covers the
                        whole card - so the click target is the card while the
                        button still holds nothing but phrasing content. */}
                    <button
                      type="button"
                      onClick={() => selectStep(index)}
                      className="text-left after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary-container"
                    >
                      {step.title}
                    </button>
                  </h3>
                  <p className="text-body-sm leading-relaxed text-tertiary-fixed-dim lg:leading-normal">
                    {step.body}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:col-span-5 lg:block">
        <div>
          {/*
            The frame is 4:5, but on a wide-and-short laptop that made the
            pinned panel taller than the space under `top-28`, pushing its own
            bottom edge and the step caption off-screen for the whole scroll.
            Capping the height lets the photo crop instead of the panel.
          */}
          <div className="relative aspect-[4/5] max-h-[calc(100dvh-10rem)] overflow-hidden rounded-md bg-inverse-surface">
            {prefersReduced ? (
              activeImage ? (
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  sizes="38vw"
                  className="object-cover"
                />
              ) : null
            ) : (
              <AnimatePresence initial={false}>
                {activeImage ? (
                  <motion.div
                    key={activeImage.src}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration.standard, ease: easeOutEditorial }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeImage.src}
                      alt={activeImage.alt}
                      fill
                      sizes="38vw"
                      className="object-cover"
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>
          <p className="mt-space-sm text-label-eyebrow uppercase text-tertiary-fixed-dim">
            Tahap {steps[active]?.index} — {steps[active]?.title}
          </p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
