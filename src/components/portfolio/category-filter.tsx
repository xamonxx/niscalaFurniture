import Link from "next/link";

import { cn } from "@/lib/cn";
import { populatedCategories, projectCount } from "@/data/projects";
import { getProjectsByCategory } from "@/data/projects";

/**
 * Category filter.
 *
 * These are real links to real pages, not a client-side filter. A visitor
 * looking for "kitchen set custom" should be able to land on, share and have
 * Google index that shelf directly - none of which a `useState` filter allows.
 * It also keeps the whole portfolio listing on the server.
 */
export function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  const pills = [
    { slug: undefined, label: "Semua", href: "/portfolio", count: projectCount },
    ...populatedCategories.map((category) => ({
      slug: category.slug,
      label: category.short,
      href: `/portfolio/kategori/${category.slug}`,
      count: getProjectsByCategory(category.slug).length,
    })),
  ];

  return (
    <nav aria-label="Kategori portfolio">
      <ul className="flex flex-wrap gap-space-2xs">
        {pills.map((pill) => {
          const active = pill.slug === activeSlug;
          return (
            <li key={pill.href}>
              <Link
                href={pill.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-space-2xs rounded-lg px-space-md py-space-2xs text-label-md transition-colors",
                  active
                    ? "bg-deep-black text-pure-white"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                {pill.label}
                <span
                  className={cn(
                    "text-label-eyebrow",
                    active ? "text-primary-container" : "text-muted-gray"
                  )}
                >
                  {pill.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
