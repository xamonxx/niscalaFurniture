"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Route change transition.
 *
 * Switching pages used to swap the whole document in a single frame, which
 * reads as a hard refresh rather than a move within one site. Keying the
 * wrapper on the pathname remounts it on every navigation, and the remount
 * restarts the `page-enter` animation defined in globals.css.
 *
 * The animation is CSS, not Motion, for the same reason the scroll reveals
 * are: the markup is visible on its own and the animation is purely additive,
 * so a failed or throttled bundle can never leave a page blank. This component
 * ships nothing but the key.
 *
 * The top padding also lives here rather than on `<main>` in the root layout.
 * It exists only to clear the public `Header`, which is `fixed` - but `Header`
 * renders nothing on `/admin` routes, so the padding used to survive anyway as
 * a stray strip of the body's cream background sitting above the admin panel's
 * own white surface, printing a hard seam. Header, Footer and StickyMobileCta
 * already key their own visibility off this same `pathname` check.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <div key={pathname} className={cn("page-enter", !onAdmin && "pt-20")}>
      {children}
    </div>
  );
}
