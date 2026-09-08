import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Scroll reveal primitives.
 *
 * These are Server Components. The entrance animation is CSS-only (a `view()`
 * timeline defined in globals.css), which matters for more than bundle size:
 * the previous Motion implementation server-rendered every wrapped element at
 * `opacity: 0` and depended on hydration to make it visible, so a failed,
 * blocked or throttled JavaScript bundle left the page blank.
 *
 * Now the markup is visible on its own and the animation is purely additive.
 * Motion is still used where the browser genuinely has to be involved:
 * parallax, the sticky process storyteller, and the before/after slider.
 *
 * Reduced motion and browsers without scroll-driven animation both fall back
 * to plain, immediately visible content.
 */

type Variant = "up" | "image";

const VARIANT_CLASS: Record<Variant, string> = {
  up: "reveal",
  image: "reveal-image",
};

/** How many beats to hold this element back relative to its siblings. */
type Delay = 0 | 1 | 2 | 3;

const DELAY_CLASS: Record<Delay, string> = {
  0: "",
  1: "reveal-delay-1",
  2: "reveal-delay-2",
  3: "reveal-delay-3",
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Render as a different element - `li`, `article`, `section`. */
  as?: ElementType;
  variant?: Variant;
  delay?: Delay;
};

export function Reveal({
  children,
  className,
  as: Tag = "div",
  variant = "up",
  delay = 0,
}: RevealProps) {
  return (
    <Tag className={cn(VARIANT_CLASS[variant], DELAY_CLASS[delay], className)}>
      {children}
    </Tag>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** Staggers its direct children as the group scrolls into view. */
export function RevealGroup({
  children,
  className,
  as: Tag = "div",
}: RevealGroupProps) {
  return <Tag className={cn("reveal-group", className)}>{children}</Tag>;
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/**
 * A direct child of `RevealGroup`.
 *
 * The stagger comes from the parent's `nth-child` rules, so this only needs to
 * be the element that actually sits in the grid.
 */
export function RevealItem({
  children,
  className,
  as: Tag = "div",
}: RevealItemProps) {
  return <Tag className={cn(className)}>{children}</Tag>;
}
