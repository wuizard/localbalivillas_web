import type { PricedRoom } from "@/features/pricing";
import type { RoomSnapshot } from "@/shared/api";

export const PROPERTY_TYPES = ["villas", "resorts", "hotels", "bamboo_house"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export type PropertySummary = {
  id: string;
  key: string;
  name: string;
  type: PropertyType;
  /** Area within the region, e.g. "Seminyak". */
  location: string;
  region: string;
  images: string[];
  /** Lowest nightly rate across the property's room types, IDR integer. */
  fromPrice: number | null;
  /** Distinct bedroom counts offered, ascending. */
  bedrooms: number[];
  /** Largest party the property can sleep. `null` when the API has not published it. */
  maxGuests: number | null;
  /** `null` until the reviews endpoint returns data — never render a placeholder score. */
  rating: { average: number; count: number } | null;
  href: string;
};

/** The facility flags the API publishes per room, in the order they read best on a card. */
export const ROOM_FACILITIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "airportShuttle", label: "Airport shuttle" },
  { key: "freeParking", label: "Free parking" },
  { key: "swimmingPool", label: "Private pool" },
  { key: "publicPool", label: "Public pool" },
  { key: "restaurant", label: "Restaurant" },
] as const;

export type RoomFacilityKey = (typeof ROOM_FACILITIES)[number]["key"];

export type RoomOffer = {
  id: string;
  name: string;
  images: string[];
  /** Base nightly rate in IDR, before any date or weekday override. */
  basePrice: number | null;
  /** Everything `features/pricing` needs to quote a stay. */
  pricing: PricedRoom;
  /** The raw fields `POST /booking/submit` stores; the display fields below cannot stand in. */
  snapshot: RoomSnapshot;
  bedrooms: number | null;
  maxGuests: number | null;
  roomSize: string | null;
  poolSize: string | null;
  amenities: string[];
  facilities: RoomFacilityKey[];
};

export type HouseRuleGroup = {
  id: string;
  title: string;
  rules: { id: string; label: string | null; value: string }[];
};

export type PropertyDetail = PropertySummary & {
  description: string[];
  rooms: RoomOffer[];
  houseRuleGroups: HouseRuleGroup[];
  /** Google Maps embed URL, or null when the property has no pin. */
  mapEmbedUrl: string | null;
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  villas: "Villa",
  resorts: "Resort",
  hotels: "Hotel",
  bamboo_house: "Bamboo House",
};

export function bedroomLabel(bedrooms: number[]): string | null {
  if (bedrooms.length === 0) return null;
  const min = bedrooms[0];
  const max = bedrooms[bedrooms.length - 1];
  if (min === undefined || max === undefined) return null;
  if (min === max) return `${min} ${min === 1 ? "Bedroom" : "Bedrooms"}`;
  return `${min}–${max} Bedrooms`;
}
