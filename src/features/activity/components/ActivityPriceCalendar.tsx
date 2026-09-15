"use client";

import { Calendar, useLocale } from "@heroui/react";
import type { CalendarDate, DateValue } from "@internationalized/date";
import { getLocalTimeZone, parseDate, startOfMonth, today } from "@internationalized/date";
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

/**
 * One month. Extracted so the second month is the same grid at an offset rather than a
 * second copy of the cell rendering, which would be free to drift away from the first.
 */
function MonthGrid({
  byDate,
  stayDays,
  offset,
}: {
  byDate: Map<string, ActivityDay>;
  stayDays?: Set<string> | null;
  offset?: { months: number };
}) {
  return (
    <Calendar.Grid offset={offset}>
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
            className={cn("group", stayDays?.has(iso(date)) && "ring-brand-400 rounded-sm ring-1")}
          >
            <DayContents date={date} byDate={byDate} inStay={stayDays?.has(iso(date)) ?? false} />
          </Calendar.Cell>
        )}
      </Calendar.GridBody>
    </Calendar.Grid>
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
  months = 1,
}: {
  days: ActivityDay[];
  byDate: Map<string, ActivityDay>;
  selected: string | null;
  focused?: string | null;
  stayDays?: Set<string> | null;
  onSelect: (date: string) => void;
  onFocusedChange?: (date: string) => void;
  /** Months painted side by side. The caller decides from the viewport, because
   *  `visibleDuration` is a prop and no Tailwind variant can reach it. */
  months?: 1 | 2;
}) {
  const now = today(getLocalTimeZone());
  const { locale } = useLocale();

  // Availability is only loaded for a window. Bounding the calendar to it stops the
  // guest paging into months where every day would render as unavailable for no
  // reason other than that we never asked the server about them.
  const first = days[0]?.date;
  const last = days[days.length - 1]?.date;
  const minValue = first && parseDate(first).compare(now) > 0 ? parseDate(first) : now;
  const maxValue = last ? parseDate(last) : undefined;

  // Calendar.Heading is react-aria's, and it names only the first visible month - with
  // two on screen that leaves the right-hand one unlabelled. So the pair is labelled
  // here instead, from the same focused date the grids align themselves to.
  const anchor = startOfMonth(focused ? parseDate(focused) : (selected ? parseDate(selected) : minValue));
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const monthLabel = (offset: number) =>
    monthFormat.format(anchor.add({ months: offset }).toDate(getLocalTimeZone()));

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
      visibleDuration={{ months }}
      // Page by one month, not by the whole visible pair. The default pages by
      // `visibleDuration`, which disables the arrow whenever the next *two* months
      // would leave the loaded window - so with a 60-day window the tail of it
      // (November, here) could not be reached at all. Advancing a month at a time also
      // keeps a month on screen across a page, so the eye has something to hold on to.
      pageBehavior="single"
    >
      {/* With two months the arrows are pinned to the outer edges instead of sitting in
          the flow, so each month's name can centre over its own grid rather than being
          pushed inward by the width of a button. With one month the header keeps its
          original shape - react-aria's heading takes the free space and reads left, so
          an absolute arrow would sit underneath it. */}
      <Calendar.Header
        className={cn(
          "mb-2 flex items-center gap-2",
          months === 2 ? "relative justify-center" : "justify-between",
        )}
      >
        <Calendar.NavButton
          slot="previous"
          aria-label="Previous month"
          className={cn(months === 2 && "absolute left-0")}
        >
          <ChevronLeft size={18} aria-hidden />
        </Calendar.NavButton>

        {months === 2 ? (
          <div className="grid w-full grid-cols-2 gap-6">
            {[0, 1].map((offset) => (
              <span key={offset} className="font-display text-title text-fg text-center">
                {monthLabel(offset)}
              </span>
            ))}
          </div>
        ) : (
          <Calendar.Heading className="font-display text-title text-fg" />
        )}

        <Calendar.NavButton
          slot="next"
          aria-label="Next month"
          className={cn(months === 2 && "absolute right-0")}
        >
          <ChevronRight size={18} aria-hidden />
        </Calendar.NavButton>
      </Calendar.Header>

      {/* `items-start` is load-bearing. Stretched to a shared height, a 5-week month
          grows its rows to match a 6-week one - and since a day cell is square, that
          extra height comes back as extra width and the month overflows into its
          neighbour. Let each size to its own weeks instead; uneven bottoms are normal
          for a two-month calendar. */}
      <div className={cn(months === 2 && "grid grid-cols-2 items-start gap-6")}>
        <MonthGrid byDate={byDate} stayDays={stayDays} />
        {months === 2 ? (
          <MonthGrid byDate={byDate} stayDays={stayDays} offset={{ months: 1 }} />
        ) : null}
      </div>
    </Calendar>
  );
}
