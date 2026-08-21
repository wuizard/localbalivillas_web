import { Quote, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import type { GuestReview } from "../types";

/** Regional-indicator glyphs — a flag without shipping 250 images. */
function flagFor(countryCode: string | null): string | null {
  if (!countryCode || countryCode.length !== 2) return null;
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
  );
}

export function ReviewCard({ review }: { review: GuestReview }) {
  const flag = flagFor(review.countryCode);

  return (
    <figure className="flex h-full w-[19rem] shrink-0 flex-col gap-4 rounded-md border border-border bg-surface p-5 shadow-sm sm:w-[21rem]">
      <div className="flex items-center justify-between">
        <Rating value={review.rating} />
        <Quote size={18} className="text-brand-200 dark:text-brand-700" aria-hidden />
      </div>

      <blockquote className="line-clamp-5 flex-1 text-body text-fg">{review.body}</blockquote>

      <figcaption className="flex flex-col gap-0.5 border-t border-border pt-3">
        <span className="text-body-sm font-semibold text-fg">
          {flag ? <span aria-hidden>{flag} </span> : null}
          {review.author}
        </span>
        {review.country ? (
          <span className="text-body-sm text-fg-muted">{review.country}</span>
        ) : null}
        {review.propertyName && review.propertyHref ? (
          <Link
            href={review.propertyHref}
            className="mt-1 text-body-sm text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
          >
            {review.propertyName}
          </Link>
        ) : null}
      </figcaption>
    </figure>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          aria-hidden
          className={cn(
            star <= value ? "fill-brand-500 text-brand-500" : "text-brand-200 dark:text-brand-700",
          )}
        />
      ))}
    </span>
  );
}
