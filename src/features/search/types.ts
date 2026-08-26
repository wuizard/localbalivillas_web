export type Destination = {
  id: string;
  name: string;
};

export type SearchCriteria = {
  /** Free-text villa name, as typed. `null` when the guest is browsing rather than hunting. */
  query: string | null;
  destination: string | null;
  checkIn: string | null;
  checkOut: string | null;
  /** Minimum bedrooms the guest needs. `0` means they did not say. */
  bedrooms: number;
  adults: number;
  children: number;
};

export const DEFAULT_CRITERIA: SearchCriteria = {
  query: null,
  destination: null,
  checkIn: null,
  checkOut: null,
  bedrooms: 0,
  adults: 2,
  children: 0,
};

export const MAX_BEDROOMS = 10;

export function bedroomSummary(bedrooms: number): string | null {
  if (bedrooms <= 0) return null;
  if (bedrooms >= MAX_BEDROOMS) return `${MAX_BEDROOMS}+ bedrooms`;
  return `${bedrooms} ${bedrooms === 1 ? "bedroom" : "bedrooms"}`;
}
