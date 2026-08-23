export type Destination = {
  id: string;
  name: string;
};

export type SearchCriteria = {
  destination: string | null;
  checkIn: string | null;
  checkOut: string | null;
  /** Minimum bedrooms the guest needs. `0` means they did not say. */
  bedrooms: number;
  adults: number;
  children: number;
};

export const DEFAULT_CRITERIA: SearchCriteria = {
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
