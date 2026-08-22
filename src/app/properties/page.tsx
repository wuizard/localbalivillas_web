import type { Metadata } from "next";
import { PROPERTY_TYPES, PropertyCard, getProperties, type PropertyType } from "@/features/property";
import { criteriaFromSearchParams } from "@/features/search";
import { Pagination } from "@/shared/ui";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Divides cleanly by the grid's 2, 3 and 4 columns, so no page ends on a ragged row. */
const PAGE_SIZE = 12;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toSearchParams(params: Record<string, string | string[] | undefined>): URLSearchParams {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) => {
      const single = one(value);
      return single === undefined ? [] : [[key, single] as [string, string]];
    }),
  );
}

function readType(value: string | string[] | undefined): PropertyType | null {
  const candidate = one(value);
  return (PROPERTY_TYPES as readonly string[]).includes(candidate ?? "")
    ? (candidate as PropertyType)
    : null;
}

function readPage(value: string | string[] | undefined): number {
  const parsed = Number(one(value));
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const page = readPage((await searchParams).page);
  const canonical = page > 1 ? `/properties?page=${page}` : "/properties";

  return {
    title: "Villas, resorts and private retreats in Bali",
    description:
      "Browse every villa, resort, hotel and bamboo house Local Bali Villas rents directly across Seminyak, Canggu, Ubud, Jimbaran, Uluwatu and Sanur.",
    // Each page shows different properties, so page 2 must not canonicalise to page 1 —
    // that would ask Google to drop everything past the first twelve.
    alternates: { canonical },
  };
}

/**
 * A thin, server-rendered list so every call to action on the home page lands somewhere real.
 * Filters, the date-aware calendar and per-night pricing arrive with M3.
 *
 * Paging is done here over the full list rather than at the API: `/properties/list` returns
 * every property in one response and has no page parameter, so slicing locally is what keeps
 * the first paint to twelve cards instead of a hundred.
 */
export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const criteria = criteriaFromSearchParams(toSearchParams(params));
  const type = readType(params.type);

  const all = await getProperties();
  const properties = all.filter(
    (property) =>
      (type === null || property.type === type) &&
      (criteria.destination === null || property.location === criteria.destination),
  );

  const pageCount = Math.max(1, Math.ceil(properties.length / PAGE_SIZE));
  // Clamped rather than 404'd: a stale `?page=9` after a filter narrows the list is a link
  // someone shared, and the last page of results is a better answer than a dead end.
  const page = Math.min(readPage(params.page), pageCount);
  const start = (page - 1) * PAGE_SIZE;
  const visible = properties.slice(start, start + PAGE_SIZE);

  function hrefFor(target: number): string {
    const next = toSearchParams(params);
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `/properties?${query}` : "/properties";
  }

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-label text-brand-600 uppercase dark:text-brand-300">
          {criteria.destination ?? "All of Bali"}
        </p>
        <h1 className="font-display text-display-lg text-fg">
          {properties.length} {properties.length === 1 ? "place" : "places"} to stay
        </h1>
        {properties.length > PAGE_SIZE ? (
          <p className="tabular text-body-sm text-fg-muted">
            Showing {start + 1}–{start + visible.length} of {properties.length}
          </p>
        ) : null}
      </header>

      {properties.length === 0 ? (
        <p className="mt-12 text-body text-fg-muted">
          Nothing matches that combination yet. Try a different area or clear the filters.
        </p>
      ) : (
        <>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((property, index) => (
              <li key={property.id}>
                <PropertyCard
                  property={property}
                  priority={page === 1 && index < 4}
                  className="h-full"
                />
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            pageCount={pageCount}
            hrefFor={hrefFor}
            label="Property results pages"
          />
        </>
      )}
    </div>
  );
}
