/**
 * Shared domain types.
 *
 * Content lives in `src/data/*` as plain typed objects rather than inside JSX,
 * so the whole site stays ready to move behind a CMS without touching the
 * components that render it (pasal 30).
 */

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */

export type Orientation = "portrait" | "landscape" | "square";

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  orientation: Orientation;
  /** Human-readable alt text, derived from the project it belongs to. */
  alt: string;
  /**
   * A 16px-wide blurred stand-in, inlined as a data URI by
   * `npm run prepare:blur`.
   *
   * Optional because a handful of images are composed in code rather than
   * published by the pipeline, and those have nothing to blur.
   */
  blurDataURL?: string;
};

export type ProjectCategory = {
  slug: string;
  /** Full name, used as a page heading. */
  name: string;
  /** Compact name, used in filter pills and card eyebrows. */
  short: string;
  /** Search-facing title, phrased the way people actually query. */
  seoTitle: string;
  /** H1 for the category page. */
  heading: string;
  /** One-line description for the category listing and metadata. */
  description: string;
};

export type Project = {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  categoryShort: string;
  /** Client name as recorded in the studio archive. Null for style galleries. */
  client: string | null;
  /**
   * The development, estate or tower the work sits in, as printed on the
   * interior deck's own page: "Podomoro Park", "BSD City". Distinct from
   * `client` (the person who commissioned it) and from `location` (the town).
   * Null for archive projects, which are recorded by client instead.
   */
  venue: string | null;
  location: string | null;
  /** Finishing style, e.g. "Modern", "Semi Klasik". */
  style: string | null;
  year: number | null;
  coverImage: string;
  coverOrientation: Orientation;
  /** Blur placeholder for `coverImage`, lifted from the matching gallery frame. */
  coverBlurDataURL?: string;
  gallery: ProjectImage[];
  /** Short editorial caption shown on the detail page. */
  description: string;
  /**
   * Meta-description variant of `description`, padded to the 120-155 character
   * band a SERP snippet actually shows. Kept separate so the on-page caption
   * stays as tight as the layout wants it.
   */
  seoDescription: string;
};

/* ------------------------------------------------------------------ */
/* Marketing content                                                   */
/* ------------------------------------------------------------------ */

export type Service = {
  slug: string;
  title: string;
  description: string;
  /** Longer copy for the dedicated services page. */
  detail: string;
  icon: LucideIcon;
  /** Portfolio category this service showcases, when one exists. */
  categorySlug?: string;
  ctaLabel: string;
};

export type ProblemCard = {
  index: string;
  title: string;
  body: string;
  image?: string;
};

export type ApproachCard = {
  index: string;
  title: string;
  body: string;
};

export type ProcessStep = {
  index: string;
  title: string;
  body: string;
};

export type TimelinePhase = {
  index: string;
  title: string;
  duration: string;
  /** Qualifier shown next to the duration, e.g. "tergantung jumlah unit". */
  note?: string;
  body: string;
  /** The long production phase is emphasised in the layout. */
  emphasis?: boolean;
};

export type MaterialPoint = {
  title: string;
  body: string;
};

export type Guarantee = {
  index: number;
  title: string;
  body: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  context: string;
  /**
   * True while the entry is generated sample copy rather than a real client
   * quote. Placeholder testimonials are never rendered in production unless
   * NEXT_PUBLIC_SHOW_TESTIMONIALS is explicitly turned on.
   */
  isPlaceholder: boolean;
};

export type KnowledgeArticle = {
  slug: string;
  category: string;
  title: string;
  /**
   * Shorter title for the <title> tag, used when the display headline would
   * blow past the ~60 characters a SERP shows once the brand suffix is added.
   * Falls back to `title`.
   */
  seoTitle?: string;
  summary: string;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  publishedAt: string;
  /**
   * Set only when the article has genuinely been revised. Drives the sitemap
   * `lastmod` and the `dateModified` in Article structured data - both of which
   * are worthless the moment they stop being true.
   */
  updatedAt?: string;
  /**
   * Publication status: 'aktif' (published publicly) or 'tidak_aktif' (draft/hidden).
   * Defaults to 'aktif' if omitted.
   */
  status?: "aktif" | "tidak_aktif";
  /** Body rendered as a sequence of typed blocks - no HTML strings. */
  body: KnowledgeBlock[];
};

export type KnowledgeBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; url: string; videoId?: string; title?: string };
