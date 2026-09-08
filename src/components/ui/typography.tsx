import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Eyebrow label: uppercase, widely tracked, always categorising what follows
 * ("01 / RESIDENTIAL JOINERY"). Never used as a heading on its own.
 */
export function Eyebrow({
  children,
  className,
  tone = "brand",
}: {
  children: ReactNode;
  className?: string;
  tone?: "brand" | "muted" | "onDark";
}) {
  return (
    <span
      className={cn(
        "block text-label-eyebrow uppercase",
        tone === "brand" && "text-primary",
        tone === "muted" && "text-muted-gray",
        tone === "onDark" && "text-primary-container",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Section heading pair. The responsive step down on small screens comes from
 * the dedicated `-mobile` type tokens rather than an arbitrary clamp.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "light",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("space-y-space-xs", className)}>
      {eyebrow ? (
        <Eyebrow tone={tone === "dark" ? "onDark" : "brand"}>{eyebrow}</Eyebrow>
      ) : null}
      <Tag
        className={cn(
          "text-headline-lg-mobile lg:text-headline-lg",
          tone === "dark" ? "text-pure-white" : "text-on-surface"
        )}
      >
        {title}
      </Tag>
      {lead ? (
        <p
          className={cn(
            "max-w-2xl pt-space-2xs text-body-lg",
            tone === "dark" ? "text-tertiary-fixed-dim" : "text-on-surface-variant"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Editorial text link: understated type with a directional arrow and an
 * underline that grows from zero on hover.
 */
export function TextLink({
  href,
  children,
  className,
  arrow = "right",
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: "right" | "up";
  external?: boolean;
}) {
  const Icon = arrow === "up" ? ArrowUpRight : ArrowRight;

  const content = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full"
        />
      </span>
      <Icon
        aria-hidden
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </>
  );

  const classes = cn(
    "group inline-flex items-center gap-space-2xs text-label-md font-semibold text-on-surface hover:text-primary",
    className
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/** 1px structural divider - the design system's only separator. */
export function Hairline({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border-hairline", className)} />;
}
