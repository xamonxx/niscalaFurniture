import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { getAllArticles } from "@/lib/articles";

/** Section 07 - Knowledge centre. */
export async function KnowledgePreview() {
  const all = await getAllArticles();
  const articles = all.slice(0, 4);

  return (
    <section className="bg-surface py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl space-y-space-xs">
            <Eyebrow>Edukasi &amp; wawasan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Kenali apa yang akan menjadi bagian dari rumah Anda bertahun-tahun.
            </h2>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop md:grid-cols-2 lg:grid-cols-4"
        >
          {articles.map((article) => (
            <RevealItem
              as="li"
              key={article.slug}
              className="flex flex-col justify-between rounded-md bg-surface-container-low shadow-hairline"
            >
              <div className="space-y-space-xs p-space-sm sm:space-y-space-sm sm:p-space-lg">
                <Eyebrow>{article.category}</Eyebrow>
                <h3 className="text-xs sm:text-headline-sm font-semibold leading-snug text-on-surface">
                  {article.title}
                </h3>
                <p className="text-[11px] sm:text-body-sm leading-relaxed text-on-surface-variant">
                  {article.summary}
                </p>
              </div>
              <div className="px-space-sm pb-space-sm sm:px-space-lg sm:pb-space-lg">
                <Link
                  href={`/knowledge/${article.slug}`}
                  className="group inline-flex items-center gap-1 sm:gap-space-2xs text-[11px] sm:text-label-md font-semibold text-on-surface transition-colors hover:text-primary"
                >
                  Baca Panduan
                  <ArrowRight
                    aria-hidden
                    className="size-3 sm:size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
