import Image from "next/image";
import { MapPin } from "lucide-react";
import type { ReviewInvite } from "../types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function stayRange(dates: string[]): string | null {
  const first = dates.at(0);
  const last = dates.at(-1);
  if (!first) return null;
  return last && last !== first ? `${formatDate(first)} – ${formatDate(last)}` : formatDate(first);
}

/** What is being reviewed, so the guest never has to remember which villa this was. */
export function StayCard({ invite }: { invite: ReviewInvite }) {
  const range = stayRange(invite.dates);
  // `dates` includes the checkout day, so nights are one fewer — the same rule the
  // pricing code follows.
  const nights = Math.max(invite.dates.length - 1, 0);

  return (
    <aside className="border-border bg-surface overflow-hidden rounded-[var(--radius-md)] border shadow-[var(--shadow-sm)]">
      {invite.propertyImage ? (
        <div className="relative aspect-[4/3] w-full lg:aspect-[3/2]">
          <Image
            src={invite.propertyImage}
            alt={invite.propertyName || "The villa you stayed at"}
            fill
            sizes="(min-width: 1024px) 20rem, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h2 className="font-display text-title text-fg">{invite.propertyName || "Your stay"}</h2>
          {range ? (
            <p className="text-body-sm text-fg-muted mt-1 flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.8} aria-hidden className="shrink-0" />
              {range}
              {nights > 0 ? ` · ${nights} ${nights === 1 ? "night" : "nights"}` : ""}
            </p>
          ) : null}
        </div>

        <dl className="border-border text-body-sm grid grid-cols-2 gap-y-2 border-t pt-3">
          {invite.guestName ? (
            <>
              <dt className="text-fg-muted">Booked by</dt>
              <dd className="text-fg text-right">{invite.guestName}</dd>
            </>
          ) : null}
          {invite.bookingId ? (
            <>
              <dt className="text-fg-muted">Reference</dt>
              <dd className="text-fg truncate text-right tabular-nums">{invite.bookingId}</dd>
            </>
          ) : null}
        </dl>
      </div>
    </aside>
  );
}
