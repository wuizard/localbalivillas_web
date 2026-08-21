import { z } from "zod";
import { PROPERTY_TYPES, type PropertySummary, type PropertyType } from "../types";

/** The API hands back raw Mongo documents; map them here so `__v` never reaches a component. */
const propertyListItemSchema = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string(),
  type: z.string(),
  location: z.string().nullish(),
  region: z.string().nullish(),
  propertyImage: z.array(z.string()).nullish(),
  bedRooms: z.array(z.union([z.string(), z.number()])).nullish(),
  price: z.number().nullish(),
  isActive: z.boolean().nullish(),
});

export const propertyListSchema = z.array(propertyListItemSchema);

export type PropertyListItem = z.infer<typeof propertyListItemSchema>;

function toPropertyType(value: string): PropertyType {
  return (PROPERTY_TYPES as readonly string[]).includes(value)
    ? (value as PropertyType)
    : "villas";
}

export function toPropertySummary(raw: PropertyListItem): PropertySummary {
  const type = toPropertyType(raw.type);
  const key = raw.key.trim();

  const bedrooms = [
    ...new Set(
      (raw.bedRooms ?? [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  ].sort((a, b) => a - b);

  return {
    id: raw._id,
    key,
    name: raw.name.trim(),
    type,
    location: raw.location?.trim() ?? "Bali",
    region: raw.region?.trim() ?? "Bali",
    images: (raw.propertyImage ?? []).filter((url) => url.startsWith("http")),
    fromPrice: typeof raw.price === "number" && raw.price > 0 ? raw.price : null,
    bedrooms,
    maxGuests: null,
    rating: null,
    href: `/${type}/${key}`,
  };
}

/**
 * Occupancy lives on the room documents, which the list endpoint does not include.
 * Only the fields the card needs are modelled — the rest of the document is ignored.
 */
const roomCapacitySchema = z.object({
  room: z.number().nullish(),
  maximumGuest: z
    .object({
      adult: z.number().nullish(),
      child: z.number().nullish(),
      total: z.number().nullish(),
    })
    .nullish(),
});

export const propertyCapacitySchema = z.union([
  z.object({ rooms: z.array(roomCapacitySchema).nullish() }),
  z.array(z.object({ rooms: z.array(roomCapacitySchema).nullish() })),
]);

export function toMaxGuests(payload: z.infer<typeof propertyCapacitySchema>): number | null {
  const document = Array.isArray(payload) ? payload[0] : payload;
  const totals = (document?.rooms ?? [])
    .map((room) => room.maximumGuest?.total ?? room.maximumGuest?.adult ?? null)
    .filter((total): total is number => typeof total === "number" && total > 0);

  return totals.length > 0 ? Math.max(...totals) : null;
}
