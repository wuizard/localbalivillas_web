import { z } from "zod";
import { apiGet } from "@/shared/api";
import type { Destination } from "../types";

const LOCATIONS_REVALIDATE_SECONDS = 3600;

const locationSchema = z.object({
  _id: z.string(),
  locationName: z.string(),
  isActive: z.boolean().nullish(),
  isDeleted: z.boolean().nullish(),
});

const locationListSchema = z.array(locationSchema);

export async function getDestinations(): Promise<Destination[]> {
  const raw = await apiGet("/region/location", locationListSchema, {
    revalidate: LOCATIONS_REVALIDATE_SECONDS,
    tags: ["locations"],
  });

  return raw
    .filter((item) => item.isActive !== false && item.isDeleted !== true)
    .map((item) => ({ id: item._id, name: item.locationName.trim() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
