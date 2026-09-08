/**
 * WhatsApp is the primary conversion channel (pasal 26).
 *
 * Every CTA that opens a chat goes through here so the prefilled message stays
 * consistent and each entry point is attributable.
 */

import { hasWhatsApp, site } from "@/lib/site";

/** Where the click came from. Mirrors the analytics event vocabulary. */
export type WhatsAppSource =
  | "hero"
  | "header"
  | "portfolio"
  | "project_detail"
  | "services"
  | "process"
  | "faq"
  | "survey_success"
  | "final_cta"
  | "footer"
  | "sticky_mobile"
  | "contact";

/** Human-readable label per source, appended to the message for context. */
const SOURCE_CONTEXT: Record<WhatsAppSource, string> = {
  hero: "Halaman utama",
  header: "Menu atas",
  portfolio: "Halaman portfolio",
  project_detail: "Detail proyek",
  services: "Halaman layanan",
  process: "Bagian alur kerja",
  faq: "Bagian FAQ",
  survey_success: "Formulir survey",
  final_cta: "Ajakan penutup",
  footer: "Footer",
  sticky_mobile: "Tombol cepat mobile",
  contact: "Halaman kontak",
};

const DEFAULT_MESSAGE = [
  `Halo ${site.name},`,
  "",
  "Saya ingin konsultasi mengenai kebutuhan interior/custom furniture.",
  "",
  "Nama:",
  "Lokasi:",
  "Kebutuhan:",
].join("\n");

export type WhatsAppLinkOptions = {
  source: WhatsAppSource;
  /** Replaces the default enquiry template entirely. */
  message?: string;
  /** Appended to the default template, e.g. the project being viewed. */
  context?: string;
};

/**
 * Build a wa.me deep link.
 *
 * Returns null when no number is configured, so callers can render a mailto or
 * hide the button instead of shipping a broken link.
 */
export function buildWhatsAppUrl({
  source,
  message,
  context,
}: WhatsAppLinkOptions): string | null {
  if (!hasWhatsApp()) return null;

  const lines = [message ?? DEFAULT_MESSAGE];

  if (context) {
    lines.push("", context);
  }

  lines.push("", `(via web - ${SOURCE_CONTEXT[source]})`);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}

/** A line is only rendered when the visitor actually answered it. */
function line(label: string, value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? `${label}${trimmed}` : null;
}

export type SurveyHandoffInput = {
  name: string;
  whatsapp: string;
  emergencyPhone?: string;
  province: string;
  city: string;
  district?: string;
  address: string;
  /** Already resolved: the free text when the visitor picked "Lainnya". */
  need: string;
  surveyDate: string;
  surveyTime: string;
  propertyType?: string;
  targetTimeline?: string;
  budgetRange?: string;
  notes?: string;
};

/**
 * Compose the survey hand-off message.
 *
 * The layout mirrors the studio's own "REQUEST SURVEY" note so an incoming
 * chat can be filed without retyping anything. Fields the form collects but
 * the note has no slot for are appended under "Detail Tambahan" instead of
 * being dropped.
 */
export function buildSurveyHandoffMessage(input: SurveyHandoffInput): string {
  const header = [
    `REQUEST SURVEY - ${site.name.toUpperCase()}`,
    "--------------------------------------------------",
    line("Nama : ", input.name),
    line("No. Telp/WhatsApp: ", input.whatsapp),
    line("No Darurat: ", input.emergencyPhone),
    line("Provinsi : ", input.province),
    line("Kota /Kabupaten : ", input.city),
    line("Kecamatan : ", input.district),
    line("Alamat: ", input.address),
    line("Kebutuhan : ", input.need),
    "",
    "Jadwal Survey",
    line("Hari/Tanggal: ", input.surveyDate),
    line("Jam: ", input.surveyTime),
  ];

  const extras = [
    line("Jenis Properti: ", input.propertyType),
    line("Target Mulai: ", input.targetTimeline),
    line("Perkiraan Budget: ", input.budgetRange),
    line("Catatan: ", input.notes),
  ].filter((entry): entry is string => entry !== null);

  const lines = header.filter((entry): entry is string => entry !== null);

  if (extras.length > 0) {
    lines.push("", "Detail Tambahan", ...extras);
  }

  return lines.join("\n");
}
