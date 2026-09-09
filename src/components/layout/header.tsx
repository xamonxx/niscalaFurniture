"use client";

import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderNav } from "@/components/layout/header-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { cn } from "@/lib/cn";

/** Pixels of scroll before the bar stops floating and takes on its surface. */
const SETTLE_AT = 24;

/** Above this the bar always shows: hiding it near the top gains nothing. */
const REVEAL_ABOVE = 160;

/**
 * Movement to ignore before the bar accepts a change of direction.
 *
 * Trackpads and Lenis both deliver a trickle of sub-pixel deltas; without a
 * floor the bar would flip on the jitter of holding still. Deltas below the
 * floor are not discarded, they accumulate - a slow deliberate scroll still
 * reaches it, just later.
 */
const DIRECTION_EPSILON = 6;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Read fresh from the document every time, never from a cached value. */
function isSettled() {
  return window.scrollY > SETTLE_AT;
}

/* ------------------------------------------------------------------ */
/* Hide on the way down, return on the way up                          */
/* ------------------------------------------------------------------ */

/**
 * Direction cannot be derived from the current scroll position alone, so unlike
 * `isSettled` this one is a cached value fed by its own listener. `getSnapshot`
 * stays pure - it only ever reads what the listener last wrote.
 */
let concealed = false;
let lastY = 0;
const concealListeners = new Set<() => void>();

function handleDirection() {
  const y = window.scrollY;
  const delta = y - lastY;

  if (Math.abs(delta) < DIRECTION_EPSILON) return;
  lastY = y;

  const next = delta > 0 && y > REVEAL_ABOVE;
  if (next === concealed) return;

  concealed = next;
  for (const listener of concealListeners) listener();
}

function subscribeToDirection(onChange: () => void) {
  concealListeners.add(onChange);

  if (concealListeners.size === 1) {
    // Re-seed on the first subscriber: this module outlives client-side route
    // changes, and a stale `lastY` from the previous page would read the jump
    // back to the top as a scroll down.
    lastY = window.scrollY;
    concealed = false;
    window.addEventListener("scroll", handleDirection, { passive: true });
  }

  return () => {
    concealListeners.delete(onChange);
    if (concealListeners.size === 0) {
      window.removeEventListener("scroll", handleDirection);
    }
  };
}

function isConcealed() {
  return concealed;
}

/**
 * Site header.
 *
 * A Client Component, unlike the rest of the layout: the bar is transparent
 * while it floats over the homepage hero and only earns its warm-white surface
 * once the page scrolls, and both the wordmark and the navigation have to
 * change tone with it.
 *
 * The transparent state is limited to the homepage. Every other page opens on
 * a light surface, where a white wordmark would simply disappear.
 */
export function Header() {
  const pathname = usePathname();

  // `useSyncExternalStore` rather than an effect, so the position is read fresh
  // on every render: a reload part-way down the page, or a route change back to
  // "/", is right on the first paint instead of after the first scroll. The
  // third argument is the server snapshot - the opaque bar, because that is the
  // one that works on every page.
  const settled = useSyncExternalStore(subscribeToScroll, isSettled, () => true);
  const hidden = useSyncExternalStore(
    subscribeToDirection,
    isConcealed,
    () => false
  );

  // A bar that is off-screen but still in the tab order would send a keyboard
  // reader to links they cannot see, so focus landing inside pulls it back.
  const [focusWithin, setFocusWithin] = useState(false);

  const floating = pathname === "/" && !settled;

  return (
    <header
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
      className={cn(
        // `translate`, not `transform`: Tailwind v4 writes the translate
        // utilities to the standalone property, so naming `transform` here
        // would transition nothing and the bar would snap in and out.
        "fixed inset-x-0 top-0 z-50 border-b transition-[translate,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden && !focusWithin ? "-translate-y-full" : "translate-y-0",
        floating
          ? "border-transparent bg-transparent"
          : "border-border-hairline bg-surface/90 shadow-[0_18px_60px_-48px_rgba(9,11,13,0.55)] backdrop-blur-xl"
      )}
    >
      <div className="container-editorial flex h-20 items-center justify-between gap-space-md lg:gap-gutter-desktop">
        {/*
          Both wordmarks are rendered and cross-faded rather than swapping the
          `src`, so the first scroll never waits on a fresh download. Only the
          light one is the link; the charcoal twin is a decorative overlay.
        */}
        <span className="relative inline-flex items-center">
          <BrandMark
            tone="light"
            size="header"
            eager
            className={cn(
              "transition-opacity duration-300",
              floating ? "opacity-100" : "opacity-0"
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 inline-flex items-center transition-opacity duration-300",
              floating ? "opacity-0" : "opacity-100"
            )}
          >
            <BrandMark tone="dark" size="header" asLink={false} eager />
          </span>
        </span>

        <HeaderNav inverse={floating} />

        <div className="flex items-center gap-space-xs">
          <WhatsAppCta
            source="header"
            size="sm"
            className={cn(
              "hidden min-h-10 rounded-md px-space-lg active:translate-y-px sm:inline-flex",
              floating
                ? "shadow-[0_10px_30px_-18px_rgba(254,179,2,0.75)]"
                : "shadow-hairline"
            )}
          >
            Konsultasi
          </WhatsAppCta>
          <MobileMenu inverse={floating} />
        </div>
      </div>
    </header>
  );
}
