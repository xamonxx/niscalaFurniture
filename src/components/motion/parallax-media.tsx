"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type ParallaxMediaProps = {
  children: ReactNode;
  className?: string;
  /**
   * Total vertical travel in pixels across the element's scroll range.
   * Kept in the 20-60px band the design system allows (pasal 15).
   */
  distance?: number;
};

/**
 * Subtle scroll-linked parallax for the hero and a handful of large media
 * blocks. Not for general use: applied broadly it turns an editorial page into
 * a fairground.
 *
 * Returns a plain wrapper when reduced motion is requested.
 */
export function ParallaxMedia({
  children,
  className,
  distance = 40,
}: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);

  if (prefersReduced) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn(className)}>
      {/* `relative` matters: the children use next/image with `fill`, which
          needs a positioned ancestor. */}
      <motion.div
        style={{ y }}
        className="relative h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
