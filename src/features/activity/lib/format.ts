import type { ActivityPricing } from "../types";

/** "7 hours", "1 hr 30 min", "90 min" — whichever reads shortest at that length. */
export function formatDuration(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours} hr ${rest} min`;
}

/**
 * What the "from" price means depends on the basis, and getting it wrong is a
 * complaint: IDR 450,000 per car and IDR 450,000 each are very different quotes.
 */
export function priceSuffix(pricing: ActivityPricing): string {
  return pricing.basis === "per_group" ? "/group" : "/person";
}

export function partySizeLabel(pricing: ActivityPricing): string | null {
  const { minPax, maxPax } = pricing;
  if (minPax && maxPax) return `${minPax}–${maxPax} people`;
  if (maxPax) return `Up to ${maxPax} people`;
  if (minPax) return `From ${minPax} people`;
  return null;
}
