"use client";

import { Calendar } from "@heroui/react";
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

type SingleProps = {
  rooms: PricedRoom[];
  value: CalendarDate | null;
  onChange: (next: CalendarDate) => void;
  minValue?: CalendarDate;
  label: string;
};

/**
 * One field, one date. The availability bar used a range calendar behind both the check-in
 * and the check-out trigger, so a click in the check-out popover restarted the range and
 * silently rewrote the check-in — picking a departure date was impossible.
 */
export function DayPriceCalendar({ rooms, value, onChange, minValue, label }: SingleProps) {
  const now = today(getLocalTimeZone());

  return (
    <Calendar
      aria-label={label}
      minValue={minValue ?? now}
      value={value}
      onChange={onChange}
      isDateUnavailable={(date) => isSoldOut(rooms, iso(date))}
    >
      <Calendar.Header className="mb-2 flex items-center justify-between gap-2">
        <Calendar.NavButton slot="previous" aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden />
        </Calendar.NavButton>
        <Calendar.Heading className="font-display text-title text-fg" />
        <Calendar.NavButton slot="next" aria-label="Next month">
          <ChevronRight size={18} aria-hidden />
        </Calendar.NavButton>
      </Calendar.Header>

      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => (
            <Calendar.HeaderCell className="text-label text-fg-muted uppercase">
              {day}
            </Calendar.HeaderCell>
          )}
        </Calendar.GridHeader>

        <Calendar.GridBody>
          {(date) => (
            <Calendar.Cell date={date}>
              <DayContents date={date} rooms={rooms} />
            </Calendar.Cell>
          )}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}
