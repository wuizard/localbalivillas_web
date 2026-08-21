import { apiGet } from "@/shared/api";
import type { GuestReview } from "../types";
import { PLACEHOLDER_REVIEWS } from "./placeholder-reviews";
import { reviewListSchema, toGuestReview } from "./schemas";

const REVIEWS_REVALIDATE_SECONDS = 900;

export type ReviewSource = {
  id: string;
  name: string;
  href: string;
};

async function getReviewsForProperty(source: ReviewSource): Promise<GuestReview[]> {
  try {
    const raw = await apiGet(`/reviews/${source.id}`, reviewListSchema, {
      revalidate: REVIEWS_REVALIDATE_SECONDS,
      tags: ["reviews", `reviews:${source.id}`],
    });

    return raw
      .map((review) => toGuestReview(review, { name: source.name, href: source.href }))
      .filter((review): review is GuestReview => review !== null);
  } catch {
    // One property's reviews failing must not take the whole wall down.
    return [];
  }
}

/** Beyond this the marquee track gets expensive to paint for no extra persuasion. */
export const MAX_WALL_REVIEWS = 12;

/** Newest first across every source, capped so the marquee track stays cheap to paint. */
export async function getGuestReviews(
  sources: ReviewSource[],
  limit = MAX_WALL_REVIEWS,
): Promise<GuestReview[]> {
  const batches = await Promise.all(sources.map(getReviewsForProperty));

  return batches
    .flat()
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, limit);
}

/**
 * Real reviews first, then demo cards to fill the wall up to `MAX_WALL_REVIEWS`. As the API
 * starts returning data the demo copy is pushed out one card at a time, and once there are
 * twelve real reviews none of it renders at all.
 *
 * Production shows only what the API returned — publishing invented reviews under a guest's
 * name is a consumer-protection problem, not a content gap. Delete the fallback, not the
 * guard, when the endpoint is populated.
 */
export async function getReviewsWithFallback(
  sources: ReviewSource[],
  limit = MAX_WALL_REVIEWS,
): Promise<GuestReview[]> {
  const real = await getGuestReviews(sources, limit);

  if (process.env.NODE_ENV === "production") return real;

  const shortfall = limit - real.length;
  if (shortfall <= 0) return real;

  // Attach the demo copy to properties that actually exist, so the cards link somewhere real.
  const filler = PLACEHOLDER_REVIEWS.slice(0, shortfall).map((review, index) => {
    const property = sources.length > 0 ? sources[index % sources.length] : undefined;
    return {
      ...review,
      propertyName: property?.name ?? null,
      propertyHref: property?.href ?? null,
    };
  });

  return [...real, ...filler];
}
