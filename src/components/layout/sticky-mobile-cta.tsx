"use client";

import { ClipboardList, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** The survey form marks itself with this id so the bar can step aside. */
export const SURVEY_ANCHOR_ID = "konsultasi-flow";

/**
 * Sticky conversion bar for small screens (pasal 36).
 *
 * Two rules keep it from becoming an obstacle: it only appears once the
 * visitor has scrolled past the hero, and it hides whenever the survey form
 * reaches the bottom of the viewport, so it can never sit on top of the inputs
 * it is advertising.
 *
 * Both are derived from one scroll handler rather than an IntersectionObserver.
 * The overlap test is the thing standing between a visitor and a form field, so
 * it is worth computing directly instead of depending on a second async
 * mechanism that can be throttled independently of scrolling.
 */
export function StickyMobileCta() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const whatsappUrl = buildWhatsAppUrl({ source: "sticky_mobile" });

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const update = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.6;

      const form = document.getElementById(SURVEY_ANCHOR_ID);
      let overlapsForm = false;
      if (form) {
        const rect = form.getBoundingClientRect();
        // The bar occupies roughly the bottom 88px of the viewport; treat a
        // generous band as off-limits so it never covers a field or a label.
        const barBand = window.innerHeight - 140;
        overlapsForm = rect.top < window.innerHeight && rect.bottom > barBand;
      }

      setShown(pastHero && !overlapsForm);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border-hairline bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        shown ? "translate-y-0" : "translate-y-full"
      )}
      // Keep clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!shown}
    >
      <div className="flex items-center gap-space-xs px-space-md py-space-sm">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "sticky_mobile" })}
            tabIndex={shown ? undefined : -1}
            className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-primary-container px-space-md py-space-sm text-label-md font-semibold text-deep-black"
          >
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </a>
        ) : null}
        <Link
          href="/survey"
          tabIndex={shown ? undefined : -1}
          className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-deep-black px-space-md py-space-sm text-label-md font-semibold text-pure-white"
        >
          <ClipboardList aria-hidden className="size-4" />
          Ajukan Survey
        </Link>
      </div>
    </div>
  );
}
