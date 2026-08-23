import { apiGet } from "@/shared/api";
import { env } from "@/shared/config/env";
import type { PropertySummary } from "../types";
import {
  propertyCapacitySchema,
  propertyListSchema,
  toMaxGuests,
  toPropertySummary,
} from "./schemas";

const PROPERTIES_REVALIDATE_SECONDS = 300;

/** Stable hash of the property key, so a demo rating never changes between renders. */
function hash(value: string): number {
  let out = 0;
  for (let i = 0; i < value.length; i += 1) out = (out * 31 + value.charCodeAt(i)) >>> 0;
  return out;
}

/**
 * DEMO RATINGS. There are no reviews in the system, so `rating` is always null from the
 * API and the card's rating row never renders. With `DEMO_CONTENT` on, a stable score is
 * synthesised purely so the card design can be judged. Delete this once
 * `GET /reviews/:propertyId` returns data.
 */
function withDemoRating(property: PropertySummary): PropertySummary {
  if (!env.demoContent) return property;

  const seed = hash(property.key);
  return {
    ...property,
    rating: {
      average: 4.5 + ((seed >> 3) % 6) / 10,
      count: 24 + (seed % 140),
    },
  };
}

export async function getProperties(): Promise<PropertySummary[]> {
  const raw = await apiGet("/properties/list", propertyListSchema, {
    revalidate: PROPERTIES_REVALIDATE_SECONDS,
    tags: ["properties"],
  });

  return raw
    .filter((item) => item.isActive !== false)
    .map(toPropertySummary)
    .map(withDemoRating);
}

async function withCapacity(property: PropertySummary): Promise<PropertySummary> {
  try {
    const payload = await apiGet(`/property/${property.key}`, propertyCapacitySchema, {
      revalidate: PROPERTIES_REVALIDATE_SECONDS,
      tags: ["properties", `property:${property.key}`],
    });
    return { ...property, maxGuests: toMaxGuests(payload) };
  } catch {
    // Occupancy is a nice-to-have on a card; a missing room document must not blank the shelf.
    return property;
  }
}

/**
 * Home-page shelf. The API has no editorial "featured" flag, so stand in for one:
 * best-photographed property per area, four different areas, cheapest first — a shelf
 * that opens on IDR 1.2m converts better than one that opens on IDR 24m.
 */
export async function getFeaturedProperties(limit = 4): Promise<PropertySummary[]> {
  const properties = await getProperties();

  const byLocation = new Map<string, PropertySummary>();
  for (const property of properties) {
    if (property.images.length === 0 || property.fromPrice === null) continue;
    const held = byLocation.get(property.location);
    if (!held || held.images.length < property.images.length) {
      byLocation.set(property.location, property);
    }
  }

  const featured = [...byLocation.values()]
    .sort((a, b) => b.images.length - a.images.length)
    .slice(0, limit)
    .sort((a, b) => (a.fromPrice ?? 0) - (b.fromPrice ?? 0));

  return Promise.all(featured.map(withCapacity));
}

/** Editorial picks for the home page, resolved by key with a graceful fallback. */
export async function getPropertiesByKey(keys: readonly string[]): Promise<PropertySummary[]> {
  const properties = await getProperties();
  const index = new Map(properties.map((property) => [property.key, property]));

  return keys
    .map((key) => index.get(key))
    .filter((property): property is PropertySummary => property !== undefined);
}
