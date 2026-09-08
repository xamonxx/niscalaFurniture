"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import type { ProjectImage } from "@/types";

/**
 * Project photo gallery.
 *
 * Every archive photograph is portrait, so on a phone a plain stack of six of
 * them is a very long scroll past the same room. Below `md` this is a swipeable
 * carousel; at `md` and above Embla switches itself off and the same markup
 * lays out as an ordinary grid, so the desktop view carries no transform and no
 * carousel behaviour at all.
 */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    // Above the md breakpoint the carousel deactivates and the slides become
    // grid children.
    breakpoints: { "(min-width: 48rem)": { active: false } },
  });

  /**
   * Embla is an external store, so it is read through `useSyncExternalStore`
   * rather than mirrored into state from an effect. That keeps the first paint
   * consistent with the carousel's real position and avoids the extra render
   * pass a `setState`-in-effect would cost on every mount.
   *
   * Each snapshot returns a primitive, which keeps it referentially stable.
   */
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", onStoreChange).on("reInit", onStoreChange);
      return () => {
        emblaApi.off("select", onStoreChange).off("reInit", onStoreChange);
      };
    },
    [emblaApi]
  );

  const selected = useSyncExternalStore(
    subscribe,
    () => emblaApi?.selectedScrollSnap() ?? 0,
    () => 0
  );
  const canPrev = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false
  );
  const canNext = useSyncExternalStore(
    subscribe,
    () => emblaApi?.canScrollNext() ?? false,
    () => false
  );

  const single = images.length <= 1;

  return (
    <div className="space-y-space-md">
      <div
        ref={emblaRef}
        className="overflow-hidden md:overflow-visible"
        // The carousel is a horizontal region on small screens; on desktop it
        // is just a grid, so the role is only meaningful while it can scroll.
        role={single ? undefined : "region"}
        aria-roledescription={single ? undefined : "carousel"}
        aria-label={single ? undefined : "Galeri foto proyek"}
      >
        <ul className="flex gap-space-md md:grid md:grid-cols-2 md:gap-gutter-desktop lg:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.src}
              className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_56%] md:flex-none"
              aria-label={
                single ? undefined : `Foto ${index + 1} dari ${images.length}`
              }
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface-container-high">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 82vw"
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!single ? (
        <div className="flex items-center justify-between md:hidden">
          <p className="text-body-sm text-muted-gray" aria-live="polite">
            Foto {selected + 1} dari {images.length}
          </p>
          <div className="flex items-center gap-space-xs">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              aria-label="Foto sebelumnya"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border-hairline-strong text-on-surface transition-colors disabled:opacity-40"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Foto berikutnya"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg text-deep-black transition-colors",
                canNext ? "bg-primary-container" : "bg-surface-container-high opacity-40"
              )}
            >
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
