"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/shared/hooks/useWishlist";
import { cn } from "@/shared/lib/cn";

type FavouriteButtonProps = {
  propertyKey: string;
  propertyName: string;
  /** Overrides the card placement — the detail header sits it inline, not over a photo. */
  className?: string;
};

export function FavouriteButton({ propertyKey, propertyName, className }: FavouriteButtonProps) {
  const wishlist = useWishlist();
  const isSaved = wishlist.has(propertyKey);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${propertyName} from wishlist` : `Save ${propertyName}`}
      onClick={() => wishlist.toggle(propertyKey)}
      className={cn(
        "z-10 flex size-9 shrink-0 items-center justify-center rounded-full",
        "bg-white/90 text-fg shadow-sm backdrop-blur-sm transition-transform duration-[120ms]",
        "ease-out hover:scale-105 active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className ?? "absolute top-3 right-3",
      )}
    >
      <Heart
        size={16}
        strokeWidth={1.8}
        aria-hidden
        className={cn(isSaved && "fill-brand-500 text-brand-500")}
      />
    </button>
  );
}
