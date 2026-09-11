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

/**
 * The spacing scale, which has the same problem one layer down.
 *
 * `space-xl` is neither a length nor an arbitrary value, so tailwind-merge
 * cannot file `px-space-xl` under padding-x at all. An unclassified class is
 * never a conflict, so it is never dropped: passing `px-space-md` to a
 * component whose size already sets `px-space-xl` left both on the element and
 * handed the decision to the cascade, where the override quietly lost. That is
 * how a full-width hero button kept 32px of padding it had been told to give
 * up, and wrapped its label onto a second line at 320px.
 */
const SPACING = [
  "space-2xs",
  "space-xs",
  "space-sm",
  "space-md",
  "space-lg",
  "space-xl",
  "space-2xl",
  "space-3xl",
  "space-4xl",
  "space-5xl",
  "gutter-mobile",
  "gutter-desktop",
  "margin-mobile",
  "margin-desktop",
] as const;

/**
 * Every group whose value is a spacing token. The group id doubles as the class
 * prefix for all of them, so one entry per group is enough.
 */
const SPACING_GROUPS = [
  "p", "px", "py", "pt", "pr", "pb", "pl",
  "m", "mx", "my", "mt", "mr", "mb", "ml",
  "gap", "gap-x", "gap-y",
] as const;

const spacingClassGroups = Object.fromEntries(
  SPACING_GROUPS.map((group) => [group, [{ [group]: [...SPACING] }]])
);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...FONT_SIZES] }],
      shadow: [{ shadow: [...SHADOWS] }],
      ...spacingClassGroups,
    },
  },
});

/** Compose conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
