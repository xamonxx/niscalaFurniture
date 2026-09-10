import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { arrowRowClasses, Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { knowledgeArticles } from "@/data/knowledge";

/** Section 07 - Knowledge centre. */
export function KnowledgePreview() {
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
          className="grid gap-gutter-desktop md:grid-cols-2 lg:grid-cols-4"
        >
          {knowledgeArticles.map((article) => (
            <RevealItem
              as="li"
              key={article.slug}
              className="flex flex-col justify-between rounded-md bg-surface-container-low shadow-hairline"
            >
              <div className="space-y-space-sm p-space-lg">
                <Eyebrow>{article.category}</Eyebrow>
                <h3 className="text-headline-sm font-semibold leading-snug text-on-surface">
                  {article.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  {article.summary}
                </p>
              </div>
              <div className="px-space-lg pb-space-lg">
                <Link
                  href={`/knowledge/${article.slug}`}
                  className={cn(arrowRowClasses, "text-on-surface hover:text-primary")}
                >
                  Baca Panduan
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-0.5"
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
