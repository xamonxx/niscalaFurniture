"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { track } from "@/lib/analytics";
import { buildWhatsAppUrl, type WhatsAppSource } from "@/lib/whatsapp";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type WhatsAppCtaProps = {
  source: WhatsAppSource;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Extra line appended to the prefilled message, e.g. the project title. */
  context?: string;
  /** Where to send visitors when no WhatsApp number is configured yet. */
  fallbackHref?: string;
  showIcon?: boolean;
};

/**
 * WhatsApp call to action.
 *
 * Falls back to the survey form rather than rendering a dead link while the
 * business number is still unset, and reports the click through the swappable
 * analytics sink.
 */
export function WhatsAppCta({
  source,
  children,
  variant = "primary",
  size = "md",
  className,
  context,
  fallbackHref = "/survey",
  showIcon = true,
}: WhatsAppCtaProps) {
  const url = buildWhatsAppUrl({ source, context });

  const icon = showIcon ? (
    <MessageCircle aria-hidden className="size-[18px]" />
  ) : null;

  if (!url) {
    return (
      <Button href={fallbackHref} variant={variant} size={size} className={className}>
        {children}
        {icon}
      </Button>
    );
  }

  return (
    <Button
      href={url}
      external
      variant={variant}
      size={size}
      className={className}
      onClick={() => track("whatsapp_click", { source })}
    >
      {children}
      {icon}
    </Button>
  );
}
