"use client";

import { RangeCalendar } from "@heroui/react";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { getLocalTimeZone, today } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isSoldOut, lowestRateOn, type PricedRoom } from "@/features/pricing";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";

function iso(date: DateValue): string {
  return date.toString().slice(0, 10);
}

/**
 * Every day cell carries the lowest nightly rate that is actually bookable, and a night with
 * no room left is struck through, labelled Sold and refused.
 *
 * Prices come from `features/pricing` — the calendar never computes a rate itself, so a cell
 * and the room card beneath it cannot disagree.
 */
function DayContents({ date, rooms }: { date: DateValue; rooms: PricedRoom[] }) {
  const { formatCompact } = useCurrency();
  const key = iso(date);
  const soldOut = isSoldOut(rooms, key);
  const price = soldOut ? null : lowestRateOn(rooms, key);

  return (
    <span className="flex flex-col items-center leading-none">
      <span className={cn("text-body-sm", soldOut && "line-through")}>{date.day}</span>
      <span
        className={cn(
          "mt-0.5 text-[9px] tracking-tight",
          soldOut ? "text-fg-subtle" : "text-fg-muted",
        )}
      >
        {soldOut ? "Sold" : price === null ? "" : formatCompact(price)}
      </span>
    </span>
  );
}

type StayRange = { start: CalendarDate; end: CalendarDate };

/**
 * One calendar, both ends. A guest picking a stay picks a stay — arrival then departure in
 * two taps on one grid, with the nights between them filled in. Splitting it into a
 * check-in picker and a check-out picker made each field truthful in isolation and the
 * range invisible.
 */
export function StayPriceCalendar({
  rooms,
  value,
  onChange,
}: {
  rooms: PricedRoom[];
  value: StayRange | null;
  onChange: (range: StayRange) => void;
}) {
  const now = today(getLocalTimeZone());

  return (
    <RangeCalendar
      aria-label="Stay dates"
      className="calendar-full"
      minValue={now}
      value={value}
      onChange={(range) => {
        // Tapping one day twice is a same-day range in react-aria, which is zero nights.
        // Read it as "one night from here" rather than a stay nobody can book.
        const end = range.end.compare(range.start) <= 0 ? range.start.add({ days: 1 }) : range.end;
        onChange({ start: range.start, end });
      }}
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
          {(date) => (
            <RangeCalendar.Cell date={date}>
              <DayContents date={date} rooms={rooms} />
            </RangeCalendar.Cell>
          )}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}
