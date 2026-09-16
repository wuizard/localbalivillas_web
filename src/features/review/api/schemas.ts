import { z } from "zod";
import type { GuestReview, ReviewInvite, ReviewInviteStatus } from "../types";

const reviewSchema = z.object({
  _id: z.string(),
  rating: z.union([z.number(), z.string()]).nullish(),
  review: z.string().nullish(),
  createdDate: z.string().nullish(),
  /** Set on reviews left through a review link, where the stay had no account. */
  guestName: z.string().nullish(),
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
    author: raw.user?.name?.trim() || raw.guestName?.trim() || "Verified guest",
    country: raw.user?.country?.name?.trim() ?? null,
    countryCode: raw.user?.country?.iso2?.trim().toUpperCase() ?? null,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    body,
    date: raw.createdDate ?? null,
    propertyName: property?.name ?? null,
    propertyHref: property?.href ?? null,
  };
}

const INVITE_STATUSES = ["open", "submitted", "expired", "revoked"] as const;

export const reviewInviteSchema = z.object({
  propertyName: z.string().nullish(),
  propertyImage: z.string().nullish(),
  guestName: z.string().nullish(),
  dates: z.array(z.string()).nullish(),
  bookingId: z.string().nullish(),
  status: z.string(),
  review: z
    .object({
      rating: z.union([z.number(), z.string()]).nullish(),
      review: z.string().nullish(),
      createdDate: z.string().nullish(),
    })
    .nullish(),
});

type RawInvite = z.infer<typeof reviewInviteSchema>;

export function toReviewInvite(raw: RawInvite): ReviewInvite {
  const rating = Number(raw.review?.rating);
  const body = raw.review?.review?.trim();

  // An unrecognised status is treated as unusable rather than open: the failure mode of
  // guessing wrong is a guest typing out a review the API will refuse.
  const status = (INVITE_STATUSES as readonly string[]).includes(raw.status)
    ? (raw.status as ReviewInviteStatus)
    : "revoked";

  // Only https URLs: next/image is configured for the S3 hosts, and anything else
  // (an empty string, a stray relative path) would render a broken frame.
  const image = raw.propertyImage?.trim();

  return {
    propertyName: raw.propertyName?.trim() ?? "",
    propertyImage: image && image.startsWith("https://") ? image : null,
    guestName: raw.guestName?.trim() ?? "",
    dates: raw.dates ?? [],
    bookingId: raw.bookingId?.trim() ?? "",
    status,
    submitted: body
      ? {
          rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
          body,
          date: raw.review?.createdDate ?? null,
        }
      : null,
  };
}
