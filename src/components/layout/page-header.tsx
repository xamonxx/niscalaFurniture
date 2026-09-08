import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/typography";
import { Reveal } from "@/components/motion/reveal";

/** Shared masthead for every inner page, so they share one vertical rhythm. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border-hairline bg-surface py-space-3xl lg:py-space-4xl">
      <div className="container-editorial">
        <Reveal className="max-w-3xl space-y-space-sm">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
            {title}
          </h1>
          {lead ? (
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {lead}
            </p>
          ) : null}
        </Reveal>
        {children ? <div className="mt-space-xl">{children}</div> : null}
      </div>
    </section>
  );
}
