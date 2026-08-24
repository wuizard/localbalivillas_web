import { propertyTypes } from "@/shared/config/site";

const PROPERTY_TYPE_SEGMENTS = new Set(propertyTypes.map((type) => type.value as string));

/** `/villas/the-cove-bali` and friends — a single property, not a listing. */
export function isPropertyDetail(pathname: string): boolean {
  const [, first, second] = pathname.split("/");
  return Boolean(first && second && PROPERTY_TYPE_SEGMENTS.has(first));
}

/**
 * Tabs or a back arrow, never neither and never both. The bar belongs to the four places it
 * can reach and the browsing pages beside them; a property page and the booking funnel are
 * somewhere the guest was *sent*, where four tabs are four ways to abandon a booking sitting
 * exactly where the reserve action wants to be. Those get a back control in the top bar
 * instead. (DESIGN.md §4.1 keeps the bar everywhere but `/booking/*`; this narrows it.)
 */
export function showsBottomNav(pathname: string): boolean {
  return !pathname.startsWith("/booking") && !isPropertyDetail(pathname);
}

/** Where back lands when the guest arrived from a shared link and has no history. */
export function backFallbackFor(pathname: string): string {
  const [, first] = pathname.split("/");
  return first && PROPERTY_TYPE_SEGMENTS.has(first) ? `/properties?type=${first}` : "/properties";
}
