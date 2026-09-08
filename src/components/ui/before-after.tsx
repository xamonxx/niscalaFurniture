"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";

import type { ProjectImage } from "@/types";

type BeforeAfterProps = {
  before: ProjectImage;
  after: ProjectImage;
  beforeLabel?: string;
  afterLabel?: string;
};

/** Where the pinned frame comes to rest. Mirrors `lg:top-24` on that wrapper. */
const STICKY_TOP = 96;

/**
 * Before/after comparison, opened by scrolling.
 *
 * On a desktop viewport with room for it, the frame pins and the reader's own
 * scroll wipes the "before" away: nobody had to discover that the divider was
 * draggable, and most never did, so the "after" photograph - the entire point
 * of the section - went unseen.
 *
 * The divider position lives in a CSS custom property rather than React state.
 * Scroll would otherwise re-render the whole subtree on every frame. `--pos` is
 * the percentage of the "before" image still showing, so 100 is untouched and 0
 * is fully revealed.
 *
 * The control is still a real `<input type="range">`, so it stays
 * keyboard-operable and correctly announced, and dragging it still works.
 * Phones get no pinning at all: there the slider is the only mechanism, exactly
 * as before.
 */
export function BeforeAfter({
  before,
  after,
  beforeLabel = "Sebelum",
  afterLabel = "Sesudah",
}: BeforeAfterProps) {
  const id = useId();
  const prefersReduced = useReducedMotion();

  /** The tall element whose scroll the reveal spends. */
  const trackRef = useRef<HTMLDivElement | null>(null);
  /** The block that stays put inside it. */
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * The single write path, used by both the scroll handler and the slider.
   *
   * Touching the DOM directly keeps the whole interaction out of React's render
   * cycle: no state, no re-render, no reconciliation on a scroll frame.
   */
  const setPos = (value: number) => {
    const pos = Math.min(Math.max(value, 0), 100);

    frameRef.current?.style.setProperty("--pos", pos.toFixed(2));

    const input = inputRef.current;
    if (input) {
      const rounded = String(Math.round(pos));
      if (input.value !== rounded) input.value = rounded;
      input.setAttribute(
        "aria-valuetext",
        `${rounded}% menampilkan kondisi ${beforeLabel.toLowerCase()}`
      );
    }
  };

  useEffect(() => {
    // Reduced motion gets a static half-and-half split and the slider. A tall
    // track with nothing moving in it would only be dead scroll.
    if (prefersReduced) return;

    const query = window.matchMedia("(min-width: 1024px)");
    let frame = 0;
    let detach: (() => void) | null = null;

    const sync = () => {
      frame = 0;

      const track = trackRef.current;
      const pinned = pinnedRef.current;
      if (!track || !pinned) return;

      const travel = track.offsetHeight - pinned.offsetHeight;
      // No runway: the viewport is too short for the pinned layout, so the
      // slider is the only control and the divider must stay where it is.
      if (travel <= 0) return;

      const raw = (STICKY_TOP - track.getBoundingClientRect().top) / travel;
      const progress = Math.min(Math.max(raw, 0), 1);

      setPos((1 - progress) * 100);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    const attach = () => {
      detach?.();
      detach = null;

      // Phones keep the plain slider: no listener, no measuring, no cost.
      if (!query.matches) return;

      sync();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);

      detach = () => {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      };
    };

    attach();
    query.addEventListener("change", attach);

    return () => {
      query.removeEventListener("change", attach);
      if (frame) cancelAnimationFrame(frame);
      detach?.();
    };
    // `setPos` only touches refs, so it needs no dependency entry of its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  return (
    /*
      The tall track is the scroll the reveal spends, and the block inside it is
      what stays put. Both are desktop-only, and only above a viewport tall
      enough to hold the frame: below that the track has no extra height, the
      handler finds no runway, and the component degrades to the plain slider it
      has always been.

      This must not be wrapped in `Reveal` - that animates a transform, and a
      transformed ancestor breaks `position: sticky` inside it.
    */
    <div
      ref={trackRef}
      className={
        prefersReduced ? undefined : "lg:[@media(min-height:640px)]:h-[200vh]"
      }
    >
      {/*
        The height budget is spent as a *width* cap on the whole figure, not as
        a `max-height` on the frame.

        A `max-height` fights the aspect ratio: the browser honours the ratio by
        shrinking the frame's width instead, and a block box narrower than its
        column sits against the left edge. The section looked off-centre while
        the container around it was centred perfectly. Capping the width at
        `height x 16/10` reaches the same height, keeps the ratio intact, lets
        `mx-auto` centre it, and keeps the caption the same width as the photo.
      */}
      <figure
        ref={pinnedRef}
        className="mx-auto max-w-[calc((100dvh_-_10.5rem)*1.6)] space-y-space-sm lg:sticky lg:top-24"
      >
        <div
          ref={frameRef}
          style={{ "--pos": "100" } as React.CSSProperties}
          className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-container-high"
        >
          {/* "After" sits underneath and is revealed as the divider moves left. */}
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes="(min-width: 1024px) 70vw, 92vw"
            className="object-cover"
          />

          {/*
            Each label lives inside the layer it names, so the wipe carries it
            away with its own photograph. Sitting loose on top, they kept
            labelling whatever ended up underneath: at full reveal a "Sebelum"
            badge was still sitting on the finished room.
          */}
          <div className="absolute inset-0 [clip-path:inset(0_calc(100%_-_var(--pos)*1%)_0_0)]">
            <Image
              src={before.src}
              alt={before.alt}
              fill
              sizes="(min-width: 1024px) 70vw, 92vw"
              className="object-cover"
            />
            <span className="pointer-events-none absolute left-space-sm top-space-sm rounded-sm bg-deep-black/80 px-space-sm py-space-2xs text-label-eyebrow uppercase text-pure-white">
              {beforeLabel}
            </span>
          </div>

          <div className="absolute inset-0 [clip-path:inset(0_0_0_calc(var(--pos)*1%))]">
            <span className="pointer-events-none absolute right-space-sm top-space-sm rounded-sm bg-primary-container px-space-sm py-space-2xs text-label-eyebrow uppercase text-deep-black">
              {afterLabel}
            </span>
          </div>

          {/*
            Centred on the seam. Anchored by its left edge, the 2px bar sat
            entirely outside the frame at `--pos: 100` and was clipped away, so
            the divider vanished at one end of the sweep and hugged the corner
            at the other.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-[calc(var(--pos)*1%)] w-0.5 -translate-x-1/2 bg-primary-container"
          />

          <label htmlFor={id} className="sr-only">
            Geser untuk membandingkan kondisi sebelum dan sesudah pengerjaan
          </label>
          <input
            id={id}
            ref={inputRef}
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={100}
            onInput={(event) => setPos(Number(event.currentTarget.value))}
            aria-valuetext={`100% menampilkan kondisi ${beforeLabel.toLowerCase()}`}
            /*
              The thumb is hidden on desktop: there the scroll drives the
              divider, and a handle sitting on the photo only advertised a
              control nobody needs to touch. Dragging and keyboard still work,
              and the handle comes back on keyboard focus so anyone arrowing
              through can see what they are moving. Phones keep it always
              visible - there it is the only control.
            */
            className="absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container [&::-moz-range-thumb]:h-16 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-ew-resize [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary-container [&::-webkit-slider-thumb]:h-16 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-primary-container lg:[&::-moz-range-thumb]:bg-transparent lg:[&::-webkit-slider-thumb]:bg-transparent lg:focus-visible:[&::-moz-range-thumb]:bg-primary-container lg:focus-visible:[&::-webkit-slider-thumb]:bg-primary-container"
          />
        </div>
        <figcaption className="text-body-sm text-muted-gray">
          Ruangan terbuka sendiri saat Anda menggulir. Pembatasnya juga bisa
          digeser untuk membandingkan sebelum dan sesudah pengerjaan.
        </figcaption>
      </figure>
    </div>
  );
}
