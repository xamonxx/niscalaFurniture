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
 *
 * There is deliberately no `env(safe-area-inset-bottom)` padding here, though
 * there used to be. The site does not ask for `viewport-fit=cover`, and under
 * the default `viewport-fit` two things are true at once: iOS insets the layout
 * viewport itself, so the bar already sits clear of the home indicator, and
 * `env(safe-area-inset-*)` is defined as zero, so the padding resolved to
 * nothing. It only looked like it was doing the work.
 *
 * Opting into `viewport-fit=cover` is a deliberate visual change - edge to edge
 * behind the notch - and not a one-line one. It would mean putting this padding
 * back, giving `container-editorial`, the header and the mobile menu panel
 * their own left/right insets for the landscape notch, and widening the
 * footer's bottom padding past this bar, which grows to ~99px once the inset is
 * real against a footer that leaves 96px. Portrait, which is nearly all of the
 * traffic, gains nothing from it: there the home indicator sits over Safari's
 * own toolbar, not over the page.
 */
export function StickyMobileCta() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const whatsappUrl = buildWhatsAppUrl({ source: "sticky_mobile" });

  /*
     The admin panel has no use for a sales bar over its toolbars.

     Read as a value rather than an early return: the two branches that met
     here put the guard above the effect below it, which git merged happily
     into a hook that only runs on some routes. React counts hooks per render,
     so navigating out of /admin would have thrown "rendered fewer hooks than
     expected". Bailing out inside the effect keeps the call unconditional and
     still registers no listeners on admin routes.
  */
  const onAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (onAdmin) return;

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
  }, [onAdmin]);

  if (onAdmin) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border-hairline bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
        shown ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!shown}
    >
      {/*
        `items-stretch`, and the buttons pad by 8px rather than 16.

        Both are about 320px, the narrowest phone still in use. There the row
        gives each button 140px, and "Ajukan Survey" needs 95px of that against
        the 88px left over once 16px of padding either side, the 4px gap and the
        16px icon are taken out - seven pixels short, so it wrapped to two lines
        while "WhatsApp" stayed on one and the bar went ragged at 81px tall.

        Horizontal padding is dead weight on a `flex-1` button: the width comes
        from the row, not the content, so the only thing 16px was doing was
        squeezing the label. At 8px the label has 104px and nine to spare, which
        is enough to survive the fallback face rendering wider than Manrope.

        `items-stretch` is the part that has to hold if a future label is longer
        anyway: the two buttons then grow together instead of one of them
        standing a head taller than the other.
      */}
      <div className="flex items-stretch gap-space-xs px-space-md py-space-sm">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "sticky_mobile" })}
            tabIndex={shown ? undefined : -1}
            className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-primary-container px-space-xs py-space-sm text-label-md font-semibold text-deep-black"
          >
            <MessageCircle aria-hidden className="size-4" />
            WhatsApp
          </a>
        ) : null}
        <Link
          href="/survey"
          tabIndex={shown ? undefined : -1}
          className="inline-flex flex-1 items-center justify-center gap-space-2xs rounded-lg bg-deep-black px-space-xs py-space-sm text-label-md font-semibold text-pure-white"
        >
          <ClipboardList aria-hidden className="size-4" />
          Ajukan Survey
        </Link>
      </div>
    </div>
  );
}
