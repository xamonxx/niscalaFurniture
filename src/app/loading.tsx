import {
  PageHeaderSkeleton,
  ProjectGridSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

/**
 * The site's only route placeholder.
 *
 * Deliberately a single boundary at the root rather than one per segment: a
 * nested `loading.tsx` does not replace its parent's, it nests inside it, so
 * having them at `/`, `/portfolio` and `/portfolio/[slug]` put all three
 * fallbacks into the prerendered HTML of every project page - 60 skeleton
 * elements and about 1.3 KB gzipped per extra boundary.
 *
 * Every page is statically generated and every internal link is prefetched, so
 * this is only seen while the payload for the next route is still in flight on
 * a slow connection. One generic shape covers that adequately.
 */
export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton />
      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial space-y-space-xl">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <ProjectGridSkeleton count={3} />
        </div>
      </section>
    </>
  );
}
