"use client";

import Image from "next/image";
import { useState } from "react";
import { useTimeOfDay } from "@/shared/hooks/useTimeOfDay";
import { cn } from "@/shared/lib/cn";

type TimeAwareImageProps = {
  day: string;
  /** Curated night photograph. Without one the day frame simply takes the night grade. */
  night?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
};

/**
 * Cross-fades a hero or tile to its night frame using the guest's local clock.
 *
 * Only `opacity` animates — never a filter or a blur — so the transition stays on the
 * compositor and costs nothing on a mid-tier Android. The night frame is not requested
 * at all during the day, which keeps the daytime LCP to a single image.
 */
export function TimeAwareImage({
  day,
  night,
  alt,
  sizes,
  priority = false,
  quality,
  className,
}: TimeAwareImageProps) {
  const timeOfDay = useTimeOfDay();
  const [isNightLoaded, setNightLoaded] = useState(false);

  const isNight = timeOfDay === "night";
  const showNightFrame = isNight && Boolean(night) && isNightLoaded;

  return (
    <>
      <Image
        src={day}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={quality}
        className={cn("object-cover", className)}
      />

      {isNight && night ? (
        <Image
          src={night}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          quality={quality}
          onLoad={() => setNightLoaded(true)}
          className={cn(
            "object-cover transition-opacity duration-[900ms] ease-[var(--ease-glass)] motion-reduce:transition-none",
            showNightFrame ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      ) : null}

      {/* Cool, dim grade so tiles without a night photograph still read as evening,
          and so the ones that do have one settle into the same tonal range. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[#07131b] transition-opacity duration-[900ms] ease-[var(--ease-glass)] motion-reduce:transition-none",
          isNight ? (night ? "opacity-15" : "opacity-40") : "opacity-0",
        )}
      />
    </>
  );
}
