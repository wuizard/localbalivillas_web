import type { Metadata } from "next";
import {
  PROPERTY_TYPES,
  PropertyCard,
  getProperties,
  type PropertyType,
} from "@/features/property";
import { bedroomSummary, criteriaFromSearchParams } from "@/features/search";

export const metadata: Metadata = {
  title: "Villas, resorts and private retreats in Bali",
  description:
    "Browse every villa, resort, hotel and bamboo house Local Bali Villas rents directly across Seminyak, Canggu, Ubud, Jimbaran, Uluwatu and Sanur.",
  alternates: { canonical: "/properties" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readType(value: string | string[] | undefined): PropertyType | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return (PROPERTY_TYPES as readonly string[]).includes(candidate ?? "")
    ? (candidate as PropertyType)
    : null;
}

/**
 * A thin, server-rendered list so every call to action on the home page lands somewhere real.
 * Filters, the date-aware calendar and per-night pricing arrive with M3.
 */
export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const criteria = criteriaFromSearchParams(
    new URLSearchParams(
      Object.entries(params).flatMap(([key, value]) =>
        value === undefined ? [] : [[key, Array.isArray(value) ? (value[0] ?? "") : value]],
      ),
    ),
  );
  const type = readType(params.type);

  const all = await getProperties();
  const properties = all.filter(
    (property) =>
      (type === null || property.type === type) &&
      (criteria.destination === null || property.location === criteria.destination) &&
      // Properties publish every bedroom count they offer, so a 2-bedroom request keeps a
      // villa that also has a 4-bedroom layout. `bedrooms` is empty for a few listings the
      // API has not filled in — those drop out of a bedroom-filtered search rather than
      // pretending to match.
      (criteria.bedrooms === 0 || property.bedrooms.some((count) => count >= criteria.bedrooms)),
  );

  /**
   * The stay travels with the guest to the property page. Without it, choosing dates and a
   * party on the home page and then opening a villa lands on an unpriced page asking for the
   * same answers again. The bedroom count stays behind — it filters a list, it does not
   * describe a stay.
   */
  const stay = new URLSearchParams();
  if (criteria.checkIn) stay.set("checkIn", criteria.checkIn);
  if (criteria.checkOut) stay.set("checkOut", criteria.checkOut);
  stay.set("adults", String(criteria.adults));
  if (criteria.children > 0) stay.set("children", String(criteria.children));
  const stayQuery = stay.toString();

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">
          {[criteria.destination ?? "All of Bali", bedroomSummary(criteria.bedrooms)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h1 className="font-display text-display-lg text-fg">
          {properties.length} {properties.length === 1 ? "place" : "places"} to stay
        </h1>
      </header>

      {properties.length === 0 ? (
        <p className="text-body text-fg-muted mt-12">
          Nothing matches that combination yet. Try a different area or clear the filters.
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property, index) => (
            <li key={property.id}>
              <PropertyCard
                property={property}
                stayQuery={stayQuery}
                priority={index < 4}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
