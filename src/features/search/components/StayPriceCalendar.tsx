"use client";

import { RangeCalendar } from "@heroui/react";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { getLocalTimeZone, today } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isSoldOut, lowestRateOn, type PricedRoom } from "@/features/pricing";
import { cn } from "@/shared/lib/cn";
import { formatAmountCompact } from "@/shared/lib/format";

type StayPriceCalendarProps = {
  rooms: PricedRoom[];
  value: { start: CalendarDate; end: CalendarDate } | null;
  onChange: (range: { start: CalendarDate; end: CalendarDate } | null) => void;
};

function iso(date: DateValue): string {
  return date.toString().slice(0, 10);
}

/**
 * The range calendar from DESIGN.md §5: every day cell carries the lowest nightly rate that
 * is actually bookable, and a night with no room left is struck through, labelled Sold and
 * refused. Two months side by side from md, one below.
 *
 * Prices come from `features/pricing` — the calendar never computes a rate itself, so a cell
 * and the room card beneath it cannot disagree.
 */
export function StayPriceCalendar({ rooms, value, onChange }: StayPriceCalendarProps) {
  const now = today(getLocalTimeZone());

  return (
    <RangeCalendar
      aria-label="Stay dates"
      minValue={now}
      visibleDuration={{ months: 1 }}
      value={value}
      onChange={onChange}
      isDateUnavailable={(date) => isSoldOut(rooms, iso(date))}
    >
      <RangeCalendar.Header className="mb-2 flex items-center justify-between gap-2">
        <RangeCalendar.NavButton slot="previous" aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden />
        </RangeCalendar.NavButton>
        <RangeCalendar.Heading className="font-display text-title text-fg" />
        <RangeCalendar.NavButton slot="next" aria-label="Next month">
          <ChevronRight size={18} aria-hidden />
        </RangeCalendar.NavButton>
      </RangeCalendar.Header>

      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => (
            <RangeCalendar.HeaderCell className="text-label text-fg-muted uppercase">
              {day}
            </RangeCalendar.HeaderCell>
          )}
        </RangeCalendar.GridHeader>

        <RangeCalendar.GridBody>
          {(date) => {
            const key = iso(date);
            const soldOut = isSoldOut(rooms, key);
            const price = soldOut ? null : lowestRateOn(rooms, key);

            return (
              <RangeCalendar.Cell date={date}>
                <span className="flex flex-col items-center leading-none">
                  <span className={cn("text-body-sm", soldOut && "line-through")}>
                    {date.day}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 text-[9px] tracking-tight",
                      soldOut ? "text-fg-subtle" : "text-fg-muted",
                    )}
                  >
                    {soldOut ? "Sold" : price === null ? "" : formatAmountCompact(price)}
                  </span>
                </span>
              </RangeCalendar.Cell>
            );
          }}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}
