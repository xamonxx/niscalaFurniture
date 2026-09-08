import { Mail, MapPin, MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SocialLinks } from "@/components/layout/social-links";
import { Reveal } from "@/components/motion/reveal";
import { Faq } from "@/components/sections/faq";
import { Survey } from "@/components/sections/survey";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { servedLocations } from "@/data/projects";
import {
  ORGANISATION_ID,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { hasWhatsApp, site } from "@/lib/site";

const CONTACT_DESCRIPTION =
  "Hubungi Niscala Furniture untuk konsultasi interior dan custom furniture. Konsultasi awal dan estimasi tidak dikenakan biaya.";

export const metadata = buildMetadata({
  title: "Kontak & Konsultasi",
  description: CONTACT_DESCRIPTION,
  path: "/contact",
});

function contactJsonLd() {
  return jsonLdGraph(
    {
      ...webPageJsonLd({
        path: "/contact",
        name: `Kontak ${site.name}`,
        description: CONTACT_DESCRIPTION,
        type: "ContactPage",
        breadcrumb: true,
      }),
      mainEntity: { "@id": ORGANISATION_ID },
    },
    breadcrumbJsonLd([{ name: "Kontak", path: "/contact" }])
  );
}

export default function ContactPage() {
  const whatsappReady = hasWhatsApp();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(contactJsonLd())}
      />

      <PageHeader
        eyebrow="Kontak"
        title="Mulai dari percakapan, bukan dari katalog."
        lead="Ceritakan ruang yang ingin dikerjakan beserta perkiraan ukurannya. Konsultasi awal dan estimasi kasar tidak dikenakan biaya."
      />

      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <div className="grid gap-space-lg md:grid-cols-2 lg:grid-cols-3">
            <Reveal className="space-y-space-md rounded-md bg-surface-container-lowest p-space-xl shadow-hairline">
              <span className="flex size-12 items-center justify-center rounded-md bg-surface-container text-primary">
                <MessageCircle aria-hidden className="size-6" />
              </span>
              <h2 className="text-headline-sm font-semibold text-on-surface">
                WhatsApp
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Jalur tercepat. Kirimkan foto ruangan dan perkiraan ukurannya agar
                kami bisa langsung memberi gambaran.
              </p>
              {whatsappReady ? (
                <WhatsAppCta source="contact" size="sm">
                  Chat Sekarang
                </WhatsAppCta>
              ) : (
                <p className="text-body-sm text-muted-gray">
                  Nomor WhatsApp sedang dalam proses pemasangan. Sementara ini,
                  gunakan formulir survey di bawah.
                </p>
              )}
            </Reveal>

            <Reveal
              delay={1}
              className="space-y-space-md rounded-md bg-surface-container-lowest p-space-xl shadow-hairline"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-surface-container text-primary">
                <Mail aria-hidden className="size-6" />
              </span>
              <h2 className="text-headline-sm font-semibold text-on-surface">Email</h2>
              <p className="text-body-sm text-on-surface-variant">
                Untuk penawaran, kerja sama, atau kebutuhan proyek komersial dengan
                dokumen pendukung.
              </p>
              {site.email ? (
                <a
                  href={`mailto:${site.email}`}
                  className="inline-block text-label-lg font-semibold text-on-surface underline decoration-primary-container decoration-2 underline-offset-4"
                >
                  {site.email}
                </a>
              ) : (
                <p className="text-body-sm text-muted-gray">
                  Alamat email resmi akan diumumkan segera.
                </p>
              )}
            </Reveal>

            <Reveal
              delay={2}
              className="space-y-space-md rounded-md bg-surface-container-lowest p-space-xl shadow-hairline md:col-span-2 lg:col-span-1"
            >
              <span className="flex size-12 items-center justify-center rounded-md bg-surface-container text-primary">
                <MapPin aria-hidden className="size-6" />
              </span>
              <h2 className="text-headline-sm font-semibold text-on-surface">
                Jangkauan pengerjaan
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Kami melayani pemesanan dari seluruh Indonesia. Modul difabrikasi di
                workshop lalu dikirim terlindungi ke lokasi Anda.
              </p>
              {servedLocations.length > 0 ? (
                <p className="text-body-sm text-muted-gray">
                  Sudah pernah dikerjakan di {servedLocations.slice(0, 6).join(", ")}
                  {servedLocations.length > 6 ? ", dan kota lainnya" : ""}.
                </p>
              ) : null}
              <SocialLinks />
            </Reveal>
          </div>
        </div>
      </section>

      <Survey />
      <Faq />
    </>
  );
}
