import { beforeEach, describe, expect, it, vi } from "vitest";

const apiGet = vi.fn();
vi.mock("@/shared/api", () => ({ apiGet: (...args: unknown[]) => apiGet(...args) }));

const { MAX_WALL_REVIEWS, getReviewsWithFallback } = await import("./queries");

const SOURCES = [
  { id: "p1", name: "Aksari Resort Ubud", href: "/resorts/aksari-resort-ubud" },
  { id: "p2", name: "Eight Palms Villa", href: "/villas/eight-palms-villa" },
];

function realReview(index: number) {
  return {
    _id: `real-${index}`,
    rating: 5,
    review: `Genuine guest review ${index}`,
    createdDate: `2026-08-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
    user: { name: `Guest ${index}`, country: { name: "Australia", iso2: "AU" } },
  };
}

/** One source answers with `count` reviews; the rest answer empty. */
function respondWith(count: number) {
  let served = false;
  apiGet.mockImplementation(() => {
    if (served) return Promise.resolve([]);
    served = true;
    return Promise.resolve(Array.from({ length: count }, (_, i) => realReview(i)));
  });
}

const isDemo = (id: string) => id.startsWith("demo-");

describe("getReviewsWithFallback", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fills the wall entirely with demo cards when the API has nothing", async () => {
    respondWith(0);

    const reviews = await getReviewsWithFallback(SOURCES);

    expect(reviews).toHaveLength(MAX_WALL_REVIEWS);
    expect(reviews.every((review) => isDemo(review.id))).toBe(true);
  });

  it("puts real reviews first and tops up to the maximum with demo cards", async () => {
    respondWith(3);

    const reviews = await getReviewsWithFallback(SOURCES);

    expect(reviews).toHaveLength(MAX_WALL_REVIEWS);
    expect(reviews.slice(0, 3).map((review) => review.id)).toEqual([
      "real-2",
      "real-1",
      "real-0",
    ]);
    expect(reviews.slice(3).every((review) => isDemo(review.id))).toBe(true);
  });

  it("drops the demo cards once there are enough real reviews", async () => {
    respondWith(MAX_WALL_REVIEWS);

    const reviews = await getReviewsWithFallback(SOURCES);

    expect(reviews).toHaveLength(MAX_WALL_REVIEWS);
    expect(reviews.some((review) => isDemo(review.id))).toBe(false);
  });

  it("never exceeds the wall maximum when the API has more than it can show", async () => {
    respondWith(MAX_WALL_REVIEWS + 5);

    const reviews = await getReviewsWithFallback(SOURCES);

    expect(reviews).toHaveLength(MAX_WALL_REVIEWS);
    expect(reviews.some((review) => isDemo(review.id))).toBe(false);
  });

  it("points demo cards at properties that actually exist", async () => {
    respondWith(0);

    const reviews = await getReviewsWithFallback(SOURCES);

    expect(reviews[0]?.propertyHref).toBe(SOURCES[0]?.href);
    expect(reviews[1]?.propertyHref).toBe(SOURCES[1]?.href);
  });
});
