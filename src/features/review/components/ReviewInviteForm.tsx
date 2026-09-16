"use client";

import { AlertCircle, Check, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { submitReviewInvite } from "../api/invite";
import type { ReviewInvite } from "../types";

const RATING_LABELS = ["Poor", "Fair", "Good", "Great", "Perfect"];
const MAX_LENGTH = 2000;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
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

function StarPicker({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  invalid: boolean;
}) {
  // Hovering previews a score without committing it; touch devices never set this, so
  // the committed value has to be what renders when it is null.
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? value;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label="Rating out of five"
        aria-required="true"
        aria-invalid={invalid || undefined}
        className="flex items-center gap-1"
        onMouseLeave={() => setPreview(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"} — ${RATING_LABELS[star - 1]}`}
            disabled={disabled}
            onMouseEnter={() => setPreview(star)}
            onFocus={() => setPreview(star)}
            onBlur={() => setPreview(null)}
            onClick={() => onChange(star)}
            className={cn(
              "focus-visible:outline-brand-500 -ml-1 rounded-full p-2 first:ml-0",
              "duration-[120ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2",
              "motion-safe:transition-transform motion-safe:enabled:hover:scale-110",
              "disabled:cursor-not-allowed motion-safe:enabled:active:scale-[.97]",
            )}
          >
            <Star
              size={36}
              strokeWidth={1.4}
              aria-hidden
              className={cn(
                "transition-colors duration-[120ms]",
                star <= shown
                  ? "fill-brand-500 text-brand-500"
                  : "text-brand-200 dark:text-brand-700",
              )}
            />
          </button>
        ))}
      </div>
      {/* Fixed height so committing a rating cannot shift the textarea under the cursor. */}
      <p
        className={cn("text-body-sm h-5 pl-1", shown ? "text-fg font-medium" : "text-fg-subtle")}
        aria-live="polite"
      >
        {shown ? RATING_LABELS[shown - 1] : "Choose a rating"}
      </p>
    </div>
  );
}

export function ReviewInviteForm({ token, invite }: { token: string; invite: ReviewInvite }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ReviewInvite | null>(
    invite.status === "submitted" ? invite : null,
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    if (!rating) {
      setError("Choose a rating first — one star to five.");
      return;
    }
    if (!body.trim()) {
      setError("Write a few words about the stay so other guests know what to expect.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await submitReviewInvite(token, { rating, review: body.trim() });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(result.invite);
    // The heading above is server-rendered and still asks how the stay was. Refresh so
    // the page speaks with one voice; this card is already showing the thank-you.
    router.refresh();
  }

  if (done) {
    const submitted = done.submitted;
    return (
      <div className="border-border bg-surface rounded-[var(--radius-md)] border p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <p className="text-label text-brand-600 dark:text-brand-300 flex items-center gap-2 uppercase">
          <span className="bg-brand-50 dark:bg-brand-900/40 flex size-7 items-center justify-center rounded-full">
            <Check size={15} strokeWidth={2.4} aria-hidden />
          </span>
          Received
        </p>

        <p className="text-body text-fg-muted mt-4">
          It will appear on {done.propertyName || "the villa's page"} once our team has had a look.
          We publish reviews as they are written — we don&apos;t edit them.
        </p>

        {submitted ? (
          <figure className="border-border mt-6 border-t pt-5">
            <Stars value={submitted.rating} />
            <blockquote className="text-body text-fg mt-3 whitespace-pre-wrap">
              {submitted.body}
            </blockquote>
          </figure>
        ) : null}
      </div>
    );
  }

  const remaining = MAX_LENGTH - body.length;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="border-border bg-surface flex flex-col gap-7 rounded-[var(--radius-md)] border p-6 shadow-[var(--shadow-sm)] sm:p-8"
    >
      {/* The page heading already asks the question; this is the field label, not a
          second ask. */}
      <fieldset>
        <legend className="text-title text-fg font-semibold">Your rating</legend>
        <p className="text-body-sm text-fg-muted mt-1 mb-3">Five stars is perfect, one is poor.</p>
        <StarPicker
          value={rating}
          onChange={(next) => {
            setRating(next);
            if (error) setError(null);
          }}
          disabled={pending}
          invalid={Boolean(error) && !rating}
        />
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-title text-fg font-semibold">In your own words</span>
        <span className="text-body-sm text-fg-muted mb-1.5">
          What stood out — the villa, the team, the location? Anything a guest deciding on it would
          want to know.
        </span>
        <textarea
          value={body}
          onChange={(event) => {
            setBody(event.target.value.slice(0, MAX_LENGTH));
            if (error) setError(null);
          }}
          rows={7}
          disabled={pending}
          aria-describedby={error ? "review-error" : undefined}
          className={cn(
            "border-border bg-surface text-body text-fg placeholder:text-fg-subtle",
            "focus:border-brand-400 focus:ring-brand-400/20 w-full resize-y rounded-sm border",
            "px-3.5 py-3 transition-colors focus:ring-2 focus:outline-none",
          )}
          placeholder="We arrived late and the team had the pool lit and dinner waiting…"
        />
        <span
          className={cn(
            "text-body-sm self-end tabular-nums",
            remaining < 100 ? "text-fg-muted" : "text-transparent",
          )}
          aria-hidden={remaining >= 100}
        >
          {remaining} characters left
        </span>
      </label>

      {error ? (
        <p
          id="review-error"
          role="alert"
          className="text-body-sm text-danger flex items-start gap-2"
        >
          <AlertCircle size={16} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "bg-brand-500 text-label hover:bg-brand-600 flex h-12 items-center justify-center",
            "gap-2 rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase",
            "focus-visible:outline-brand-500 transition-colors duration-[120ms]",
            "focus-visible:outline-2 focus-visible:outline-offset-2",
            "disabled:opacity-70 motion-safe:active:scale-[.97]",
          )}
        >
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          {pending ? "Sending" : "Send review"}
        </button>
        <p className="text-body-sm text-fg-subtle text-center">
          Published with the name on your booking. Your email, dates and what you paid are never
          shown.
        </p>
      </div>
    </form>
  );
}
