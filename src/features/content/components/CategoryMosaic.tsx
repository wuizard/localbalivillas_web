"use client";

import Image from "next/image";
import { useTimeOfDay } from "@/shared/hooks/useTimeOfDay";
import { cn } from "@/shared/lib/cn";

/**
 * Four photographs as a 2×2 grid behind a category tile.
 *
 * No night frames here, unlike `TimeAwareImage`: four subjects already compete for one
 * 64vw box on a phone, and a second set of four would double the download for a picture
 * the guest reads in a glance. Evening is carried by the grade alone, as it is for any
 * tile without curated night photography.
 */
export function CategoryMosaic({ images }: { images: readonly string[] }) {
  const isNight = useTimeOfDay() === "night";

  return (
    <>
      <span
        aria-hidden
        className="absolute inset-0 grid grid-cols-2 grid-rows-2 transition-transform duration-700 ease-out group-hover:scale-105"
      >
        {images.slice(0, 4).map((src) => (
          <span key={src} className="relative overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 17vw, 32vw"
              className="object-cover"
            />
          </span>
        ))}
      </span>

      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[#07131b] transition-opacity duration-[900ms] ease-[var(--ease-glass)] motion-reduce:transition-none",
          isNight ? "opacity-40" : "opacity-0",
        )}
      />
    </>
  );
}
