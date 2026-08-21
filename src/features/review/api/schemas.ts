import { z } from "zod";
import type { GuestReview } from "../types";

const reviewSchema = z.object({
  _id: z.string(),
  rating: z.union([z.number(), z.string()]).nullish(),
  review: z.string().nullish(),
  createdDate: z.string().nullish(),
  user: z
    .object({
      name: z.string().nullish(),
      country: z
        .object({
          name: z.string().nullish(),
          iso2: z.string().nullish(),
        })
        .nullish(),
    })
    .nullish(),
});

export const reviewListSchema = z.array(reviewSchema);

type RawReview = z.infer<typeof reviewSchema>;

export function toGuestReview(
  raw: RawReview,
  property: { name: string; href: string } | null,
): GuestReview | null {
  const body = raw.review?.trim();
  const rating = Number(raw.rating);
  if (!body) return null;

  return {
    id: raw._id,
    author: raw.user?.name?.trim() || "Verified guest",
    country: raw.user?.country?.name?.trim() ?? null,
    countryCode: raw.user?.country?.iso2?.trim().toUpperCase() ?? null,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    body,
    date: raw.createdDate ?? null,
    propertyName: property?.name ?? null,
    propertyHref: property?.href ?? null,
  };
}
