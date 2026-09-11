/**
 * The contract between the three things that have to agree about variants.
 *
 * Plain `.mjs` on purpose. `next.config.mjs` and `scripts/build-image-variants.mjs`
 * both load before any TypeScript exists, and `src/lib/image-loader.ts` needs
 * the same values at runtime. A single module all three import is the only way
 * to make drift impossible - a ladder that disagreed with the config would
 * produce srcset entries pointing at files nobody wrote, and the browser would
 * simply show nothing.
 */

/**
 * Every width the site can ask for, ascending.
 *
 * Sized from the real slots rather than Next's defaults: the narrowest is a
 * 22vw thumbnail, the widest a full-bleed hero, and no source photograph is
 * wider than 1600px.
 *
 * @type {readonly number[]}
 */
export const IMAGE_LADDER = [256, 384, 640, 960, 1280, 1600];

/** Where the built variants live, under `public`. Git-ignored; derived output. */
export const VARIANT_ROOT = "/v";

/** Only images under these prefixes are rendered through next/image. */
export const VARIANT_SOURCES = ["/images/", "/logo/"];

/** The ladder step that covers `width`, or the largest one we built. */
export function variantWidth(width) {
  return (
    IMAGE_LADDER.find((step) => step >= width) ??
    IMAGE_LADDER[IMAGE_LADDER.length - 1]
  );
}

/**
 * `/images/a/b.webp` + 640 -> `/v/images/a/b-640.webp`
 *
 * Returns null for anything outside the variant tree, which the loader passes
 * through untouched rather than pointing at a file that was never built.
 *
 * @param {string} src
 * @param {number} width
 * @returns {string | null}
 */
export function variantUrl(src, width) {
  if (!VARIANT_SOURCES.some((prefix) => src.startsWith(prefix))) return null;
  const withoutExtension = src.replace(/\.[a-z0-9]+$/i, "");
  return `${VARIANT_ROOT}${withoutExtension}-${variantWidth(width)}.webp`;
}
