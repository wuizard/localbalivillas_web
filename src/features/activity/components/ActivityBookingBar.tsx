"use client";

import { CalendarDays, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Money } from "@/shared/currency";
import type { ActivityDay } from "../api/availability";
import { stayDates, type StayWindow } from "../api/stay";
import { ActivityPriceCalendar } from "./ActivityPriceCalendar";
import { StayLookup } from "./StayLookup";
import { quoteActivity } from "../lib/quote";
import { partySizeLabel } from "../lib/format";
import type { ActivityDetail } from "../types";

export function ActivityBookingBar({
  activity,
  days,
}: {
  activity: ActivityDetail;
  days: ActivityDay[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const byDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);

  const firstOpen = days.find((day) => day.available)?.date ?? null;

  // URL is the source of truth so a chosen date and party survive a share or a
  // reload, the way search state does everywhere else in this app. A link carrying a
  // date that is blocked, in the past, or beyond the window we loaded falls back to
  // the first open one — the alternative told the guest nothing was available when
  // the calendar beside it plainly showed otherwise.
  const requested = params.get("date");
  const selected = requested && byDate.get(requested)?.available ? requested : firstOpen;
  const adults = Math.max(1, Number(params.get("adult")) || activity.pricing.minPax || 1);
  const children = Math.max(0, Number(params.get("child")) || 0);

  // Which month the calendar is showing. Controlled so a stay lookup can move it.
  const [focused, setFocused] = useState<string | null>(selected);
  const [stay, setStay] = useState<StayWindow | null>(null);
  const stayDays = useMemo(() => (stay ? new Set(stayDates(stay)) : null), [stay]);

  const setParam = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) next.set(key, String(value));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Finding a stay jumps to it and picks the first day that is actually running
  // inside it. If none of the stay is bookable the dates are still ringed, so the
  // guest can see for themselves that the trip does not run while they are here.
  const applyStay = (found: StayWindow) => {
    setStay(found);
    const withinStay = stayDates(found);
    const firstOpenInStay = withinStay.find((date) => byDate.get(date)?.available);
    const target = firstOpenInStay ?? withinStay[0];
    if (!target) return;

    setFocused(target);
    if (firstOpenInStay) setParam({ date: firstOpenInStay });
  };

  const selectedDay = selected ? byDate.get(selected) : undefined;

  const quote = selectedDay
    ? quoteActivity({
        rules: activity.priceRules,
        base: { ...activity.pricing, adult: selectedDay.adult, child: selectedDay.child },
        date: selectedDay.date,
        party: { adult: adults, child: children },
      })
    : null;

  const maxPax = activity.pricing.maxPax;
  const partyFull = maxPax !== null && adults + children >= maxPax;
  const perGroup = activity.pricing.basis === "per_group";

  return (
    <section
      id="dates"
      className="border-border bg-surface scroll-mt-24 rounded-md border p-5 shadow-sm md:p-6"
    >
      <h2 className="font-display text-display-sm text-fg">Pick a date</h2>
      <p className="text-body-sm text-fg-muted mt-1">
        Prices change by day. Choose a date and party size to see the total.
      </p>

      {/* Fixed columns, not fractions — the same reason AvailabilityBar gives: a day
          cell is `aspect-ratio: 1/1` at full column width, so a `1fr` column on a wide
          screen makes every cell as tall as it is wide and the month becomes enormous. */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[22rem_20rem] lg:items-start lg:gap-8">
        <div className="w-full max-w-[22rem]">
          <ActivityPriceCalendar
            days={days}
            byDate={byDate}
            selected={selected}
            focused={focused}
            stayDays={stayDays}
            onSelect={(date) => setParam({ date })}
            onFocusedChange={setFocused}
          />

          <p className="text-body-sm text-fg-subtle mt-3 flex items-center gap-2">
            <CalendarDays size={14} strokeWidth={1.8} aria-hidden />
            Crossed-out days aren&rsquo;t running.
          </p>

          <StayLookup stay={stay} onFound={applyStay} onClear={() => setStay(null)} />
        </div>

        <div className="border-border bg-surface-muted flex flex-col gap-4 rounded-md border p-4">
          <Stepper
            label="Adults"
            value={adults}
            min={1}
            disabledUp={partyFull}
            onChange={(value) => setParam({ adult: value })}
          />
          <Stepper
            label={activity.childMaxAge ? `Children (up to ${activity.childMaxAge})` : "Children"}
            value={children}
            min={0}
            disabledUp={partyFull}
            onChange={(value) => setParam({ child: value })}
          />

          {partyFull ? (
            <p className="text-body-sm text-fg-muted">
              {maxPax} is the most this activity takes at once. For larger groups, message us and
              we&rsquo;ll arrange a second departure.
            </p>
          ) : (
            <p className="text-body-sm text-fg-subtle">{partySizeLabel(activity.pricing)}</p>
          )}

          <div className="border-border border-t pt-4">
            {quote ? (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-body-sm text-fg-muted">
                    {perGroup ? "Total for the group" : "Total"}
                  </span>
                  <Money amount={quote.total} className="tabular text-price text-fg" />
                </div>

                {!perGroup ? (
                  <p className="text-body-sm text-fg-subtle mt-2">
                    {quote.chargedAdults} × <Money amount={quote.rates.adult} />
                    {children > 0 ? (
                      <>
                        {" + "}
                        {children} × <Money amount={quote.rates.child} />
                      </>
                    ) : null}
                  </p>
                ) : null}

                {quote.minimumApplied ? (
                  <p className="text-body-sm text-fg-muted mt-2">
                    This activity has a minimum of {activity.pricing.minPax}, so that is what
                    you&rsquo;re quoted, and you don&rsquo;t need to bring more people.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-body-sm text-fg-muted">
                No dates are open in this window. Message us and we&rsquo;ll find one.
              </p>
            )}
          </div>

          {selected && quote ? (
            <Link
              href={`/activities/${activity.key}/book?date=${selected}&adult=${adults}&child=${children}`}
              className="bg-brand-500 text-label hover:bg-brand-600 flex h-12 items-center justify-center rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase transition-colors"
            >
              Book now
            </Link>
          ) : (
            <a
              href="#enquire"
              className="border-brand-500 text-label text-brand-600 dark:text-brand-300 flex h-12 items-center justify-center rounded-sm border px-6 font-semibold tracking-[0.08em] uppercase"
            >
              Ask about a date
            </a>
          )}

          <p className="text-body-sm text-fg-subtle text-center">
            Free cancellation up to 48 hours before. Nothing is held until you pay.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stepper({
  label,
  value,
  min,
  disabledUp,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  disabledUp?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-body-sm text-fg">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`One fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="border-border text-fg hover:border-brand-400 flex size-8 items-center justify-center rounded-full border disabled:opacity-30"
        >
          <Minus size={14} aria-hidden />
        </button>
        <span className="tabular text-body text-fg w-5 text-center">{value}</span>
        <button
          type="button"
          aria-label={`One more ${label.toLowerCase()}`}
          disabled={disabledUp}
          onClick={() => onChange(value + 1)}
          className="border-border text-fg hover:border-brand-400 flex size-8 items-center justify-center rounded-full border disabled:opacity-30"
        >
          <Plus size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
