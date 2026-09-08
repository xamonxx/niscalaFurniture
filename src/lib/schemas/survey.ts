import { z } from "zod";

/**
 * Survey lead schema (pasal 8 & 27).
 *
 * The same schema validates the browser form and the Server Action, so the
 * rules can never drift apart between the two.
 */

/** Escape hatch for needs that do not fit the seven fixed categories. */
export const OTHER_PROJECT_TYPE = "Lainnya (tulis sendiri)";

export const PROJECT_TYPES = [
  "Kitchen Set & Pantry",
  "Lemari Pakaian Custom",
  "Lemari Bawah Tangga",
  "Backdrop TV & Rak Televisi",
  "Interior Kamar Tidur",
  "Interior Rumah / Apartemen",
  "Interior Toko / Kantor",
  OTHER_PROJECT_TYPE,
] as const;

/** Shown when "Lainnya" is picked but the free-text box is left empty. */
export const OTHER_PROJECT_TYPE_REQUIRED = "Tuliskan kebutuhan Anda.";

export const PROPERTY_TYPES = [
  "Rumah",
  "Kantor",
  "Sekolah/Kampus",
  "Penginapan/Hotel",
  "Restoran/Cafe",
  "Klinik/Rumah Sakit",
  "Sedang Pembangunan",
] as const;

export const TARGET_TIMELINES = [
  "Secepatnya (< 1 bulan)",
  "1-3 bulan lagi",
  "3-6 bulan lagi",
  "Masih tahap perencanaan",
] as const;

export const BUDGET_RANGES = [
  "Belum ditentukan",
  "< Rp 25 juta",
  "Rp 25 - 50 juta",
  "Rp 50 - 100 juta",
  "Rp 100 - 250 juta",
  "> Rp 250 juta",
] as const;

export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Banten",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
] as const;

/**
 * Global WhatsApp/contact numbers.
 *
 * Visitors may type an international number with spaces, dashes, dots, or
 * parentheses. We validate the normalized digit count against the global phone
 * range instead of forcing an Indonesian prefix.
 */
const globalPhoneCharactersPattern = /^\+?[0-9\s().-]+$/;

function isGlobalPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return (
    globalPhoneCharactersPattern.test(trimmed) &&
    digits.length >= 8 &&
    digits.length <= 15
  );
}

/**
 * Today's date in Asia/Jakarta as `YYYY-MM-DD`.
 *
 * Pinned to the studio's timezone so the "no past date" rule gives the same
 * answer in the browser and on a server that runs in UTC.
 */
export function jakartaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const surveySchema = z.object({
  projectType: z.enum(PROJECT_TYPES, {
    message: "Pilih salah satu kategori ruangan.",
  }),
  /** Only meaningful when `projectType` is OTHER_PROJECT_TYPE. */
  projectTypeOther: z
    .string()
    .trim()
    .max(120, "Deskripsi kebutuhan terlalu panjang.")
    .optional()
    .or(z.literal("")),
  province: z.enum(PROVINCES, { message: "Pilih provinsi lokasi proyek." }),
  city: z
    .string()
    .trim()
    .min(2, "Tuliskan kota atau kabupaten lokasi proyek.")
    .max(80, "Nama kota terlalu panjang."),
  district: z
    .string()
    .trim()
    .max(80, "Nama kecamatan terlalu panjang.")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(10, "Tuliskan alamat lengkap agar tim survey mudah menemukannya.")
    .max(250, "Alamat terlalu panjang."),
  propertyType: z.enum(PROPERTY_TYPES, {
    message: "Pilih jenis properti Anda.",
  }),
  targetTimeline: z.enum(TARGET_TIMELINES, {
    message: "Pilih perkiraan waktu mulai.",
  }),
  budgetRange: z.enum(BUDGET_RANGES).optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Catatan maksimal 1000 karakter.")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(2, "Tuliskan nama lengkap Anda.")
    .max(80, "Nama terlalu panjang."),
  whatsapp: z
    .string()
    .trim()
    .refine(isGlobalPhoneNumber, {
      message: "Nomor WhatsApp tidak valid. Contoh: +628123456789.",
    }),
  emergencyPhone: z
    .union([
      z
        .string()
        .trim()
        .refine(isGlobalPhoneNumber, {
          message: "Nomor darurat tidak valid. Contoh: +628123456789.",
        }),
      z.literal(""),
    ])
    .optional(),
  surveyDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal survey.")
    .refine((value) => value >= jakartaToday(), {
      message: "Tanggal survey tidak boleh di masa lalu.",
    }),
  surveyTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Pilih jam survey."),
  // Modelled as a boolean with a refinement rather than `z.literal(true)`, so
  // the form's input type stays `boolean` and the checkbox can start unticked.
  consent: z.boolean().refine((value) => value, {
    message: "Persetujuan diperlukan untuk mengirim data.",
  }),
}).superRefine((value, ctx) => {
  // "Lainnya" is only a real answer once the visitor has typed what they need.
  if (value.projectType === OTHER_PROJECT_TYPE && !value.projectTypeOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["projectTypeOther"],
      message: OTHER_PROJECT_TYPE_REQUIRED,
    });
  }
});

export type SurveyInput = z.input<typeof surveySchema>;
export type SurveyLead = z.output<typeof surveySchema>;

/** Field groups per wizard step, used to validate one step at a time. */
export const SURVEY_STEPS = [
  {
    id: "ruangan",
    label: "Ruangan",
    fields: ["projectType", "projectTypeOther"],
  },
  {
    id: "lokasi",
    label: "Lokasi",
    fields: ["province", "city", "district", "address"],
  },
  {
    id: "properti",
    label: "Properti",
    fields: ["propertyType", "targetTimeline", "budgetRange", "notes"],
  },
  {
    id: "kontak",
    label: "Kontak",
    fields: [
      "name",
      "whatsapp",
      "emergencyPhone",
      "surveyDate",
      "surveyTime",
      "consent",
    ],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  fields: ReadonlyArray<keyof SurveyInput>;
}>;

/** Normalise a visitor-entered phone number into digits only. */
export function normaliseWhatsApp(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits;
}

/** "2026-09-05" -> "Sabtu 5 September 2026" (no comma, matching the WA template). */
export function formatSurveyDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;

  // Built in UTC and read back in UTC so the day never shifts by a timezone.
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(new Date(Date.UTC(year, month - 1, day)))
    .replace(",", "");
}

/** "12:00" -> "12.00 WIB". */
export function formatSurveyTime(value: string): string {
  return `${value.replace(":", ".")} WIB`;
}

/** The category the visitor actually meant, resolving the "Lainnya" free text. */
export function resolveProjectNeed(input: {
  projectType?: string;
  projectTypeOther?: string;
}): string {
  if (input.projectType === OTHER_PROJECT_TYPE) {
    return input.projectTypeOther?.trim() || OTHER_PROJECT_TYPE;
  }
  return input.projectType ?? "";
}
