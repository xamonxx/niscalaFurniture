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
  const url = variantUrl(src, width);

  if (!url) {
    // Falling back to the untouched original is the right failure mode - a
    // missing variant should never blank the image out - but it was
    // previously silent, so a build that shipped without running
    // `prepare:variants` (or one that partially failed) only showed up once
    // someone measured page weight. A visitor never sees this; it is a
    // build-health signal for whoever is watching the console.
    console.warn(
      `[image-loader] No variant for "${src}" at ${width}px - serving the original file. Run "npm run prepare:variants".`
    );
    return src;
  }

  return url;
}
