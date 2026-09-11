import Image from "next/image";

import { publishedImageSizes } from "@/data/projects";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  alt: string;
  /** `sizes` for the underlying `<Image>` - must match the slot this renders into. */
  sizes: string;
  /** Applied to the image element itself (object-fit is already `object-cover`). */
  className?: string;
};

/**
 * Renders a `KnowledgeArticle.coverImage` into its slot.
 *
 * Two kinds of source reach this component, same as the in-body image block
 * on the article page. A path the build pipeline published (the portfolio and
 * process photos this project ships with) has known dimensions and pre-built
 * `public/v` variants, so it goes through `next/image` via `fill` and a
 * visitor gets a file sized for their screen. An admin upload or a pasted
 * remote URL has neither - `next/image` would need `unoptimized` or emit a
 * srcset of identical URLs through the pass-through loader, gaining nothing -
 * so it stays a plain `<img>` serving whatever the admin provided.
 *
 * Requires a `position: relative` ancestor with a defined size (an
 * `aspect-*` wrapper), since the pipeline path renders with `fill`.
 */
export function CoverImage({ src, alt, sizes, className }: Props) {
  const published = publishedImageSizes.get(src);

  if (published) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Admin upload/pasted URL with no pipeline variants and no known dimensions for next/image to size against.
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
