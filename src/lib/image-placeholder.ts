import type { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

/**
 * Spread-in props that show a blurred stand-in until the real photo decodes.
 *
 * Why the data URI goes in `placeholder` and not in `blurDataURL`
 * --------------------------------------------------------------
 * `placeholder="blur"` does not simply paint the stand-in. Next wraps it in an
 * inline SVG carrying two `feGaussianBlur` passes, an `feColorMatrix` and two
 * `feComposite` nodes, then URL-escapes the lot into a style attribute - about
 * 1 KB of boilerplate per image, repeated again in the flight payload. Across
 * the thirty-three cards on /portfolio that more than doubled the document.
 *
 * `placeholder` also accepts a `data:image/*` URI directly, which Next paints
 * as a plain `background-image` with `background-size: cover` and no filter.
 * Our stand-in is sixteen pixels wide and is drawn at roughly four hundred, so
 * the browser's own upscaling supplies the blur that the SVG filter was there
 * to fake. Same effect, a fraction of the bytes.
 *
 * Returns nothing when the image has no placeholder - a few frames are
 * composed in code rather than published by the pipeline.
 */
export function blurPlaceholder(
  dataUrl: string | undefined
): { placeholder: PlaceholderValue } | Record<string, never> {
  if (!dataUrl?.startsWith("data:image/")) return {};
  return { placeholder: dataUrl as PlaceholderValue };
}
