"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/shared/hooks/useWishlist";
import { ButtonLink } from "@/shared/ui";
import type { PropertySummary } from "../types";
import { PropertyCard } from "./PropertyCard";

/**
 * The wishlist is device-local (no guest accounts in v1), so the saved set can only be read
 * on the client. The catalogue itself still arrives server-rendered.
 */
export function WishlistGrid({ properties }: { properties: PropertySummary[] }) {
  const { keys, count } = useWishlist();
  const saved = properties.filter((property) => keys.includes(property.key));

  if (count === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-brand-500">
          <Heart size={24} strokeWidth={1.6} aria-hidden />
        </span>
        <h2 className="font-display text-title text-fg">Nothing saved yet</h2>
        <p className="max-w-xs text-body text-fg-muted">
          Tap the heart on any villa and it will wait for you here. Saved villas stay on this
          device.
        </p>
        <ButtonLink href="/properties" size="lg" className="mt-2">
          Browse villas
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {saved.map((property) => (
        <li key={property.id}>
          <PropertyCard property={property} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
