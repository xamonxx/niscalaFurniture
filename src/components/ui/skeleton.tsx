import { cn } from "@/lib/cn";

/**
 * Loading placeholder.
 *
 * The pulse is a plain CSS animation, so it still runs if the JavaScript
 * bundle is slow - which is exactly when a skeleton is being looked at.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-container-high",
        className
      )}
    />
  );
}

/** Masthead placeholder, matching the shape of `PageHeader`. */
export function PageHeaderSkeleton() {
  return (
    <section className="border-b border-border-hairline bg-surface py-space-3xl lg:py-space-4xl">
      <div className="container-editorial max-w-3xl space-y-space-sm">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <Skeleton className="mt-space-md h-4 w-full max-w-lg" />
      </div>
    </section>
  );
}

/** Portrait card placeholders, matching the portfolio grid's 4/5 ratio. */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-gutter-desktop sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <Skeleton className="aspect-[4/5] w-full" />
        </li>
      ))}
    </ul>
  );
}
