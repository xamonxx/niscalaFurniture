import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { navLinks } from "@/components/layout/nav-links";
import { SocialLinks } from "@/components/layout/social-links";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { site } from "@/lib/site";
import { servedLocations } from "@/data/projects";

/**
 * A row in one of the footer lists.
 *
 * Real height rather than the `tap-safe` pseudo-element: these rows sit 8px
 * and 4px apart, so an invisible 44px slab on each would overlap the rows
 * above and below it and the topmost one would swallow taps meant for its
 * neighbours. Growing the rows is the only version that works, so on touch
 * the lists hand their spacing over to the rows themselves.
 *
 * The inline `Kebijakan Privasi` link in the bottom bar is deliberately left
 * out: it sits inside a sentence, where a block-level 44px row would break
 * the line it belongs to.
 */
const footerRowClasses =
  "transition-colors hover:text-on-surface pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center";

export function Footer() {
  const year = new Date().getFullYear();

  // Only the first handful of towns, so the line stays a proof point rather
  // than a wall of place names.
  const locationSample = servedLocations.slice(0, 8);

  return (
    <footer className="border-t border-border-hairline bg-surface-container-low">
      <div className="container-editorial py-space-4xl">
        <div className="grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          <div className="space-y-space-md lg:col-span-5 lg:pr-space-xl">
            <BrandMark tone="dark" size="footer" />
            <p className="max-w-md text-body-sm leading-relaxed text-on-surface-variant">
              {site.description}
            </p>
            {site.foundedYear ? (
              <span className="block text-label-eyebrow uppercase text-muted-gray">
                Berdiri sejak {site.foundedYear} • Studio Interior & Furniture Custom
              </span>
            ) : (
              <span className="block text-label-eyebrow uppercase text-muted-gray">
                Studio Interior & Furniture Custom
              </span>
            )}
          </div>

          <nav aria-label="Navigasi footer" className="space-y-space-md lg:col-span-2">
            <h2 className="text-label-eyebrow uppercase text-muted-gray">Navigasi</h2>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant pointer-coarse:space-y-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={footerRowClasses}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/survey"
                  className={footerRowClasses}
                >
                  Ajukan Survey
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-space-lg lg:col-span-2">
            <div className="space-y-space-sm">
              <h2 className="text-label-eyebrow uppercase text-muted-gray">Social</h2>
              <SocialLinks />
            </div>

            <div className="space-y-space-2xs">
              <h2 className="text-label-eyebrow uppercase text-muted-gray">
                Kontak Langsung
              </h2>
              <ul className="space-y-space-2xs text-body-sm text-on-surface-variant pointer-coarse:space-y-0">
                <li>
                  <Link
                    href="/contact"
                    className={footerRowClasses}
                  >
                    Hubungi kami
                  </Link>
                </li>
                {site.email ? (
                  <li>
                    <a
                      href={`mailto:${site.email}`}
                      className={footerRowClasses}
                    >
                      {site.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="space-y-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-panel lg:col-span-3">
            <span className="block text-label-eyebrow uppercase text-primary">
              Mulai Diskusi
            </span>
            <h2 className="text-headline-sm font-semibold text-on-surface">
              Mulai Proyek Anda
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Ceritakan ruang yang ingin Anda kerjakan. Konsultasi awal dan estimasi
              tidak dikenakan biaya.
            </p>
            <WhatsAppCta source="footer" size="sm" className="w-full">
              Reservasi Konsultasi
            </WhatsAppCta>
          </div>
        </div>

        {locationSample.length > 0 ? (
          <p className="mt-space-3xl border-t border-border-hairline pt-space-lg text-body-sm text-muted-gray">
            <span className="text-on-surface-variant">Pernah dikerjakan di:</span>{" "}
            {locationSample.join(", ")}
            {servedLocations.length > locationSample.length ? ", dan kota lainnya" : ""}
            . Melayani pemesanan dari seluruh Indonesia.
          </p>
        ) : null}

        <div className="mt-space-lg flex flex-col items-center justify-between gap-space-sm text-body-sm text-muted-gray sm:flex-row">
          <p className="flex flex-wrap items-center gap-x-space-sm gap-y-space-2xs">
            <span>
              © {year} {site.name}. All Rights Reserved.
            </span>
            <span aria-hidden>•</span>
            <Link
              href="/privacy"
              className="transition-colors hover:text-on-surface"
            >
              Kebijakan Privasi
            </Link>
          </p>
          <p className="flex items-center gap-space-md text-label-eyebrow uppercase">
            <span>Interior Custom</span>
            <span aria-hidden>•</span>
            <span>Furniture Custom</span>
            <span aria-hidden>•</span>
            <span>Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
