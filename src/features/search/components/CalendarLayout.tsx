"use client";

import { Calendar, RangeCalendar } from "@heroui/react";
import type { CalendarDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

/**
 * HeroUI 3's calendars are headless compounds — an empty `<Calendar />` renders nothing.
 * These two wrappers are the one place that composition lives, so the single-date pickers
 * in the desktop search bar and the mobile range calendar stay visually identical.
 */

function NavHeader({ Root }: { Root: typeof Calendar | typeof RangeCalendar }) {
  return (
    <Root.Header className="mb-2 flex items-center justify-between gap-2">
      <Root.NavButton slot="previous" aria-label="Previous month">
        <ChevronLeft size={18} aria-hidden />
      </Root.NavButton>
      <Root.Heading className="font-display text-title text-fg" />
      <Root.NavButton slot="next" aria-label="Next month">
        <ChevronRight size={18} aria-hidden />
      </Root.NavButton>
    </Root.Header>
  );
}

export function StayCalendar(props: ComponentProps<typeof Calendar<CalendarDate>>) {
  return (
    <Calendar {...props}>
      <NavHeader Root={Calendar} />
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => (
            <Calendar.HeaderCell className="text-label text-fg-muted uppercase">
              {day}
            </Calendar.HeaderCell>
          )}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}

export function StayRangeCalendar(props: ComponentProps<typeof RangeCalendar<CalendarDate>>) {
  return (
    <RangeCalendar {...props}>
      <NavHeader Root={RangeCalendar} />
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => (
            <RangeCalendar.HeaderCell className="text-label text-fg-muted uppercase">
              {day}
            </RangeCalendar.HeaderCell>
          )}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}
