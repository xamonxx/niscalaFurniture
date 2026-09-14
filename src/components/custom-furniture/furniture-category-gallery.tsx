"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, Tag } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { FurnitureReference } from "@/data/custom-furniture";

type FurnitureCategoryGalleryProps = {
  references: FurnitureReference[];
  categoryName: string;
};

export function FurnitureCategoryGallery({
  references,
  categoryName,
}: FurnitureCategoryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Gallery Header Info */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span>Menampilkan</span>
          <span className="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container-low">
            {references.length} Desain Referensi
          </span>
          <span className="hidden sm:inline">• Klik gambar untuk memperbesar</span>
        </div>
        <div className="text-xs text-muted-gray hidden sm:block">
          Kategori: {categoryName}
        </div>
      </div>

      {/* Responsive Grid: STRICT 2 COLUMNS ON MOBILE, 3 ON MD, 4 ON LG */}
      <div className="grid grid-cols-2 gap-space-sm sm:gap-space-md md:grid-cols-3 lg:grid-cols-4">
        {references.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="group relative flex flex-col text-left rounded-xl overflow-hidden border border-border-hairline bg-surface-container-lowest/80 hover:border-primary-container/60 hover:shadow-panel transition-[border-color,box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Buka pratinjau: ${item.title}`}
          >
            {/* Image Container with fixed aspect ratio */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Overlay with Zoom Icon */}
              <div className="absolute inset-0 bg-deep-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="size-9 rounded-full bg-deep-black/60 text-pure-white backdrop-blur-sm flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                  <Maximize2 className="size-4" />
                </div>
              </div>

              {/* Style Badge */}
              <div className="absolute top-2 left-2 pointer-events-none">
                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-deep-black/70 text-pure-white backdrop-blur-md">
                  {item.style}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Specs tags / footer */}
              <div className="pt-1 border-t border-border-hairline/60 flex items-center gap-1 text-xs sm:text-body-sm text-muted-gray overflow-hidden">
                <Tag className="size-2.5 sm:size-3 shrink-0" />
                <span className="truncate">{item.specs[0] || item.style}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        items={references}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
