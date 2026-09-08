"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
