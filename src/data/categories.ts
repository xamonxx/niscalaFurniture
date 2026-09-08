import type { ProjectCategory } from "@/types";

/**
 * Portfolio categories, mirroring the real folder structure of the studio
 * archive. "Lemari Bawah Tangga" is the studio's largest specialism and gets
 * its own category even though the original prototype had no slot for it.
 *
 * `seoTitle` is written per category rather than derived by appending "Custom"
 * to `name` - that produced titles like "Custom Wardrobe & Closet Custom".
 * These are phrased the way people actually search in Indonesian.
 */
export const categories: ProjectCategory[] = [
  {
    slug: "kitchen-set",
    name: "Kitchen Set & Pantry",
    short: "Kitchen Set",
    seoTitle: "Kitchen Set Custom",
    heading: "Kitchen set yang mengikuti alur memasak Anda.",
    description:
      "Dapur basah dan kering dengan ergonomi segitiga kerja, material tahan lembab, dan hardware tahan beban.",
  },
  {
    slug: "wardrobe",
    name: "Lemari Pakaian Custom",
    short: "Lemari Pakaian",
    seoTitle: "Lemari Pakaian & Wardrobe Custom",
    heading: "Lemari pakaian yang dibagi sesuai isinya.",
    description:
      "Lemari pakaian built-in, walk-in closet, dan meja rias terintegrasi dengan pembagian kompartemen sesuai isi.",
  },
  {
    slug: "lemari-bawah-tangga",
    name: "Lemari Bawah Tangga",
    short: "Bawah Tangga",
    seoTitle: "Lemari Bawah Tangga Custom",
    heading: "Ruang bawah tangga yang akhirnya terpakai.",
    description:
      "Ruang mati di bawah tangga diubah menjadi penyimpanan tertutup yang mengikuti kemiringan anak tangga.",
  },
  {
    slug: "tv-backdrop",
    name: "Backdrop TV & Rak Televisi",
    short: "TV Backdrop",
    seoTitle: "Backdrop TV & Rak Custom",
    heading: "Backdrop TV tanpa kabel yang terlihat.",
    description:
      "Focal point ruang keluarga dengan wall paneling, kabinet floating, dan jalur kabel yang tersembunyi rapi.",
  },
  {
    slug: "bedroom",
    name: "Interior Kamar Tidur",
    short: "Kamar Tidur",
    seoTitle: "Interior Kamar Tidur Custom",
    heading: "Kamar tidur dengan penyimpanan yang tidak memakan lantai.",
    description:
      "Ranjang platform dengan penyimpanan bawah kasur, headboard bertekstur, dan meja kerja hemat ruang.",
  },
  {
    slug: "apartemen",
    name: "Interior Apartemen",
    short: "Apartemen",
    seoTitle: "Interior Apartemen Custom",
    heading: "Unit apartemen yang terasa lebih lapang.",
    description:
      "Solusi ruang terbatas untuk unit apartemen: multifungsi, ringkas, dan tetap lapang secara visual.",
  },
  {
    slug: "interior-komersial",
    name: "Interior Toko & Komersial",
    short: "Komersial",
    seoTitle: "Interior Toko & Kantor Custom",
    heading: "Interior komersial yang tahan dipakai setiap hari.",
    description:
      "Display toko, counter, dan lemari arsip custom dengan durabilitas untuk pemakaian komersial harian.",
  },
];

export function categoryBySlug(slug: string): ProjectCategory | undefined {
  return categories.find((category) => category.slug === slug);
}
