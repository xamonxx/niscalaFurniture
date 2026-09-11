"use client";

import { variantUrl } from "./image-ladder.mjs";

/**
 * Points every next/image at a file that already exists on disk.
 *
 * The built-in optimiser is off (see `images.loader` in next.config.mjs), so
 * nothing is resized while a visitor waits - `npm run prepare:variants` has
 * already written every width in the ladder into `public/v`.
 *
 * `quality` is deliberately ignored: it is baked into the build, and honouring
 * it here would mean encoding on demand, which is the whole thing this
 * replaces.
 */
export default function niscalaImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return variantUrl(src, width) ?? src;
}
