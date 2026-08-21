import { BedDouble, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { formatIDR } from "@/shared/lib/format";
import { PROPERTY_TYPE_LABEL, bedroomLabel, type PropertyDetail } from "../types";
import { FavouriteButton } from "./FavouriteButton";

export function PropertyHeader({ property }: { property: PropertyDetail }) {
  const beds = bedroomLabel(property.bedrooms);

  return (
    <header className="container-page pt-5 md:pt-8">
      <nav aria-label="Breadcrumb" className="text-body-sm text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/properties?type=${property.type}`} className="hover:text-brand-600">
              {PROPERTY_TYPE_LABEL[property.type]}s
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-fg">{property.name}</li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-display-lg text-fg">{property.name}</h1>

          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-body-sm text-fg-muted">
            <li className="flex items-center gap-1.5">
              <MapPin size={15} strokeWidth={1.7} className="text-brand-400" aria-hidden />
              {property.location}, Bali
            </li>
            {beds ? (
              <li className="flex items-center gap-1.5">
                <BedDouble size={15} strokeWidth={1.7} className="text-brand-400" aria-hidden />
                {beds}
              </li>
            ) : null}
            {property.maxGuests ? (
              <li className="flex items-center gap-1.5">
                <Users size={15} strokeWidth={1.7} className="text-brand-400" aria-hidden />
                Sleeps {property.maxGuests}
              </li>
            ) : null}
            {property.rating ? (
              <li className="flex items-center gap-1.5 text-fg">
                <Star size={15} className="fill-brand-500 text-brand-500" aria-hidden />
                <span className="tabular font-semibold">{property.rating.average.toFixed(1)}</span>
                <span className="text-fg-muted">({property.rating.count})</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="flex items-center gap-3 max-md:w-full max-md:justify-between">
          {property.fromPrice === null ? null : (
            <span className="flex flex-col md:items-end">
              <span className="text-[11px] text-fg-muted uppercase">From</span>
              <span className="tabular text-price text-fg">{formatIDR(property.fromPrice)}</span>
              <span className="text-body-sm text-fg-muted">/ night</span>
            </span>
          )}

          {/* Inline here rather than floating over a photo, so it needs the card placement off. */}
          <FavouriteButton
            propertyKey={property.key}
            propertyName={property.name}
            className="relative ring-1 ring-border"
          />
        </div>
      </div>
    </header>
  );
}
