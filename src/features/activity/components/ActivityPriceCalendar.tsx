"use client";

import { Calendar } from "@heroui/react";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";
import type { ActivityDay } from "../api/availability";

function iso(date: DateValue): string {
  return date.toString().slice(0, 10);
}

/**
 * The same calendar the villa search uses (`StayPriceCalendar`), as a single-date
 * picker — an activity runs on one day, so there is no range to drag.
 *
 * Day cells carry the adult rate for that date and a day the activity is not running
 * is struck through and refused, matching how a sold-out night reads on a villa.
 */
function DayContents({
  date,
  byDate,
  inStay,
}: {
  date: DateValue;
  byDate: Map<string, ActivityDay>;
  inStay: boolean;
}) {
  const { formatCompact } = useCurrency();
  const day = byDate.get(iso(date));
  const closed = !day?.available;

  return (
    <span className="flex flex-col items-center leading-none">
      <span className={cn("text-body-sm", closed && "line-through", inStay && "font-semibold")}>
        {date.day}
      </span>
      {/* On a selected day the cell paints its own background and text colour, and
          that pairing flips between themes — the dark-mode accent is a light brown
          with dark text. So inherit the cell's colour and just soften it, rather than
          naming one that is only readable in one of the two. */}
      <span
        className={cn(
          "mt-0.5 text-[9px] tracking-tight",
          closed ? "text-fg-subtle" : "text-fg-muted",
          "group-data-[selected=true]:text-inherit",
        )}
      >
        {closed ? "" : formatCompact(day.adult)}
      </span>
    </span>
  );
}

export function ActivityPriceCalendar({
  days,
  byDate,
  selected,
  focused,
  stayDays,
  onSelect,
  onFocusedChange,
}: {
  days: ActivityDay[];
  byDate: Map<string, ActivityDay>;
  selected: string | null;
  focused?: string | null;
  stayDays?: Set<string> | null;
  onSelect: (date: string) => void;
  onFocusedChange?: (date: string) => void;
}) {
  const now = today(getLocalTimeZone());

  // Availability is only loaded for a window. Bounding the calendar to it stops the
  // guest paging into months where every day would render as unavailable for no
  // reason other than that we never asked the server about them.
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;
  const minValue = first && parseDate(first).compare(now) > 0 ? parseDate(first) : now;
  const maxValue = last ? parseDate(last) : undefined;

  return (
    <Calendar
      aria-label="Activity date"
      className="calendar-full"
      minValue={minValue}
      maxValue={maxValue}
      value={selected ? parseDate(selected) : null}
      focusedValue={focused ? parseDate(focused) : undefined}
      onFocusChange={(date) => onFocusedChange?.(iso(date))}
      onChange={(date: CalendarDate | null) => {
        if (date) onSelect(iso(date));
      }}
      isDateUnavailable={(date) => !byDate.get(iso(date))?.available}
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
            <Calendar.Cell
              date={date}
              // `group` so the price inside can react to the cell's own data-selected.
              className={cn(
                "group",
                stayDays?.has(iso(date)) && "ring-brand-400 rounded-sm ring-1",
              )}
            >
              <DayContents
                date={date}
                byDate={byDate}
                inStay={stayDays?.has(iso(date)) ?? false}
              />
            </Calendar.Cell>
          )}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}
