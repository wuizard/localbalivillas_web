import { DEFAULT_CRITERIA, type SearchCriteria } from "../types";

/** Search state lives in the URL so results stay shareable and crawlable (CLAUDE.md §4). */
export function criteriaToSearchParams(criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams();
  if (criteria.destination) params.set("destination", criteria.destination);
  if (criteria.checkIn) params.set("checkIn", criteria.checkIn);
  if (criteria.checkOut) params.set("checkOut", criteria.checkOut);
  if (criteria.adults !== DEFAULT_CRITERIA.adults) params.set("adults", String(criteria.adults));
  if (criteria.children > 0) params.set("children", String(criteria.children));
  return params;
}

export function searchHref(criteria: SearchCriteria, pathname = "/properties"): string {
  const query = criteriaToSearchParams(criteria).toString();
  return query ? `${pathname}?${query}` : pathname;
}

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

export function criteriaFromSearchParams(params: URLSearchParams): SearchCriteria {
  return {
    destination: params.get("destination"),
    checkIn: params.get("checkIn"),
    checkOut: params.get("checkOut"),
    adults: Math.max(1, positiveInt(params.get("adults"), DEFAULT_CRITERIA.adults)),
    children: positiveInt(params.get("children"), 0),
  };
}
