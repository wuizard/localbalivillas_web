"use client";

import { Images, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { cn } from "@/shared/lib/cn";

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
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
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

        <span className="glass glass-sm tabular pointer-events-none absolute right-3 bottom-3 rounded-full px-3 py-1 text-[11px] font-semibold text-fg">
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
            className="glass glass-sm absolute right-10 bottom-4 flex items-center gap-2 rounded-sm px-4 py-2.5 text-label text-fg uppercase transition-transform duration-[120ms] hover:scale-[1.02] lg:right-12"
          >
            <Images size={15} strokeWidth={1.8} aria-hidden />
            View all {images.length} photos
          </button>
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          propertyName={propertyName}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

function Lightbox({
  images,
  propertyName,
  startIndex,
  onClose,
}: {
  images: string[];
  propertyName: string;
  startIndex: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(startIndex);

  useLockBodyScroll(true);

  useEffect(() => {
    closeRef.current?.focus();
    const rail = railRef.current;
    if (rail) rail.scrollLeft = rail.clientWidth * startIndex;
  }, [startIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      const rail = railRef.current;
      if (!rail) return;
      if (event.key === "ArrowRight") rail.scrollBy({ left: rail.clientWidth, behavior: "smooth" });
      if (event.key === "ArrowLeft") rail.scrollBy({ left: -rail.clientWidth, behavior: "smooth" });
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${propertyName} photos`}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95"
    >
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <span className="tabular text-body-sm font-semibold text-white/80">
          {index + 1} / {images.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <X size={22} aria-hidden />
        </button>
      </header>

      <ul
        ref={railRef}
        onScroll={(event) => {
          const rail = event.currentTarget;
          setIndex(Math.round(rail.scrollLeft / rail.clientWidth));
        }}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto no-scrollbar"
      >
        {images.map((src, position) => (
          <li key={src} className="relative w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${propertyName}, photo ${position + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
