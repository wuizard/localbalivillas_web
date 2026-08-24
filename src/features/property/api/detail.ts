import { z } from "zod";
import type { PricedRoom } from "@/features/pricing";
import { apiGet, type RoomSnapshot } from "@/shared/api";
import { htmlToParagraphs } from "@/shared/lib/html";
import { toHouseRuleGroups } from "../lib/house-rules";
import {
  PROPERTY_TYPES,
  ROOM_FACILITIES,
  type PropertyDetail,
  type PropertyType,
  type RoomFacilityKey,
  type RoomOffer,
} from "../types";

const DETAIL_REVALIDATE_SECONDS = 300;

const priceRuleSchema = z.object({
  date: z.array(z.string()).nullish(),
  day: z.array(z.string()).nullish(),
  price: z.number(),
});

const roomSchema = z.object({
  _id: z.string(),
  name: z.string().nullish(),
  propertyImage: z.array(z.string()).nullish(),
  price: z.number().nullish(),
  priceList: z.array(priceRuleSchema).nullish(),
  disabledDate: z.array(z.string()).nullish(),
  room: z.number().nullish(),
  roomSize: z.string().nullish(),
  poolSize: z.string().nullish(),
  amenities: z.array(z.string()).nullish(),
  facilities: z.record(z.string(), z.boolean().nullish()).nullish(),
  maximumGuest: z
    .object({
      adult: z.number().nullish(),
      child: z.number().nullish(),
      total: z.number().nullish(),
    })
    .nullish(),
  isActive: z.boolean().nullish(),
  index: z.number().nullish(),
});

const detailSchema = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string(),
  type: z.string(),
  location: z.string().nullish(),
  region: z.string().nullish(),
  propertyImage: z.array(z.string()).nullish(),
  bedRooms: z.array(z.union([z.string(), z.number()])).nullish(),
  description: z.string().nullish(),
  houseRules: z.string().nullish(),
  mapInfo: z.string().nullish(),
  rooms: z.array(roomSchema).nullish(),
  isActive: z.boolean().nullish(),
});

/** Some endpoints hand back the document, others a single-element array. */
const detailPayloadSchema = z.union([detailSchema, z.array(detailSchema)]);

function toRoomOffer(raw: z.infer<typeof roomSchema>): RoomOffer {
  const facilities = raw.facilities ?? {};
  const basePrice = typeof raw.price === "number" && raw.price > 0 ? raw.price : null;

  const pricing: PricedRoom = {
    basePrice: basePrice ?? 0,
    priceRules: (raw.priceList ?? []).map((rule) => ({
      date: rule.date ?? null,
      day: rule.day ?? null,
      price: rule.price,
    })),
    disabledDates: raw.disabledDate ?? [],
  };

  /**
   * Carried through unmapped, because the booking endpoint stores it verbatim: it wants the
   * raw `facilities` object, and `propertyImage`/`room` under those names. Images here are
   * the room's own — the property-photo fallback below is a display convenience and has no
   * business in the record of what was booked.
   */
  const snapshot: RoomSnapshot = {
    propertyImage: raw.propertyImage ?? [],
    name: raw.name?.trim() || "Room",
    room: typeof raw.room === "number" ? raw.room : null,
    facilities: Object.fromEntries(
      Object.entries(facilities).map(([key, value]) => [key, value === true]),
    ),
    amenities: raw.amenities ?? [],
  };

  return {
    id: raw._id,
    name: raw.name?.trim() || "Room",
    images: (raw.propertyImage ?? []).filter((url) => url.startsWith("http")),
    basePrice,
    pricing,
    snapshot,
    bedrooms: typeof raw.room === "number" && raw.room > 0 ? raw.room : null,
    maxGuests: raw.maximumGuest?.total ?? raw.maximumGuest?.adult ?? null,
    roomSize: raw.roomSize?.trim() || null,
    poolSize: raw.poolSize?.trim() || null,
    amenities: (raw.amenities ?? []).map((item) => item.trim()).filter(Boolean),
    facilities: ROOM_FACILITIES.map((facility) => facility.key).filter(
      (key): key is RoomFacilityKey => facilities[key] === true,
    ),
  };
}

export async function getPropertyDetail(key: string): Promise<PropertyDetail | null> {
  let payload: z.infer<typeof detailPayloadSchema>;

  try {
    payload = await apiGet(`/property/${encodeURIComponent(key)}`, detailPayloadSchema, {
      revalidate: DETAIL_REVALIDATE_SECONDS,
      tags: ["properties", `property:${key}`],
    });
  } catch {
    return null;
  }

  const raw = Array.isArray(payload) ? payload[0] : payload;
  if (!raw || raw.isActive === false) return null;

  const type = (
    (PROPERTY_TYPES as readonly string[]).includes(raw.type) ? raw.type : "villas"
  ) as PropertyType;

  const bedrooms = [
    ...new Set(
      (raw.bedRooms ?? [])
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  ].sort((a, b) => a - b);

  const propertyImages = (raw.propertyImage ?? []).filter((url) => url.startsWith("http"));

  const rooms = (raw.rooms ?? [])
    .filter((room) => room.isActive !== false)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(toRoomOffer)
    .map((room) =>
      // Not every room type has its own gallery; the property's photos are of the same
      // place, so an empty card is worse than a representative one.
      room.images.length > 0 ? room : { ...room, images: propertyImages.slice(0, 6) },
    );

  const prices = rooms
    .map((room) => room.basePrice)
    .filter((price): price is number => price !== null);

  return {
    id: raw._id,
    key: raw.key.trim(),
    name: raw.name.trim(),
    type,
    location: raw.location?.trim() ?? "Bali",
    region: raw.region?.trim() ?? "Bali",
    images: propertyImages,
    fromPrice: prices.length > 0 ? Math.min(...prices) : null,
    bedrooms,
    maxGuests:
      rooms.reduce<number | null>(
        (max, room) => (room.maxGuests && room.maxGuests > (max ?? 0) ? room.maxGuests : max),
        null,
      ) ?? null,
    rating: null,
    href: `/${type}/${raw.key.trim()}`,
    description: htmlToParagraphs(raw.description),
    rooms,
    houseRuleGroups: toHouseRuleGroups(raw.houseRules),
    mapEmbedUrl: raw.mapInfo?.startsWith("https://www.google.com/maps/embed") ? raw.mapInfo : null,
  };
}
