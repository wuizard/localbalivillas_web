"use client";

import { BedDouble, Loader2, X } from "lucide-react";
import { useState } from "react";
import { lookupStay, type StayWindow } from "../api/stay";

function formatRange(stay: StayWindow) {
  const opts = { day: "numeric", month: "short", timeZone: "UTC" } as const;
  const from = new Date(`${stay.checkIn}T00:00:00.000Z`).toLocaleDateString("en-GB", opts);
  const to = new Date(`${stay.checkOut}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    ...opts,
    year: "numeric",
  });
  return `${from} – ${to}`;
}

/**
 * Lets a guest who already has a villa booking pull their stay dates into the
 * calendar, rather than working out which Tuesday they mean while on holiday.
 *
 * Finding a stay narrows nothing: the whole calendar stays clickable, because the
 * guest may well be booking for a different trip, or for someone else.
 */
export function StayLookup({
  stay,
  onFound,
  onClear,
}: {
  stay: StayWindow | null;
  onFound: (stay: StayWindow) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!bookingId.trim() || !email.trim()) return;

    setPending(true);
    setError(null);
    try {
      const found = await lookupStay({ bookingId, email });
      onFound(found);
      setOpen(false);
    } catch {
      // The server deliberately gives one message for every failure, so this must
      // not guess at a more specific one.
      setError("We could not find a stay with those details. Check both and try again.");
    } finally {
      setPending(false);
    }
  }

  if (stay) {
    return (
      <div className="border-border bg-surface-muted mt-4 rounded-md border p-3">
        <div className="flex items-center gap-2">
          <BedDouble size={15} strokeWidth={1.8} className="text-fg-muted shrink-0" aria-hidden />
          <p className="text-label text-fg-muted uppercase">Your stay</p>
          <button
            type="button"
            onClick={() => {
              onClear();
              setBookingId("");
              setEmail("");
            }}
            className="text-body-sm text-fg-muted hover:text-fg ml-auto flex items-center gap-1 underline"
          >
            <X size={13} strokeWidth={2} aria-hidden />
            Clear
          </button>
        </div>

        {stay.propertyName ? (
          <p className="text-body-sm text-fg mt-1.5 font-medium">{stay.propertyName}</p>
        ) : null}
        <p className="text-body-sm text-fg tabular">{formatRange(stay)}</p>
        <p className="text-body-sm text-fg-muted mt-1">Ringed on the calendar.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-body-sm text-fg-muted hover:text-fg mt-4 flex items-center gap-1.5 underline"
      >
        <BedDouble size={15} strokeWidth={1.8} aria-hidden />
        Already booked a villa with us? Use your stay dates
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="border-border bg-surface-muted mt-4 rounded-md border p-3"
    >
      <div className="flex items-center gap-2">
        <BedDouble size={15} strokeWidth={1.8} className="text-fg-muted shrink-0" aria-hidden />
        <p className="text-label text-fg-muted uppercase">Find your stay</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          aria-label="Close"
          className="text-fg-muted hover:text-fg ml-auto"
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <p className="text-body-sm text-fg-muted mt-1.5">
        Both are on your confirmation email.
      </p>

      {/* Always stacked. This sits in the 22rem calendar column, so a viewport
          breakpoint would put two fields and a button in ~110px each and clip the
          longer placeholder — the container is narrow even when the window is not. */}
      <div className="mt-3 flex flex-col gap-2">
        <input
          value={bookingId}
          onChange={(event) => {
            setBookingId(event.target.value);
            setError(null);
          }}
          placeholder="Booking ID"
          aria-label="Booking ID"
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
        />
        <input
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          type="email"
          placeholder="Email on the booking"
          aria-label="Email on the booking"
          autoComplete="email"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending || !bookingId.trim() || !email.trim()}
          className="bg-brand-500 text-label hover:bg-brand-600 flex h-11 items-center justify-center gap-2 rounded-sm font-semibold tracking-[0.08em] text-white uppercase transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
          Find my dates
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-body-sm text-danger mt-2">
          {error}
        </p>
      ) : null}
    </form>
  );
}

const inputClass =
  "h-11 w-full min-w-0 rounded-sm border border-border bg-surface px-3 text-body text-fg " +
  "placeholder:text-fg-subtle focus:border-brand-400 focus:outline-none";
