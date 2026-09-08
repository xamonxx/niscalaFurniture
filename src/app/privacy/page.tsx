import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import {
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Privacy policy.
 *
 * Written against what the code actually does, not against a template: the
 * survey form in `src/components/forms/survey-form.tsx`, the Server Action in
 * `src/app/actions/submit-survey.ts`, and the analytics surface in
 * `src/lib/analytics.ts` (which has no vendor wired up). If any of those three
 * change, this page has to change with them.
 */

const PRIVACY_DESCRIPTION =
  "Data apa yang dikumpulkan formulir survey Niscala Furniture, untuk apa digunakan, ke mana dikirim, dan bagaimana cara meminta penghapusannya.";

export const metadata = buildMetadata({
  title: "Kebijakan Privasi",
  description: PRIVACY_DESCRIPTION,
  path: "/privacy",
});

function privacyJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/privacy",
      name: `Kebijakan Privasi ${site.name}`,
      description: PRIVACY_DESCRIPTION,
      breadcrumb: true,
    }),
    breadcrumbJsonLd([{ name: "Kebijakan Privasi", path: "/privacy" }])
  );
}

type Section = {
  heading: string;
  body: string[];
  list?: string[];
};

const sections: Section[] = [
  {
    heading: "Data yang kami kumpulkan",
    body: [
      "Satu-satunya data pribadi yang situs ini kumpulkan adalah data yang Anda isi sendiri pada formulir survey. Tidak ada pendaftaran akun, dan formulir tidak menerima unggahan berkas apa pun.",
    ],
    list: [
      "Nama dan nomor WhatsApp, serta nomor cadangan bila Anda mengisinya.",
      "Lokasi proyek: provinsi, kota, kecamatan, dan alamat yang akan disurvey.",
      "Kebutuhan proyek: jenis pekerjaan, jenis properti, target waktu, dan kisaran anggaran bila dipilih.",
      "Jadwal survey yang Anda ajukan, beserta catatan tambahan yang Anda tulis.",
    ],
  },
  {
    heading: "Untuk apa data itu dipakai",
    body: [
      "Data survey dipakai untuk satu hal: menindaklanjuti permintaan Anda. Tim kami memakainya untuk menyiapkan rekomendasi, menghitung estimasi, dan mengatur jadwal survey ke lokasi.",
      "Kami tidak menjual, menyewakan, atau menukarkan data Anda kepada pihak lain, dan tidak memakainya untuk iklan.",
    ],
  },
  {
    heading: "Tindak lanjut lewat WhatsApp",
    body: [
      "Setelah formulir terkirim, situs menawarkan untuk melanjutkan percakapan ke WhatsApp dengan ringkasan isian Anda. Percakapan itu berjalan di aplikasi WhatsApp dan tunduk pada kebijakan privasi WhatsApp, di luar kendali kami.",
      "Anda tidak wajib melanjutkan ke WhatsApp. Bila lebih nyaman, cukup sebutkan kanal lain yang Anda inginkan pada kolom catatan.",
    ],
  },
  {
    heading: "Ke mana data dikirim",
    body: [
      "Isian formulir divalidasi di server kami, lalu diteruskan ke sistem pencatatan lead internal yang kami gunakan untuk mengatur antrean survey. Selain penyedia hosting situs dan sistem pencatatan tersebut, tidak ada pihak ketiga yang menerima data Anda.",
    ],
  },
  {
    heading: "Cookie dan pelacakan",
    body: [
      "Situs ini tidak memasang cookie iklan, tidak memakai pixel media sosial, dan saat ini tidak menjalankan layanan analitik pihak ketiga. Halaman yang Anda buka tidak dikaitkan dengan identitas Anda.",
    ],
  },
  {
    heading: "Berapa lama data disimpan",
    body: [
      "Data lead disimpan selama proyek masih dalam pembicaraan, dan setelahnya sebagai arsip pekerjaan. Anda boleh meminta penghapusan kapan saja, dan kami hapus kecuali data tersebut masih terikat pada pekerjaan yang sedang berjalan.",
    ],
  },
  {
    heading: "Hak Anda",
    body: [
      "Anda berhak meminta salinan data yang kami simpan tentang Anda, meminta koreksi bila ada yang keliru, dan meminta penghapusan. Sampaikan permintaan itu lewat kanal kontak di bawah; kami tanggapi dalam waktu wajar.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(privacyJsonLd())}
      />

      <PageHeader
        eyebrow="Kebijakan privasi"
        title="Data yang Anda kirim, dan apa yang kami lakukan dengannya."
        lead="Halaman ini menjelaskan data apa saja yang dikumpulkan formulir survey, untuk apa dipakai, ke mana dikirim, dan bagaimana meminta penghapusannya."
      />

      <section className="bg-surface py-space-4xl">
        <div className="container-editorial">
          <div className="mx-auto max-w-3xl space-y-space-2xl">
            {sections.map((section) => (
              <Reveal key={section.heading} className="space-y-space-sm">
                <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-body-lg leading-relaxed text-on-surface-variant"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="space-y-space-xs pt-space-2xs">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="flex gap-space-sm text-body-md leading-relaxed text-on-surface-variant"
                      >
                        <span
                          aria-hidden
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-container"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            ))}

            <Reveal className="space-y-space-sm rounded-md bg-surface-container-low p-space-xl">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                Menghubungi kami soal data Anda
              </h2>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Kirimkan permintaan akses, koreksi, atau penghapusan data melalui{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-on-surface underline underline-offset-4 transition-colors hover:text-primary"
                >
                  halaman kontak
                </Link>
                {site.email ? (
                  <>
                    {" "}
                    atau ke{" "}
                    <a
                      href={`mailto:${site.email}`}
                      className="font-semibold text-on-surface underline underline-offset-4 transition-colors hover:text-primary"
                    >
                      {site.email}
                    </a>
                  </>
                ) : null}
                . Sebutkan nama dan nomor WhatsApp yang Anda pakai saat mengisi
                formulir agar kami bisa menemukan datanya.
              </p>
              <p className="text-body-sm text-muted-gray">
                Kebijakan ini berlaku untuk {site.url} dan akan diperbarui bila
                cara kami menangani data berubah.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
