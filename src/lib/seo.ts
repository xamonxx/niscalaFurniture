import type { Metadata } from "next";

import { servedLocations } from "@/data/projects";
import { site } from "@/lib/site";

/**
 * Metadata + structured-data helpers (pasal 28).
 *
 * Every page composes its metadata through `buildMetadata` so canonical URLs,
 * Open Graph and Twitter cards stay consistent instead of being re-typed per
 * route. Structured data is assembled here too, around one shared entity id
 * (`{site.url}/#organisation`) that every other node references - so search
 * engines read one business, not a dozen unrelated snippets.
 */

/** Canonical absolute URL for an app-relative path. */
export function absoluteUrl(path = "/"): string {
  if (path === "/") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Stable @id values, so every node in every page graph points at one entity. */
export const ORGANISATION_ID = `${site.url}/#organisation`;
export const WEBSITE_ID = `${site.url}/#website`;

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  /** ISO date. Emitted as `article:published_time`. */
  publishedTime?: string;
  /** ISO date. Emitted as `article:modified_time`. */
  modifiedTime?: string;
  /** Utility pages that should stay out of the index. */
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? "/opengraph-image";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: site.name,
      title,
      description,
      locale: "id_ID",
      images: [{ url: ogImage }],
      ...(type === "article"
        ? { publishedTime, modifiedTime, authors: [site.name] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    /**
     * `max-image-preview: large` is what lets Google use the project
     * photography as a full-width thumbnail; without it a portfolio site is
     * shown with a postage stamp or nothing at all.
     */
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data                                                     */
/* ------------------------------------------------------------------ */

/**
 * The business entity.
 *
 * Deliberately omits aggregateRating and review: the site has no verified
 * review corpus, and inventing one would be both dishonest and a search
 * guideline violation. Address, coordinates, opening hours and price range are
 * emitted only when the matching env vars are filled in - see `src/lib/site.ts`.
 */
export function organisationJsonLd() {
  const sameAs = [
    site.social.instagram,
    site.social.facebook,
    site.social.tiktok,
    site.social.threads,
    site.mapsUrl,
  ].filter((value): value is string => Boolean(value));

  /**
   * Real delivery records double as service-area proof. Indonesia stays first
   * so the national claim is not lost behind a list of Bandung suburbs.
   */
  const areaServed = [
    { "@type": "Country", name: "Indonesia" },
    ...servedLocations.map((name) => ({ "@type": "Place", name })),
  ];

  const contactPoint = [
    site.whatsappNumber
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: `+${site.whatsappNumber}`,
          url: `https://wa.me/${site.whatsappNumber}`,
          availableLanguage: ["id-ID"],
          areaServed: "ID",
        }
      : null,
    site.email
      ? {
          "@type": "ContactPoint",
          contactType: "sales",
          email: site.email,
          availableLanguage: ["id-ID"],
          areaServed: "ID",
        }
      : null,
  ].filter((value): value is NonNullable<typeof value> => value !== null);

  return {
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": ORGANISATION_ID,
    name: site.name,
    alternateName: site.shortName,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    image: `${site.url}/logo/niscala-wordmark-dark.png`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/logo/niscala-wordmark-dark.png`,
    },
    ...(site.foundedYear ? { foundingDate: String(site.foundedYear) } : {}),
    ...(site.email ? { email: site.email } : {}),
    ...(site.whatsappNumber ? { telephone: `+${site.whatsappNumber}` } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(site.address.streetAddress
              ? { streetAddress: site.address.streetAddress }
              : {}),
            ...(site.address.addressLocality
              ? { addressLocality: site.address.addressLocality }
              : {}),
            ...(site.address.addressRegion
              ? { addressRegion: site.address.addressRegion }
              : {}),
            ...(site.address.postalCode
              ? { postalCode: site.address.postalCode }
              : {}),
            addressCountry: site.address.addressCountry,
          },
        }
      : {}),
    ...(site.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: site.geo.latitude,
            longitude: site.geo.longitude,
          },
        }
      : {}),
    ...(site.openingHours
      ? {
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: site.openingHours.days,
              opens: site.openingHours.opens,
              closes: site.openingHours.closes,
            },
          ],
        }
      : {}),
    ...(site.priceRange ? { priceRange: site.priceRange } : {}),
    currenciesAccepted: "IDR",
    areaServed,
    knowsLanguage: ["id-ID"],
  };
}

/**
 * The site entity.
 *
 * No `SearchAction`: the site has no internal search endpoint, and claiming
 * one would advertise a URL template that 404s.
 */
export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.metaDescription,
    inLanguage: "id-ID",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export type BreadcrumbEntry = {
  name: string;
  /** App-relative path, e.g. "/portfolio". */
  path: string;
};

/**
 * Breadcrumb trail for a nested page.
 *
 * "Beranda" is prepended automatically, and the current page is included as the
 * last item with its own URL - which is what Google expects even when the trail
 * is not drawn on screen.
 */
export function breadcrumbJsonLd(trail: BreadcrumbEntry[]) {
  const items = [{ name: "Beranda", path: "/" }, ...trail];
  const current = items[items.length - 1];

  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(current.path)}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** A page node tied to the site and business entities. */
export function webPageJsonLd({
  path,
  name,
  description,
  type = "WebPage",
  breadcrumb = false,
  primaryImage,
  datePublished,
  dateModified,
}: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";
  /** Set when the same graph also carries a BreadcrumbList for this page. */
  breadcrumb?: boolean;
  /** App-relative image path. */
  primaryImage?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const url = absoluteUrl(path);

  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "id-ID",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANISATION_ID },
    ...(breadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(primaryImage
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: absoluteUrl(primaryImage),
          },
        }
      : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

/** Wrap nodes into a single connected graph document. */
export function jsonLdGraph(...nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

/** Serialise structured data for a `<script type="application/ld+json">` tag. */
export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
