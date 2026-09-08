"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import { navLinks } from "@/components/layout/nav-links";
import { isActivePath } from "@/components/layout/is-active";

/** One bar, shared by every link, so it travels between them. */
const ACTIVE_MARKER = "header-nav-active";

type HeaderNavProps = {
  /** Set while the bar floats over the hero photograph, on a dark ground. */
  inverse?: boolean;
};

/** Desktop navigation. Client-side only because it highlights the active route. */
export function HeaderNav({ inverse = false }: HeaderNavProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-space-sm">
        {navLinks.map((link) => {
          const active = isActivePath(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex min-h-10 items-center rounded-md px-space-sm text-label-lg [letter-spacing:0] transition-[color,background-color,translate] duration-200 active:translate-y-px",
                  inverse
                    ? active
                      ? "text-inverse-on-surface"
                      : "text-inverse-on-surface/70 hover:bg-pure-white/10 hover:text-inverse-on-surface"
                    : active
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                )}
              >
                {active ? (
                  prefersReduced ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                    />
                  ) : (
                    /* A shared `layoutId` makes this one strip rather than six:
                       Motion animates it from the link being left to the link
                       being entered, so the active state travels instead of
                       blinking out here and in over there. */
                    <motion.span
                      aria-hidden
                      layoutId={ACTIVE_MARKER}
                      className="absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-primary-container"
                      transition={{
                        duration: duration.standard,
                        ease: easeOutEditorial,
                      }}
                    />
                  )
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-space-sm bottom-1 h-0.5 rounded-full bg-transparent transition-colors duration-200",
                      inverse
                        ? "group-hover:bg-inverse-on-surface/18"
                        : "group-hover:bg-border-hairline-strong"
                    )}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
