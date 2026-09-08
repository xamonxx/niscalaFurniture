"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Soft smooth scrolling (pasal 4 & 21).
 *
 * Deliberately conservative: Lenis only takes over the wheel on pointer
 * devices. On touch screens the native scroll is already smooth and hijacking
 * it introduces the lag that makes sites feel broken on phones. It also stands
 * down entirely when the visitor prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const update = () => setEnabled(!reduced.matches && !coarse.matches);
    update();

    reduced.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        smoothWheel: true,
        // Native touch scrolling stays untouched.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
