"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Lightbox } from "@/shared/ui";

type PropertyGalleryProps = {
  images: string[];
  propertyName: string;
};

/**
 * Desktop is a 1 + 4 mosaic; mobile is a full-bleed swipe rail with a live counter, because
 * a mosaic on a phone is five thumbnails nobody can see (DESIGN.md §5).
 */
export function PropertyGallery({ images, propertyName }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(1);
  const railRef = useRef<HTMLUListElement>(null);

  const mosaic = images.slice(0, 5);

  function onRailScroll() {
    const rail = railRef.current;
    if (!rail) return;
    const index = Math.round(rail.scrollLeft / rail.clientWidth) + 1;
    setVisible(Math.min(Math.max(index, 1), images.length));
  }

  if (images.length === 0) return null;

  return (
    <>
      {/* Mobile: swipe rail */}
      <div className="relative md:hidden">
        <ul
          ref={railRef}
          onScroll={onRailScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {images.map((src, index) => (
            <li key={src} className="w-full shrink-0 snap-center">
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-label={`View photo ${index + 1} of ${images.length}`}
                className="relative block aspect-[4/3] w-full"
              >
                <Image
                  src={src}
                  alt={`${propertyName}, photo ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>

        <span className="glass glass-sm tabular text-fg pointer-events-none absolute right-3 bottom-3 rounded-full px-3 py-1 text-[11px] font-semibold">
          {visible} / {images.length}
        </span>
      </div>

      {/* Desktop: 1 + 4 mosaic */}
      <div className="container-page relative max-md:hidden">
        <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-md lg:h-[480px]">
          {mosaic.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`View photo ${index + 1} of ${images.length}`}
              className={cn(
                "group relative overflow-hidden",
                index === 0 && "col-span-2 row-span-2",
              )}
            >
              <Image
                src={src}
                alt={`${propertyName}, photo ${index + 1}`}
                fill
                priority={index === 0}
                sizes={index === 0 ? "50vw" : "25vw"}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {images.length > mosaic.length ? (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="glass glass-sm text-label text-fg absolute right-10 bottom-4 flex items-center gap-2 rounded-sm px-4 py-2.5 uppercase transition-transform duration-[120ms] hover:scale-[1.02] lg:right-12"
          >
            <Images size={15} strokeWidth={1.8} aria-hidden />
            View all {images.length} photos
          </button>
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          label={propertyName}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
