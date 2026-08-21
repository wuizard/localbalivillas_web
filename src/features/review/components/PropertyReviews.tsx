"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { GuestReview } from "../types";

type PropertyReviewsProps = {
  reviews: GuestReview[];
  propertyName: string;
};

const INITIAL_VISIBLE = 4;

/** Regional-indicator glyphs — a flag without shipping 250 images. */
function flagFor(countryCode: string | null): string | null {
  if (!countryCode || countryCode.length !== 2) return null;
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
  );
}

function initialOf(author: string): string {
  return author.trim().charAt(0).toUpperCase() || "G";
}

function monthOf(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * A comment list, not the home page's drifting rail. The home wall is a glance — "people
 * like this brand". This is a read — "is this particular villa any good?" — and reviews are
 * the most persuasive text on the page, so nothing here is clipped or hidden behind a swipe.
 */
export function PropertyReviews({ reviews, propertyName }: PropertyReviewsProps) {
  const [expanded, setExpanded] = useState(false);

  if (reviews.length === 0) return null;

  const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const hidden = reviews.length - visible.length;

  return (
    <section aria-labelledby="guest-reviews" className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="guest-reviews" className="font-display text-display-sm text-fg">
            What guests say
          </h2>
          <p className="mt-1 text-body text-fg-muted">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"} for {propertyName}
          </p>
        </div>

        <p className="flex items-center gap-2">
          <Stars value={Math.round(average)} size={16} />
          <span className="tabular text-price text-fg">{average.toFixed(1)}</span>
          <span className="sr-only">out of 5</span>
        </p>
      </div>

      <ul className="mt-6 md:mt-8 md:grid md:grid-cols-2 md:gap-x-10">
        {visible.map((review) => {
          const flag = flagFor(review.countryCode);
          const month = monthOf(review.date);

          return (
            <li key={review.id} className="border-t border-border py-5 first:border-t-0 md:py-6">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-title text-brand-700 dark:bg-brand-800 dark:text-brand-200"
                >
                  {initialOf(review.author)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-body font-semibold text-fg">
                      {flag ? <span aria-hidden>{flag} </span> : null}
                      {review.author}
                    </p>
                    <Stars value={review.rating} size={13} />
                  </div>

                  <p className="mt-0.5 text-body-sm text-fg-muted">
                    {[review.country, month].filter(Boolean).join(" · ")}
                  </p>

                  <p className="mt-2.5 text-body leading-relaxed text-fg">{review.body}</p>

                  {review.propertyName && review.propertyHref ? (
                    <Link
                      href={review.propertyHref}
                      className="mt-2 inline-block text-body-sm text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
                    >
                      {review.propertyName}
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 h-11 rounded-sm border border-brand-500 px-6 text-label font-semibold tracking-[0.08em] text-brand-600 uppercase transition-colors duration-[120ms] hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5"
        >
          Show all {reviews.length} reviews
        </button>
      ) : null}
    </section>
  );
}

function Stars({ value, size }: { value: number; size: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="flex shrink-0 items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          aria-hidden
          className={cn(
            star <= value ? "fill-brand-500 text-brand-500" : "text-brand-200 dark:text-brand-700",
          )}
        />
      ))}
    </span>
  );
}
