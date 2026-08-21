import { MapPin } from "lucide-react";
import type { PropertyDetail } from "../types";

export function PropertyMap({ property }: { property: PropertyDetail }) {
  if (!property.mapEmbedUrl) return null;

  return (
    <section aria-labelledby="location" className="container-page pb-12 md:pb-16">
      <h2 id="location" className="font-display text-display-sm text-fg">
        Where you&apos;ll be
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-body text-fg-muted">
        <MapPin size={16} strokeWidth={1.7} className="text-brand-500" aria-hidden />
        {property.location}, Bali
      </p>

      <div className="mt-5 overflow-hidden rounded-md border border-border">
        <iframe
          src={property.mapEmbedUrl}
          title={`Map showing ${property.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[280px] w-full md:h-[400px]"
        />
      </div>
    </section>
  );
}
