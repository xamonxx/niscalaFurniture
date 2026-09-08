import Image from "next/image";

import { PageHeader } from "@/components/layout/page-header";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Guarantees } from "@/components/sections/guarantees";
import { Materials } from "@/components/sections/materials";
import { Process } from "@/components/sections/process";
import { Eyebrow } from "@/components/ui/typography";
import { approach } from "@/data/content";
import {
  photoCount,
  populatedCategories,
  projectCount,
  servedLocations,
  storyImages,
} from "@/data/projects";
import {
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";

const ABOUT_DESCRIPTION =
  "Studio interior dan furniture custom dengan workshop sendiri. Merancang, memproduksi, dan memasang dengan satu tim, untuk klien di berbagai kota di Indonesia.";

// "Tentang Niscala Furniture" plus the layout's brand suffix rendered the name
// twice. The template already carries the brand, so the page title does not.
export const metadata = buildMetadata({
  title: "Profil Studio & Workshop",
  description: ABOUT_DESCRIPTION,
  path: "/about",
});

function aboutJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/about",
      name: `Profil Studio & Workshop ${site.name}`,
      description: ABOUT_DESCRIPTION,
      type: "AboutPage",
      breadcrumb: true,
    }),
    breadcrumbJsonLd([{ name: "Tentang", path: "/about" }])
  );
}

export default function AboutPage() {
  const shots = storyImages.slice(0, 3);

  // Every figure below is counted from published work, never rounded up.
  const stats = [
    { value: String(projectCount), label: "Proyek terdokumentasi" },
    { value: String(photoCount), label: "Foto hasil pengerjaan" },
    { value: String(populatedCategories.length), label: "Kategori pengerjaan" },
    { value: String(servedLocations.length), label: "Kota & area terlayani" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(aboutJsonLd())}
      />

      <PageHeader
        eyebrow="Tentang kami"
        title="Studio yang merancang, memproduksi, dan memasang sendiri."
        lead={`${site.name} mengerjakan interior dan furniture custom dari satu pintu: konsultasi, survey ukuran aktual, desain terukur, fabrikasi di workshop sendiri, sampai pemasangan. Tidak dioper ke pihak ketiga, sehingga tanggung jawab atas hasil akhirnya jelas ada di kami.`}
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <RevealGroup as="dl" className="grid gap-space-lg sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <RevealItem
                as="div"
                key={stat.label}
                className="space-y-space-2xs rounded-md bg-surface-container-lowest p-space-lg shadow-hairline"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-[44px] font-bold leading-none text-primary-container">
                    {stat.value}
                  </span>
                  <span className="mt-space-xs block text-body-sm text-on-surface-variant">
                    {stat.label}
                  </span>
                </dd>
              </RevealItem>
            ))}
          </RevealGroup>

          <p className="mt-space-lg text-body-sm text-muted-gray">
            Angka di atas dihitung langsung dari dokumentasi proyek yang
            dipublikasikan di situs ini, bukan estimasi.
          </p>
        </div>
      </section>

      <section className="bg-surface py-space-4xl">
        <div className="container-editorial">
          <div className="grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
            <Reveal className="space-y-space-md lg:col-span-5">
              <Eyebrow>Cara kami bekerja</Eyebrow>
              <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                Ukuran ruang yang menentukan desain, bukan sebaliknya.
              </h2>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Rumah jarang benar-benar simetris. Dinding sedikit miring, lantai
                tidak persis rata, dan ada kolom atau pipa yang tidak bisa
                dipindahkan. Karena itu setiap proyek dimulai dengan pengukuran di
                lokasi, lalu modul dirancang mengikuti kondisi yang sebenarnya.
              </p>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Hasilnya adalah furniture yang menempel rapat ke dinding, tidak
                menyisakan celah debu, dan memanfaatkan tinggi ruangan sampai ke
                plafon — hal yang tidak bisa diberikan furniture jadi.
              </p>
            </Reveal>

            <div className="lg:col-span-7">
              <RevealGroup as="ul" className="grid gap-space-md sm:grid-cols-2">
                {approach.map((item) => (
                  <RevealItem
                    as="li"
                    key={item.index}
                    className="space-y-space-xs rounded-md bg-surface-container-low p-space-lg"
                  >
                    <span
                      aria-hidden
                      className="block text-[32px] font-bold leading-none text-primary-container"
                    >
                      {item.index}
                    </span>
                    <h3 className="text-headline-sm font-semibold text-on-surface">
                      {item.title}
                    </h3>
                    <p className="text-body-sm leading-relaxed text-on-surface-variant">
                      {item.body}
                    </p>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </div>
      </section>

      {shots.length > 0 ? (
        <section className="bg-surface-container-low pb-space-4xl">
          <div className="container-editorial">
            <RevealGroup as="ul" className="grid gap-gutter-desktop pt-space-4xl md:grid-cols-3">
              {shots.map((shot) => (
                <RevealItem as="li" key={shot.src}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-surface-container-high">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(min-width: 768px) 30vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ) : null}

      <Process />
      <Materials />
      <Guarantees />
      <CtaBanner />
    </>
  );
}
