import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Ruler,
  Cpu,
  Clock,
  ChevronRight,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { customFurnitureCategories } from "@/data/custom-furniture";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Furniture Custom Bandung & Jabodetabek - Workshop Presisi Niscala Furniture",
  description:
    "Solusi pembuatan kitchen set custom, lemari pakaian custom, lemari bawah tangga, backdrop TV, dan furniture kamar tidur. Bahan Plywood tebal & HMR anti lembab, finishing HPL rapi dengan mesin edging.",
  path: "/furniture-custom",
});

function furnitureCustomJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/furniture-custom",
      name: "Furniture Custom Niscala",
      description:
        "Workshop spesialis pembuatan furniture custom: kitchen set, lemari pakaian, backdrop TV, lemari bawah tangga, dan interior kamar.",
      breadcrumb: true,
    }),
    {
      "@type": "Service",
      "@id": `${absoluteUrl("/furniture-custom")}#service`,
      name: "Pembuatan Furniture Custom",
      serviceType: "Custom Interior & Cabinetry",
      provider: { "@id": ORGANISATION_ID },
      description:
        "Layanan produksi furniture custom terpasang presisi dengan bahan Plywood & HMR pilihan, finishing HPL atau Duco, dan fitting slow-motion.",
      url: absoluteUrl("/furniture-custom"),
    },
    breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: "Furniture Custom", path: "/furniture-custom" },
    ])
  );
}

