"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";

import { blurPlaceholder } from "@/lib/image-placeholder";
import { cn } from "@/lib/cn";
import type { ProjectImage } from "@/types";

/*
 * Slot widths, spelled out rather than approximated.
 *
 * `container-editorial` caps at 1440px with a 64px gutter above 1024px and a
 * 20px one below, and the grid gap is 32px. The old `30vw` was a stand-in for
 * that arithmetic and it drifted badly on wide screens: on a 1920px display a
 * card is 416px, not 576px, so the browser was picking the 1200w variant where
 * 828w would have done - roughly twice the bytes, and a second cold AVIF
 * encode on the server for a variant nothing needed.
 */
const GALLERY_SIZES = [
  "(min-width: 1440px) 416px",
  "(min-width: 1024px) calc((100vw - 192px) / 3)",
  "(min-width: 768px) calc((100vw - 72px) / 2)",
  // Below md this is a carousel, so the slot is the slide's flex-basis share
  // of the container's content box rather than a grid column.
  "(min-width: 640px) calc(56vw - 22px)",
  "calc(82vw - 33px)",
].join(", ");

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
                  sizes={GALLERY_SIZES}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  {...blurPlaceholder(image.blurDataURL)}
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
              className="inline-flex size-10 pointer-coarse:size-11 items-center justify-center rounded-lg border border-border-hairline-strong text-on-surface transition-colors disabled:opacity-40"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              aria-label="Foto berikutnya"
              className={cn(
                "inline-flex size-10 pointer-coarse:size-11 items-center justify-center rounded-lg text-deep-black transition-colors",
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
