import { ArrowRight, BedDouble, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Money } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";
import { PROPERTY_TYPE_LABEL, bedroomLabel, type PropertySummary } from "../types";
import { FavouriteButton } from "./FavouriteButton";

type PropertyCardProps = {
  property: PropertySummary;
  /** The first card above the fold carries the LCP image on the results page. */
  priority?: boolean;
  className?: string;
};

export function PropertyCard({ property, priority = false, className }: PropertyCardProps) {
  const cover = property.images[0];
  const beds = bedroomLabel(property.bedrooms);

  return (
    <article
      className={cn(
        "group border-border bg-surface relative flex flex-col overflow-hidden rounded-md border",
        "shadow-sm transition-shadow duration-200 ease-out hover:shadow-md",
        "focus-within:ring-brand-500 focus-within:ring-2 focus-within:ring-offset-2",
        className,
      )}
    >
      <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={`${property.name} in ${property.location}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 45vw, 80vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}

        <span className="absolute bottom-3 left-3 rounded-sm bg-black/60 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white backdrop-blur-sm">
          {PROPERTY_TYPE_LABEL[property.type]}
        </span>

        <FavouriteButton propertyKey={property.key} propertyName={property.name} />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="font-display text-title text-fg leading-snug">
          <Link
            href={property.href}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {property.name}
          </Link>
        </h3>

        <p className="text-body-sm text-fg-muted flex items-center gap-1.5">
          <MapPin size={14} strokeWidth={1.7} className="text-brand-400 shrink-0" aria-hidden />
          {property.location}, Bali
        </p>

        {property.rating ? (
          <p className="text-body-sm text-fg flex items-center gap-1.5">
            <Star size={14} className="fill-brand-500 text-brand-500" aria-hidden />
            <span className="tabular font-semibold">{property.rating.average.toFixed(1)}</span>
            <span className="text-fg-muted">
              ({property.rating.count} {property.rating.count === 1 ? "review" : "reviews"})
            </span>
          </p>
        ) : (
          <ul className="text-fg-muted flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem]">
            {beds ? <Meta icon={BedDouble}>{beds}</Meta> : null}
            {property.maxGuests ? <Meta icon={Users}>{property.maxGuests} Guests</Meta> : null}
          </ul>
        )}

        <div className="border-border mt-auto flex items-end justify-between gap-2 border-t pt-2.5">
          <span className="flex min-w-0 flex-col">
            <span className="text-fg-muted text-[10px] leading-none">Start From</span>
            <span className="tabular text-body text-fg mt-1 truncate font-semibold">
              {property.fromPrice === null ? "On request" : <Money amount={property.fromPrice} />}
            </span>
            {property.fromPrice === null ? null : (
              <span className="text-fg-muted text-[10px]">/night</span>
            )}
          </span>

          {/* Decorative: the whole card is already one link via the title overlay. */}
          <span
            aria-hidden
            className="bg-brand-900 flex size-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          >
            <ArrowRight size={15} strokeWidth={2} />
          </span>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof BedDouble; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <Icon size={15} strokeWidth={1.6} className="text-brand-400" aria-hidden />
      {children}
    </li>
  );
}
