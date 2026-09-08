"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import {
  duration,
  easeDissolve,
  heroHold,
  heroZoom,
} from "@/components/motion/tokens";
import type { ProjectImage } from "@/types";

type HeroFramesProps = {
  /** Frames to cycle through. One frame renders as a plain photograph. */
  images: ProjectImage[];
  /** Passed straight to next/image. */
  sizes: string;
};

/** Milliseconds a frame holds before the next dissolve starts. */
const HOLD_MS = heroHold * 1000;

/**
 * How long to wait before mounting the frames after the first.
 *
 * The hero photograph is the page's LCP element. Mounting all three at once
 * would put three large downloads in its way, so the rest are held back until
 * the first screen has settled - still well ahead of the first dissolve.
 */
const WARM_DELAY_MS = 1500;

/**
 * The zoom travels between these two.
 *
 * The floor is not 1: the frames are overscaled so the scroll parallax has
 * somewhere to move without ever pulling an edge into view.
 */
const ZOOM_MIN = 1.08;
const ZOOM_MAX = 1.2;

/**
 * The homepage hero's photograph, cross-dissolving between frames.
 *
 * Deliberately not a carousel: no controls, no dots, no direction. It is one
 * photograph that slowly becomes another, which is why the frames all come
 * from a single project - the caption printed over it stays true throughout.
 *
 * Every frame breathes on the same slow in-and-out zoom, running whether or
 * not it is the one on screen. That is what keeps a cross-dissolve seamless:
 * the zoom never stops, jumps, or reverses direction mid-fade. The frames
 * mounted later sit a second or so behind in the cycle, which puts at most
 * about 1% of scale between two frames as they trade places - far below what
 * the eye picks up in a fade.
 *
 * Combined with the scroll parallax this sits at the edge of what the design
 * system allows for a background (pasal 15); anything more would fight the
 * headline for attention.
 */
export function HeroFrames({ images, sizes }: HeroFramesProps) {
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [warmed, setWarmed] = useState(false);

  const cycles = !prefersReduced && images.length > 1;

  useEffect(() => {
    if (!cycles) return;
    const timer = setTimeout(() => setWarmed(true), WARM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [cycles]);

  useEffect(() => {
    if (!cycles) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      stop();
      timer = setInterval(
        () => setIndex((current) => (current + 1) % images.length),
        HOLD_MS
      );
    };

    // A backgrounded tab keeps its timers but throttles them, so returning to
    // the page would otherwise show a burst of catch-up dissolves.
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [cycles, images.length]);

  const lead = images[0];

  if (!cycles) {
    return (
      <Image
        src={lead.src}
        alt={lead.alt}
        fill
        sizes={sizes}
        priority
        className="object-cover"
        style={{ scale: ZOOM_MIN }}
      />
    );
  }

  return images.slice(0, warmed ? images.length : 1).map((image, position) => {
    const active = position === index;

    return (
      <motion.div
        key={image.src}
        className="absolute inset-0"
        // The first frame is already painted by the time this mounts; letting
        // Motion animate it in from zero would flash the section background.
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: duration.dissolve, ease: easeDissolve }}
        style={{ willChange: "opacity" }}
        aria-hidden={position > 0}
      >
        {/* Opacity and zoom are kept on separate elements so neither has to
            wait for the other: the fade is a fixed 1.4s, the zoom never stops. */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [ZOOM_MIN, ZOOM_MAX] }}
          transition={{
            duration: heroZoom,
            ease: "easeInOut",
            repeat: Infinity,
            // Mirror rather than reverse, so the easing flips too and the zoom
            // slows into each end instead of snapping around.
            repeatType: "mirror",
          }}
          style={{ willChange: "transform" }}
        >
          <Image
            src={image.src}
            // One description for the whole photograph. The frames are the same
            // room from different angles, so repeating alt text per layer would
            // only make a screen reader announce the same place three times.
            alt={position === 0 ? image.alt : ""}
            fill
            sizes={sizes}
            priority={position === 0}
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    );
  });
}
