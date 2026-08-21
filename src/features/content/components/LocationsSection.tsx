import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/shared/ui";
import { BaliMap, MAPPED_LOCATIONS } from "./BaliMap";

type LocationsSectionProps = {
  /** Destination names the API actually returns, used to keep the pins honest. */
  available: string[];
};

export function LocationsSection({ available }: LocationsSectionProps) {
  const pins = MAPPED_LOCATIONS.filter((location) => available.includes(location.name));
  if (pins.length === 0) return null;

  return (
    <section aria-labelledby="explore-bali" className="container-page pt-4 md:pt-8">
      {/* Copy beside the map at every size, as drawn. The map takes the larger share because
          it has to carry pin labels; the copy steps down a size to earn its half. */}
      <div className="grid grid-cols-[minmax(0,47fr)_minmax(0,53fr)] items-center overflow-hidden rounded-md bg-brand-50 md:grid-cols-2 dark:bg-surface-muted">
        <div className="py-5 pl-4 md:p-10">
          <p className="text-[10px] leading-none font-semibold tracking-[0.06em] text-brand-600 uppercase md:text-label dark:text-brand-300">
            Explore Bali
          </p>

          <h2
            id="explore-bali"
            className="mt-1.5 font-display text-[0.9375rem] leading-tight text-fg md:mt-2 md:text-display-sm"
          >
            Beautiful Locations,
            <br />
            Endless Memories
          </h2>

          <p className="mt-2 max-w-sm text-[0.6875rem] leading-snug text-fg-muted md:mt-3 md:text-body">
            From vibrant beach clubs to peaceful jungle retreats. Choose the location that fits
            your perfect stay.
          </p>

          <ButtonLink
            href="/properties"
            size="sm"
            className="mt-3 h-9 gap-1.5 bg-brand-900 px-3 text-[10px] hover:bg-brand-800 md:mt-5 md:h-11 md:gap-2 md:px-6 md:text-label"
          >
            Explore locations
            <ArrowRight size={13} strokeWidth={2} aria-hidden className="md:size-[15px]" />
          </ButtonLink>
        </div>

        <BaliMap pins={pins} className="pr-2 md:pr-0" />
      </div>
    </section>
  );
}