export default function CustomFurnitureIndexPage() {
  const totalReferences = customFurnitureCategories.reduce(
    (acc, cat) => acc + cat.references.length,
    0
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(furnitureCustomJsonLd())}
      />

      <PageHeader
        eyebrow="Solusi Tata Ruang Presisi"
        title="Furniture Custom Berkualitas: Desain Eksklusif, Presisi Milimeter & Bebas Rayap"
        lead={`Jelajahi lebih dari ${totalReferences} referensi desain interior custom terkurasi. Dibuat langsung di workshop kami dengan material Plywood padat & HMR tahan lembab, fitting slow-motion, serta garansi resmi.`}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-border-hairline bg-surface-container-lowest/50 py-3"
      >
        <div className="container-editorial flex items-center gap-1.5 text-xs text-muted-gray">
          <Link href="/" className="hover:text-on-surface transition-colors">
            Beranda
          </Link>
          <ChevronRight className="size-3.5 text-muted-gray/60" />
          <span className="font-semibold text-on-surface">
            Furniture Custom
          </span>
        </div>
      </nav>

      {/* 5 Main Categories Showcase Grid */}
      <section
        aria-labelledby="categories-heading"
        className="bg-surface py-space-4xl"
      >
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Eyebrow>Katalog Kategori</Eyebrow>
              <h2
                id="categories-heading"
                className="mt-1.5 text-headline-sm sm:text-headline-md text-on-surface"
              >
                Pilih Kategori Kebutuhan Hunian Anda
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
              Setiap kategori dilengkapi minimal 20 referensi desain foto riil & render detail
              yang siap dikustomisasi sesuai denah ruangan Anda.
            </p>
          </div>

          <div className="space-y-10">
            {customFurnitureCategories.map((cat, idx) => {
              const coverImg = cat.references[0];
              const previewItems = cat.references.slice(1, 5);
              const isEven = idx % 2 === 1;

              return (
                <div
                  key={cat.slug}
                  className="rounded-2xl border border-border-hairline bg-surface-container-lowest overflow-hidden shadow-hairline hover:shadow-panel transition-shadow duration-200"
                >
                  <div
                    className={`grid lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 ${
                      isEven ? "lg:grid-flow-dense" : ""
                    }`}
                  >
                    {/* Left/Right Text Details */}
                    <div
                      className={`lg:col-span-6 space-y-4 ${
                        isEven ? "lg:col-start-7" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-container/15 text-primary">
                          Kategori 0{idx + 1}
                        </span>
                        <span className="text-xs text-muted-gray">
                          {cat.references.length} Referensi Desain
                        </span>
                      </div>

                      <h3 className="text-headline-sm sm:text-headline-md text-on-surface">
                        {cat.name}
                      </h3>

                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {cat.lead}
                      </p>

                      {/* Highlights bullets */}
                      <ul className="grid sm:grid-cols-2 gap-2.5 pt-2">
                        {cat.highlights.map((hl) => (
                          <li
                            key={hl.title}
                            className="flex items-start gap-2 text-xs text-on-surface-variant"
                          >
                            <CheckCircle2 className="size-4 text-primary-container shrink-0 mt-0.5" />
                            <span className="font-medium text-on-surface">
                              {hl.title}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Links */}
                      <div className="flex flex-wrap items-center gap-3 pt-4">
                        <Link
                          href={`/furniture-custom/${cat.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-inverse-on-surface font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity"
                        >
                          <span>Lihat Seluruh {cat.references.length} Desain</span>
                          <ArrowRight className="size-4" />
                        </Link>
                        <WhatsAppCta
                          source="services"
                          context={`Kategori: ${cat.name}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-hairline text-on-surface text-xs sm:text-sm font-medium hover:bg-surface-container-low transition-colors"
                        >
                          <span>Tanya Estimasi</span>
                        </WhatsAppCta>
                      </div>
                    </div>

                    {/* Right/Left Image Gallery Preview */}
                    <div
                      className={`lg:col-span-6 ${
                        isEven ? "lg:col-start-1" : ""
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {/* Main Big Feature Image */}
                        <div className="relative col-span-2 aspect-[16/9] rounded-xl overflow-hidden bg-surface-container-low">
                          {coverImg && (
                            <Image
                              src={coverImg.src}
                              alt={coverImg.alt}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-deep-black/70 backdrop-blur-sm text-pure-white text-[11px] font-medium">
                            {coverImg.title}
                          </div>
                        </div>

                        {/* Sub Thumbnails */}
                        {previewItems.slice(0, 2).map((thumb) => (
                          <div
                            key={thumb.id}
                            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-low"
                          >
                            <Image
                              src={thumb.src}
                              alt={thumb.alt}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 to-transparent flex items-end p-2">
                              <span className="text-[10px] text-pure-white font-medium line-clamp-1">
                                {thumb.style}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Advantages of Custom Furniture */}
      <section
        aria-labelledby="advantages-heading"
        className="bg-surface-container-lowest/50 border-t border-border-hairline py-space-4xl"
      >
        <div className="container-editorial">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Eyebrow>Standar Mutu Niscala</Eyebrow>
            <h2
              id="advantages-heading"
              className="mt-2 text-headline-sm sm:text-headline-md text-on-surface"
            >
              Mengapa Furniture Custom Lebih Menguntungkan Jangka Panjang?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Berbeda dengan furniture toko pabrikan massal berbahan serbuk kayu press yang rapuh
              terkena air, furniture custom Niscala dirancang tahan hingga belasan tahun.
            </p>
          </div>

          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <RevealItem>
              <div className="h-full rounded-xl border border-border-hairline bg-surface-container-lowest p-6 shadow-hairline">
                <div className="size-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                  <Ruler className="size-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-on-surface">
                  Presisi Dimensi Ruangan
                </h3>
                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  Menutup sempurna dari lantai sampai plafon tanpa celah debu. Memaksimalkan sudut sempit,
                  kolom beton, atau area bawah tangga menjadi tempat penyimpanan produktif.
                </p>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="h-full rounded-xl border border-border-hairline bg-surface-container-lowest p-6 shadow-hairline">
                <div className="size-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-on-surface">
                  Substrat Plywood & HMR Hijau
                </h3>
                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  Bukan MDF atau Particle Board rapuh. Struktur padat tahan sekrup berulang kali, tidak
                  melengkung, dan resistan terhadap kelembapan tropis.
                </p>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="h-full rounded-xl border border-border-hairline bg-surface-container-lowest p-6 shadow-hairline">
                <div className="size-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                  <Cpu className="size-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-on-surface">
                  Finishing Mesin Otomatis
                </h3>
                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  Pengeleman HPL dan edging ABS dikerjakan dengan mesin hot-melt temperatur tinggi.
                  Hasil sambungan rapat, halus, tidak tajam, dan tidak gampang mengelupas.
                </p>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="h-full rounded-xl border border-border-hairline bg-surface-container-lowest p-6 shadow-hairline">
                <div className="size-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary mb-4">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-on-surface">
                  Hardware Slow-Motion Senyap
                </h3>
                <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                  Engsel hidrolik dan rel laci undermount soft-close bermerk teruji. Pintu menutup pelan
                  tanpa benturan keras, aman untuk anak-anak dan awet bertahun-tahun.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Simple 4-Step Production Workflow */}
      <section
        aria-labelledby="workflow-heading"
        className="bg-surface py-space-4xl"
      >
        <div className="container-editorial">
          <div className="text-center max-w-xl mx-auto mb-10">
            <Eyebrow>Alur Pengerjaan</Eyebrow>
            <h2
              id="workflow-heading"
              className="mt-2 text-headline-sm text-on-surface"
            >
              4 Langkah Mudah Mewujudkan Furniture Custom
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              {
                step: "01",
                title: "Konsultasi & Estimasi",
                desc: "Kirim denah kasar atau foto ruangan via WhatsApp. Kami hitungkan estimasi biaya awal secara transparan.",
              },
              {
                step: "02",
                title: "Survey & Pengukuran",
                desc: "Tim desainer datang langsung untuk mengukur millimeter ruangan dan membawa contoh sampel bahan/HPL.",
              },
              {
                step: "03",
                title: "Desain 3D & Produksi",
                desc: "Visualisasi 3D realistis disepakati sebelum masuk fabrikasi mesin workshop presisi selama 14-25 hari kerja.",
              },
              {
                step: "04",
                title: "Instalasi & Serah Terima",
                desc: "Pemasangan rapi dan bersih di lokasi oleh tukang ahli kami dengan garansi pemeliharaan resmi.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-border-hairline bg-surface-container-lowest p-5 space-y-2"
              >
                <span className="text-2xl font-bold text-primary-container/40">
                  {item.step}
                </span>
                <h3 className="font-semibold text-sm text-on-surface">
                  {item.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <CtaBanner />
    </>
  );
}
