/**
 * Single source of truth for everything that identifies the business.
 *
 * Nothing here is hard-coded to a value we cannot verify: contact details,
 * social handles, the address, opening hours and the founding year all come
 * from the environment, and each one degrades to "hidden" rather than to an
 * invented placeholder. Structured data in `src/lib/seo.ts` emits a field only
 * when its env var is filled in, so the site never publishes a local-business
 * claim the studio has not confirmed.
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://niscalafurniture.com";

/** Blank env vars arrive as "" - treat them as absent. */
function optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Finite number or null. Used for coordinates, which must never be guessed. */
function numeric(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** "Monday, Tuesday" -> ["Monday", "Tuesday"]. Empty env -> []. */
function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Matches "08:00" / "17:30". Anything else is treated as unset. */
function clockTime(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && /^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed) ? trimmed : null;
}

const foundedYearRaw = optional(process.env.NEXT_PUBLIC_FOUNDED_YEAR);
const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;

const latitude = numeric(process.env.NEXT_PUBLIC_LATITUDE);
const longitude = numeric(process.env.NEXT_PUBLIC_LONGITUDE);

const openingDays = list(process.env.NEXT_PUBLIC_OPENING_DAYS);
const opens = clockTime(process.env.NEXT_PUBLIC_OPENING_TIME);
const closes = clockTime(process.env.NEXT_PUBLIC_CLOSING_TIME);

const streetAddress = optional(process.env.NEXT_PUBLIC_STREET_ADDRESS);
const addressLocality = optional(process.env.NEXT_PUBLIC_ADDRESS_LOCALITY);
const addressRegion = optional(process.env.NEXT_PUBLIC_ADDRESS_REGION);
const postalCode = optional(process.env.NEXT_PUBLIC_ADDRESS_POSTAL_CODE);

export const site = {
  name: "Niscala Furniture",
  shortName: "Niscala",
  tagline: "Produsen Interior Custom",
  description:
    "Interior dan furniture custom yang dirancang berdasarkan ukuran ruang, kebutuhan, fungsi, dan karakter penggunanya. Dari konsultasi, survey, desain, produksi, hingga pemasangan.",
  /** Trimmed for SERP snippets, which cut off around 155-160 characters. */
  metaDescription:
    "Interior & furniture custom dirancang dari ukuran ruang dan kebutuhan Anda. Satu tim menangani konsultasi, survey, desain, produksi, sampai pemasangan.",
  url: rawSiteUrl.replace(/\/+$/, ""),
  locale: "id-ID",

  /** Digits only, international format. Used to build wa.me links. */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  email: optional(process.env.NEXT_PUBLIC_CONTACT_EMAIL),

  social: {
    instagram: optional(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    facebook: optional(process.env.NEXT_PUBLIC_FACEBOOK_URL),
    tiktok: optional(process.env.NEXT_PUBLIC_TIKTOK_URL),
    threads: optional(process.env.NEXT_PUBLIC_THREADS_URL),
  },

  /**
   * Google Business Profile / Maps listing. Treated as a `sameAs` identity
   * link, which is the strongest single local-SEO signal a site can emit -
   * but only once the studio has a real, claimed listing.
   */
  mapsUrl: optional(process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL),

  /**
   * Public workshop/showroom address. Structured data publishes `address`
   * only when at least the locality is filled in, so a half-configured
   * deployment never emits a broken PostalAddress.
   */
  address:
    streetAddress || addressLocality
      ? {
          streetAddress,
          addressLocality,
          addressRegion,
          postalCode,
          addressCountry: "ID",
        }
      : null,

  /** Coordinates are published only as a matched pair. */
  geo: latitude !== null && longitude !== null ? { latitude, longitude } : null,

  /** Fixed operating hours, or null while they are still irregular. */
  openingHours:
    openingDays.length > 0 && opens && closes
      ? { days: openingDays, opens, closes }
      : null,

  /**
   * Schema.org price band, e.g. "Rp" repeated or "Rp5.000.000 - Rp150.000.000".
   * Left blank until the studio approves a range it will actually honour.
   */
  priceRange: optional(process.env.NEXT_PUBLIC_PRICE_RANGE),

  /**
   * Null until the real year is supplied. Every "established" line in the UI
   * checks this first, so the site never claims a founding date we invented.
   */
  foundedYear:
    foundedYear && Number.isFinite(foundedYear) ? foundedYear : null,

  /**
   * Placeholder testimonials stay out of production unless this is switched on
   * after real quotes replace them.
   */
  showTestimonials: process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true",
} as const;

export type Site = typeof site;

/** True when a usable WhatsApp number has been configured. */
export function hasWhatsApp(): boolean {
  return /^\d{8,15}$/.test(site.whatsappNumber);
}
