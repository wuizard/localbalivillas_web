import { DEFAULT_CRITERIA, MAX_BEDROOMS, type SearchCriteria } from "../types";

/** Search state lives in the URL so results stay shareable and crawlable (CLAUDE.md §4). */
export function criteriaToSearchParams(criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams();
  if (criteria.query?.trim()) params.set("q", criteria.query.trim());
  if (criteria.destination) params.set("destination", criteria.destination);
  if (criteria.checkIn) params.set("checkIn", criteria.checkIn);
  // A check-out that is not after the check-in is not a stay; drop it rather than emit
  // a link that resolves to zero nights.
  if (criteria.checkOut && (!criteria.checkIn || criteria.checkOut > criteria.checkIn)) {
    params.set("checkOut", criteria.checkOut);
  }
  if (criteria.bedrooms > 0) params.set("bedrooms", String(criteria.bedrooms));
  if (criteria.adults !== DEFAULT_CRITERIA.adults) params.set("adults", String(criteria.adults));
  if (criteria.children > 0) params.set("children", String(criteria.children));
  return params;
}

export function searchHref(criteria: SearchCriteria, pathname = "/properties"): string {
  const query = criteriaToSearchParams(criteria).toString();
  return query ? `${pathname}?${query}` : pathname;
}

function positiveInt(value: string | null, fallback: number): number {
  // `Number(null)` and `Number("")` are both 0, not NaN, so an absent param has to be caught
  // before parsing — otherwise a link with no `adults` reads as zero adults and the default
  // never applies. `criteriaToSearchParams` omits the default, so absent is the common case.
  if (value === null || value.trim() === "") return fallback;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function criteriaFromSearchParams(params: URLSearchParams): SearchCriteria {
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  return {
    query: params.get("q")?.trim() || null,
    destination: params.get("destination"),
    checkIn,
    checkOut: checkOut && checkIn && checkOut <= checkIn ? null : checkOut,
    bedrooms: Math.min(MAX_BEDROOMS, positiveInt(params.get("bedrooms"), 0)),
    adults: Math.max(1, positiveInt(params.get("adults"), DEFAULT_CRITERIA.adults)),
    children: positiveInt(params.get("children"), 0),
  };
}
