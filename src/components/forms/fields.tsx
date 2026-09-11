"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Form field primitives.
 *
 * Each one wires the label, the control and the error message together with
 * real `htmlFor` / `aria-describedby` / `aria-invalid` attributes, so nothing
 * downstream has to remember to do it.
 */

export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-space-2xs", className)}>
      <label htmlFor={id} className="block text-label-md font-semibold text-on-surface">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-body-sm text-muted-gray">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(
    Boolean
  );
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * Shared appearance for every text control.
 *
 * The size is 14px on a mouse-driven screen and 16px wherever the pointer is
 * coarse. That is not a taste decision: Safari on iOS zooms the whole page in
 * whenever focus lands on a control rendering below 16px, so on a phone the
 * first tap into this form threw the visitor to roughly 1.3x and left them
 * pinching their way back out - on the one form the site exists to collect.
 * `-webkit-text-size-adjust` does not suppress it; only a 16px control does.
 *
 * Keyed on `pointer: coarse` rather than a width breakpoint because the zoom
 * follows the input device, not the viewport: a phone held in landscape is
 * wider than `sm` and still zooms.
 */
export const controlClasses =
  "w-full rounded-md border border-border-hairline-strong bg-surface-container-lowest px-space-md py-space-sm text-body-sm pointer-coarse:text-body-md text-on-surface " +
  "transition-colors placeholder:text-muted-gray focus:border-on-surface focus:outline-none " +
  "aria-[invalid=true]:border-error";

/**
 * Native `<select>` with the browser's own chevron replaced by ours.
 *
 * The control's `appearance` and the option list are both handled in
 * globals.css - a Tailwind `appearance-none` utility here would sit in a later
 * cascade layer and block the `base-select` opt-in that styles the popup.
 *
 * `data-lenis-prevent` keeps the smooth-scroll wrapper off the wheel while the
 * option list is open: the options are children of this element, so Lenis finds
 * the attribute on the event's path and lets the list scroll on its own.
 */
export function Select({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlClasses,
          "cursor-pointer pr-space-2xl",
          className
        )}
        data-lenis-prevent
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-space-md top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
      />
    </div>
  );
}

/**
 * Selection card used for the room-type step.
 *
 * A real radio input stays in the markup (visually hidden) so keyboard arrow
 * navigation and screen-reader grouping behave exactly as expected; the card is
 * only the visual layer.
 */
export function OptionCard({
  name,
  value,
  checked,
  onChange,
  onBlur,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-space-xs rounded-md border-2 p-space-sm transition-colors",
        checked
          ? "border-on-surface bg-surface-container-lowest"
          : "border-transparent bg-surface-container-low hover:bg-surface-container-high"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        onBlur={onBlur}
        className="size-4 shrink-0 accent-primary-container"
      />
      <span className="text-body-sm font-medium text-on-surface">{children}</span>
      {checked ? (
        <span
          aria-hidden
          className="ml-auto size-2.5 shrink-0 rounded-full bg-primary-container"
        />
      ) : null}
    </label>
  );
}
