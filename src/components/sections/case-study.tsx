import { Ruler, TriangleAlert } from "lucide-react";

import { BeforeAfter } from "@/components/ui/before-after";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/typography";
import { caseStudy } from "@/data/projects";

/**
 * Section 05 - Featured case study.
 *
 * The prototype called for a Before → 3D render → After trio. The studio
 * archive contains no render file, so the section shows the two frames that
 * genuinely exist and the copy describes the design stage instead of
 * illustrating it with a stand-in image.
 */
export function CaseStudy() {
  if (!caseStudy) return null;

  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Dari masalah menjadi ruang"
            title="Setiap proyek dimulai dari masalah yang perlu diselesaikan."
            lead="Ruang yang sama, sebelum dan sesudah dikerjakan. Yang berubah bukan hanya tampilannya, tetapi berapa banyak barang yang akhirnya punya tempat."
            className="mb-space-2xl max-w-3xl"
          />
        </Reveal>

        <Reveal>
          <div className="mb-space-2xl grid gap-space-lg rounded-md bg-surface-container-low p-space-xl md:grid-cols-2 md:gap-gutter-desktop">
            <div className="space-y-space-xs">
              <p className="inline-flex items-center gap-space-2xs text-label-md font-semibold text-error">
                <TriangleAlert aria-hidden className="size-[18px]" />
                Tantangan Awal
              </p>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Ruang yang tersedia tidak berbentuk kotak sempurna, sementara
                kebutuhan penyimpanannya besar. Furniture jadi tidak ada yang
                benar-benar muat, sehingga selalu tersisa celah yang hanya menjadi
                tempat menumpuk barang dan debu.
              </p>
            </div>
            <div className="space-y-space-xs">
              <p className="inline-flex items-center gap-space-2xs text-label-md font-semibold text-primary">
                <Ruler aria-hidden className="size-[18px]" />
                Solusi Rekayasa Niscala
              </p>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Pengukuran aktual di lokasi, lalu modul dirancang mengikuti bentuk
                ruangan yang sebenarnya — termasuk dinding yang tidak lurus dan
                ketinggian yang berbeda di tiap sisi. Setiap dimensi disetujui lewat
                gambar kerja dan visual 3D sebelum panel pertama dipotong.
              </p>
            </div>
          </div>
        </Reveal>

        {/*
          Deliberately not wrapped in `Reveal`: it animates a transform, and a
          transformed ancestor breaks the `position: sticky` this section pins
          itself with. The process storyteller is rendered bare for the same
          reason.
        */}
        <BeforeAfter before={caseStudy.before} after={caseStudy.after} />
      </div>
    </section>
  );
}
