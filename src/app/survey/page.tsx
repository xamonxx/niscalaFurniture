import { PageHeader } from "@/components/layout/page-header";
import { Survey } from "@/components/sections/survey";
import { Timeline } from "@/components/sections/timeline";
import { Guarantees } from "@/components/sections/guarantees";
import {
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";

const SURVEY_DESCRIPTION =
  "Isi empat langkah singkat tentang ruangan Anda. Kami balas dengan rekomendasi desain dan estimasi biaya, tanpa biaya konsultasi awal.";

export const metadata = buildMetadata({
  title: "Ajukan Survey & Estimasi",
  description: SURVEY_DESCRIPTION,
  path: "/survey",
});

function surveyJsonLd() {
  return jsonLdGraph(
    webPageJsonLd({
      path: "/survey",
      name: "Ajukan Survey & Estimasi",
      description: SURVEY_DESCRIPTION,
      breadcrumb: true,
    }),
    breadcrumbJsonLd([{ name: "Survey & Estimasi", path: "/survey" }])
  );
}

export default function SurveyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(surveyJsonLd())}
      />

      <PageHeader
        eyebrow="Survey & estimasi"
        title="Ceritakan ruangan Anda, kami hitung estimasinya."
        lead="Empat langkah singkat. Semakin lengkap datanya, semakin akurat estimasi yang bisa kami berikan sebelum survey ke lokasi."
      />
      <Survey />
      <Timeline />
      <Guarantees />
    </>
  );
}
