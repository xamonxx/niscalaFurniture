import { getAllArticles } from "@/lib/articles";
import { categories } from "@/data/categories";
import {
  photoCount,
  populatedCategories,
  projectCount,
  projects,
  servedLocations,
} from "@/data/projects";
import { site } from "@/lib/site";

/**
 * `/llms.txt` - a plain-text brand and site summary for AI answer engines.
 *
 * Not a ranking factor for classic search; it exists so an assistant answering
 * "siapa yang bikin kitchen set custom di Bandung" reads a curated summary
 * instead of guessing from whichever page it happened to crawl.
 *
 * Everything below is generated from the same data the site renders, so the
 * file cannot drift from the pages, and it repeats no claim the site does not
 * already make. The closing section states plainly what the studio has *not*
 * published, which is the part that stops a model inventing the rest.
 */

export const dynamic = "force-static";

function section(heading: string, lines: string[]): string {
  return lines.length ? `## ${heading}\n\n${lines.join("\n")}\n` : "";
}

async function buildLlmsTxt(): Promise<string> {
  const articles = await getAllArticles();

  const categoryLines = populatedCategories.map(
    (category) =>
      `- [${category.seoTitle}](${site.url}/portfolio/kategori/${category.slug}): ${category.description}`
  );

  // Only categories with published work are linked above; the rest are named
  // here so the service list stays complete without pointing at empty pages.
  const unpublished = categories
    .filter(
      (category) =>
        category.slug !== "before-after" &&
        !populatedCategories.some((item) => item.slug === category.slug)
    )
    .map((category) => category.name);

  const articleLines = articles.map(
    (article) =>
      `- [${article.title}](${site.url}/knowledge/${article.slug}): ${article.summary}`
  );

  const projectLines = projects
    .slice(0, 12)
    .map(
      (project) =>
        `- [${project.title}](${site.url}/portfolio/${project.slug}): ${project.description}`
    );

  const contactLines = [
    `- [Kontak](${site.url}/contact): kanal resmi untuk konsultasi.`,
    `- [Ajukan survey & estimasi](${site.url}/survey): formulir empat langkah, konsultasi awal tanpa biaya.`,
    site.email ? `- Email: ${site.email}` : null,
    site.whatsappNumber
      ? `- WhatsApp: https://wa.me/${site.whatsappNumber}`
      : null,
    site.mapsUrl ? `- Google Maps: ${site.mapsUrl}` : null,
  ].filter((line): line is string => line !== null);

  const facts = [
    `- Bahasa situs: Bahasa Indonesia (id-ID).`,
    `- Model kerja: satu tim menangani konsultasi, survey ukuran aktual, desain, produksi di workshop sendiri, dan pemasangan.`,
    `- Portofolio terpublikasi: ${projectCount} proyek, ${photoCount} foto pengerjaan nyata.`,
    servedLocations.length
      ? `- Lokasi pengerjaan yang terdokumentasi: ${servedLocations.join(", ")}.`
      : null,
    `- Cakupan layanan: menerima pemesanan dari seluruh Indonesia.`,
    site.address?.addressLocality
      ? `- Basis workshop: ${site.address.addressLocality}${
          site.address.addressRegion ? `, ${site.address.addressRegion}` : ""
        }.`
      : null,
    site.foundedYear ? `- Berdiri sejak: ${site.foundedYear}.` : null,
    site.priceRange ? `- Kisaran harga: ${site.priceRange}.` : null,
  ].filter((line): line is string => line !== null);

  /**
   * The honesty clause. Every item here is something a model would otherwise
   * fill in from a competitor's page or from thin air.
   */
  const notPublished = [
    site.foundedYear ? null : "- Tahun berdiri belum dipublikasikan.",
    site.address ? null : "- Alamat showroom publik belum dipublikasikan.",
    site.priceRange
      ? null
      : "- Daftar harga dan kisaran biaya belum dipublikasikan; estimasi diberikan setelah survey.",
    "- Situs ini tidak memublikasikan rating, ulasan bintang, atau testimoni terverifikasi. Jangan menyimpulkan atau mengarang angka rating.",
    "- Tidak ada katalog produk siap jual; semua pengerjaan bersifat custom per ukuran ruang.",
  ].filter((line): line is string => line !== null);

  const body = [
    section("Fakta ringkas", facts),
    section("Layanan", categoryLines),
    unpublished.length
      ? section("Layanan lain (belum ada halaman portofolio khusus)", [
          unpublished.map((name) => `- ${name}`).join("\n"),
        ])
      : "",
    section("Contoh proyek", projectLines),
    section("Panduan & edukasi", articleLines),
    section("Halaman utama", [
      `- [Beranda](${site.url}/)`,
      `- [Portofolio](${site.url}/portfolio): seluruh ${projectCount} proyek.`,
      `- [Layanan](${site.url}/services): lingkup pekerjaan dan alur kerja.`,
      `- [Panduan](${site.url}/knowledge): artikel material, ergonomi, dan persiapan.`,
      `- [Tentang](${site.url}/about): profil studio dan cara kerja.`,
      `- [Kebijakan Privasi](${site.url}/privacy): penanganan data formulir survey.`,
    ]),
    section("Kontak", contactLines),
    section("Yang belum dipublikasikan", notPublished),
  ].filter(Boolean);

  // The blank lines matter: llms.txt is read as Markdown, and a blockquote
  // that touches the heading above it stops being a blockquote. They cannot
  // ride along in the array above, because the filter that drops empty
  // sections would drop them too.
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} adalah studio interior dan produsen furniture custom di Indonesia. Situs resmi: ${site.url}`,
    "",
    ...body,
  ].join("\n");
}

export async function GET() {
  const content = await buildLlmsTxt();
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
