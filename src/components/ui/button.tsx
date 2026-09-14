import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "surface"
  | "outline"
  | "outline-inverse";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-space-xs rounded-lg font-semibold " +
  "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // Text on the brand yellow is always charcoal, never white (DESIGN.md).
  primary:
    "bg-primary-container text-deep-black shadow-hairline hover:bg-primary-container-hover",
  dark: "bg-deep-black text-pure-white hover:bg-inverse-surface",
  surface:
    "bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-deep-black",
  outline:
    "border border-border-hairline-strong text-on-surface hover:border-on-surface",
  /**
   * The same button standing on a photograph or any dark ground.
   *
   * Glass, because a hairline alone was not enough. At 12% white on no fill at
   * all it had nothing to hold on to: over a busy frame the border crossed
   * light and dark parts of the photograph within its own length and the button
   * read as an accident rather than a control.
   *
   * The fill is what makes it visible and the blur is what keeps it calm - a
   * top-to-bottom wash (brighter at the top, thinner at the bottom) reads as a
   * curved pane of glass rather than a flat tint, and `backdrop-saturate`
   * pushes some colour back into whatever the blur just flattened, which is
   * the part that actually makes it look wet rather than frosted. The inset
   * highlight is the top edge catching light, the second, faint inset along
   * the bottom is the same edge losing it - together they are what separates
   * the shape from a bright patch of photograph where a drop shadow cannot.
   *
   * The order matters for degradation: the wash and the border are ordinary
   * paint, so a browser without `backdrop-filter` still gets a button that is
   * plainly a button. The blur and saturation boost are additive.
   */
  "outline-inverse":
    "border border-pure-white/30 bg-gradient-to-b from-pure-white/30 to-pure-white/15 " +
    "text-inverse-on-surface backdrop-blur-xl backdrop-saturate-150 " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_1px_rgba(255,255,255,0.06),0_8px_24px_-12px_rgba(9,11,13,0.7)] " +
    "hover:border-pure-white/50 hover:from-pure-white/38 hover:to-pure-white/20",
};

const sizes: Record<ButtonSize, string> = {
  // `min-h-11` on touch: the small button is not decorative - it carries the
  // footer and contact-page calls to action, where 34px is under the thumb.
  sm: "px-space-lg py-space-xs text-label-md pointer-coarse:min-h-11",
  md: "px-space-xl py-space-sm text-label-lg",
};

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = StyleProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof StyleProps> & {
    href?: undefined;
  };

type ButtonAsLink = StyleProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof StyleProps> & {
    href: string;
    /** Set for links that leave the site (WhatsApp, social profiles). */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * The one button in the system.
 *
 * Renders a real `<button>` or a real link depending on whether `href` is
 * given, so keyboard and assistive-technology behaviour is never faked.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    const { external, ...linkProps } = rest as Omit<
      ButtonAsLink,
      keyof StyleProps
    >;

    if (external) {
      return (
        <a
          {...linkProps}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    return (
      <Link {...linkProps} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<ButtonAsButton, keyof StyleProps>;

  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
