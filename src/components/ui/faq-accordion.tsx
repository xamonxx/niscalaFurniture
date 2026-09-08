"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

import { track } from "@/lib/analytics";
import type { FaqItem } from "@/types";

/**
 * FAQ accordion (pasal 23).
 *
 * Radix supplies the keyboard navigation and ARIA state; the height animation
 * uses the `--radix-accordion-content-height` variable so it works without a
 * measurement pass in JavaScript.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className="space-y-space-sm"
      onValueChange={(value) => {
        if (value) track("faq_open", { question: value });
      }}
    >
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="overflow-hidden rounded-md bg-surface-container-low"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-start justify-between gap-space-md p-space-lg text-left">
              <span className="text-headline-sm font-semibold text-on-surface">
                {item.question}
              </span>
              <Plus
                aria-hidden
                className="mt-1 size-5 shrink-0 text-primary transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]:rotate-45"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="px-space-lg pb-space-lg text-body-sm leading-relaxed text-on-surface-variant">
              {item.answer}
            </p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
