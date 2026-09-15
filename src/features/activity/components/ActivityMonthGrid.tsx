"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { ActivityDay } from "../api/availability";

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKeyOf(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year ?? 2026, (month ?? 1) - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Monday-first column for the 1st of the month, so the grid lines up with the header. */
function leadingBlanks(firstDate: string) {
  const day = new Date(`${firstDate}T00:00:00.000Z`).getUTCDay();
  return (day + 6) % 7;
}

/**
 * The hand-rolled activity month grid.
 *
 * Kept as an alternative to `ActivityPriceCalendar`, which is the one currently in
 * the page: the site uses the HeroUI calendar everywhere else, and a guest should not
 * meet two different date pickers on the same booking journey. This one is a plain
 * grid with no react-aria dependency, so it stays here as the fallback if the
 * HeroUI calendar ever needs to come out.
 */
export function ActivityMonthGrid({
  days,
  selected,
  stayDays,
  onSelect,
}: {
  days: ActivityDay[];
  selected: string | null;
  stayDays?: Set<string> | null;
  onSelect: (date: string) => void;
}) {
  const months = useMemo(() => {
    const grouped = new Map<string, ActivityDay[]>();
    for (const day of days) {
      const key = monthKeyOf(day.date);
      grouped.set(key, [...(grouped.get(key) ?? []), day]);
    }
    return [...grouped.entries()];
  }, [days]);

  const [monthIndex, setMonthIndex] = useState(() => {
    const index = months.findIndex(([key]) => key === monthKeyOf(selected ?? ""));
    return index >= 0 ? index : 0;
  });

  const [monthKey, monthDays] = months[monthIndex] ?? ["", []];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={monthIndex === 0}
          onClick={() => setMonthIndex((index) => Math.max(0, index - 1))}
          className="text-fg hover:bg-surface-muted flex size-9 items-center justify-center rounded-full disabled:opacity-30"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <p className="text-label text-fg uppercase">{monthLabel(monthKey)}</p>
        <button
          type="button"
          aria-label="Next month"
          disabled={monthIndex >= months.length - 1}
          onClick={() => setMonthIndex((index) => Math.min(months.length - 1, index + 1))}
          className="text-fg hover:bg-surface-muted flex size-9 items-center justify-center rounded-full disabled:opacity-30"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>

      <div className="text-label text-fg-subtle mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEK.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks(monthDays[0]?.date ?? "2026-01-01") }).map(
          (_, index) => (
            <span key={`blank-${index}`} />
          ),
        )}

        {monthDays.map((day) => {
          const isSelected = day.date === selected;
          const inStay = stayDays?.has(day.date) ?? false;
          return (
            <button
              key={day.date}
              type="button"
              disabled={!day.available}
              aria-pressed={isSelected}
              aria-label={`${day.date}${inStay ? ", during your stay" : ""}${day.available ? "" : day.past ? ", past" : ", not running"}`}
              onClick={() => onSelect(day.date)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-sm border text-center transition-colors",
                isSelected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : day.available
                    ? inStay
                      ? "border-brand-400 bg-brand-50 text-fg dark:bg-brand-500/10"
                      : "border-border hover:border-brand-400 text-fg"
                    : "text-fg-subtle cursor-not-allowed border-transparent line-through",
              )}
            >
              <span className="tabular text-body-sm leading-none font-medium">
                {Number(day.date.slice(8))}
              </span>
              {day.available ? (
                <span
                  className={cn(
                    "tabular mt-1 text-[10px] leading-none",
                    isSelected ? "text-white/80" : "text-fg-muted",
                  )}
                >
                  {Math.round(day.adult / 1000)}k
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
