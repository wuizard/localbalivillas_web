import { SectionHeading } from "@/shared/ui";
import type { GuestReview } from "../types";
import { ReviewCard } from "./ReviewCard";

type ReviewWallProps = {
  reviews: GuestReview[];
};

/** Slower with more cards, so the apparent speed stays constant as the wall grows. */
const SECONDS_PER_CARD = 7;

export function ReviewWall({ reviews }: ReviewWallProps) {
  if (reviews.length === 0) return null;

  const duration = `${reviews.length * SECONDS_PER_CARD}s`;

  return (
    <section aria-labelledby="guest-reviews" className="overflow-hidden py-14 md:py-20">
      <div className="container-page">
        <SectionHeading eyebrow="What our guests say" title="Stories from their stay" />
        <h2 id="guest-reviews" className="sr-only">
          Guest reviews
        </h2>
      </div>

      <div className="marquee marquee-mask mt-10">
        <div className="marquee-track gap-5" style={{ ["--marquee-duration" as string]: duration }}>
          <ul className="flex gap-5 pl-5 max-md:pr-5">
            {reviews.map((review) => (
              <li key={review.id} className="flex">
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>

          {/* The duplicate exists only so the loop has no seam; screen readers read the
              list once and keyboard users tab through the first copy only. Below md there
              is no loop — the rail is thumb-driven — so the second copy is just twice as
              far to swipe. */}
          <ul className="flex gap-5 pl-5 max-md:hidden" aria-hidden inert>
            {reviews.map((review) => (
              <li key={`echo-${review.id}`} className="flex">
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
