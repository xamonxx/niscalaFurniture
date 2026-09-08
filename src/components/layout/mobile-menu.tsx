"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { navLinks } from "@/components/layout/nav-links";
import { isActivePath } from "@/components/layout/is-active";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

/**
 * Mobile navigation.
 *
 * Radix Dialog supplies the focus trap, Escape handling, scroll lock and the
 * aria wiring; the styling stays entirely ours (pasal 6 & 24).
 */
export function MobileMenu({ inverse = false }: { inverse?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-md border shadow-hairline transition-[background-color,border-color,color,translate] duration-200 active:translate-y-px lg:hidden",
          inverse
            ? "border-border-hairline-dark bg-deep-black/20 text-inverse-on-surface backdrop-blur-xl hover:bg-pure-white/10"
            : "border-border-hairline bg-surface-container-lowest/80 text-on-surface backdrop-blur-xl hover:bg-surface-container"
        )}
        aria-label="Buka menu navigasi"
      >
        <Menu aria-hidden className="size-5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-deep-black/40 backdrop-blur-sm data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out" />
        <Dialog.Content className="fixed left-space-md right-space-md top-space-md z-[70] origin-top rounded-lg border border-border-hairline bg-surface/95 p-space-lg shadow-panel backdrop-blur-xl data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out focus:outline-none">
          <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
          <Dialog.Description className="sr-only">
            Tautan ke seluruh halaman Niscala Furniture.
          </Dialog.Description>

          <div className="flex items-center justify-between">
            <span className="text-label-md font-semibold text-on-surface">
              Niscala Furniture
            </span>
            <Dialog.Close
              className="inline-flex size-10 items-center justify-center rounded-md border border-border-hairline text-on-surface transition-colors hover:bg-surface-container"
              aria-label="Tutup menu"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <nav className="mt-space-lg">
            <ul className="space-y-space-2xs">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      // Close on navigation: the dialog would otherwise stay
                      // open behind the page the visitor just asked for.
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-md px-space-md py-space-sm text-label-lg transition-[background-color,color,translate] duration-200 active:translate-y-px",
                        active
                          ? "bg-surface-container-lowest font-semibold text-on-surface shadow-hairline"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      )}
                    >
                      {link.label}
                      {active ? (
                        <span
                          aria-hidden
                          className="size-2 rounded-xs bg-primary-container"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-space-lg grid gap-space-xs">
            <WhatsAppCta source="header" className="w-full">
              Konsultasi via WhatsApp
            </WhatsAppCta>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
