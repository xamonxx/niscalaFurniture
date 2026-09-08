import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system's type scale uses names tailwind-merge cannot recognise as
 * font sizes (`text-label-lg`, `text-headline-md`, …). Left unconfigured it
 * files them under `text-color` instead, so `cn("text-pure-white", "text-label-lg")`
 * silently drops the colour - which is how a black button ended up with black
 * text on it.
 *
 * Declaring the scale here puts every `text-*` utility in the right group, so
 * a size and a colour can coexist regardless of the order they are passed in.
 */
const FONT_SIZES = [
  "display",
  "display-mobile",
  "headline-lg",
  "headline-lg-mobile",
  "headline-md",
  "headline-md-mobile",
  "headline-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-eyebrow",
] as const;

/** Custom named shadows, for the same reason: they are not shadow colours. */
const SHADOWS = ["hairline", "panel", "media"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
      shadow: [{ shadow: [...SHADOWS] }],
    },
  },
});

/** Compose conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
