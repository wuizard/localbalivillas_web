"use client";

import { getLocalTimeZone, parseDate, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarDays, Search, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { countNights, stayDays, type PricedRoom } from "@/features/pricing";
import { cn } from "@/shared/lib/cn";
import { criteriaFromSearchParams } from "../lib/query";
import { StayPriceCalendar } from "./StayPriceCalendar";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN } from "./GuestPicker";

const EDITOR_ID = "availability-editor";

function formatDay(date: CalendarDate): string {
  return format(date.toDate(getLocalTimeZone()), "EEE, d MMM");
}

/** 375px has room for one of the two, not both: the weekday is what a phone drops first. */
function formatDayShort(date: CalendarDate): string {
  return format(date.toDate(getLocalTimeZone()), "d MMM");
}

function stayLabelWith(
  formatter: (date: CalendarDate) => string,
  { checkIn, checkOut }: Stay,
): string {
  if (!checkIn) return "Add dates";
  return checkOut ? `${formatter(checkIn)} – ${formatter(checkOut)}` : formatter(checkIn);
}

/** A hand-edited or stale `?checkIn=` must not throw the whole strip out of the tree. */
function readDate(value: string | null): CalendarDate | null {
  if (!value) return null;
  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

type Stay = {
  checkIn: CalendarDate | null;
  checkOut: CalendarDate | null;
  adults: number;
  children: number;
};

/**
 * The stay the page is currently priced for — read from the URL, never from local state, so
 * a link arriving from the results page opens already showing the dates and party it was
 * searched with (CLAUDE.md §4).
 *
 * The params are read through the same codec the results page writes, so a stay cannot mean
 * one thing on the way out of search and another on the way into a property.
 */
function readStay(params: URLSearchParams): Stay {
  const criteria = criteriaFromSearchParams(params);

  return {
    checkIn: readDate(criteria.checkIn),
    checkOut: readDate(criteria.checkOut),
    adults: criteria.adults,
    children: criteria.children,
  };
}

/**
 * The property page's stay summary: dates and party on one horizontal row, with the editor
 * folded away until asked for. Room count is deliberately absent — a room is chosen on the
 * room card that quotes it, so asking for a quantity before the guest has seen the rooms
 * asks the same question twice and lets the two answers disagree.
 */
export function AvailabilityBar({ roomPricing = [] }: { roomPricing?: PricedRoom[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const committed = useMemo(() => readStay(new URLSearchParams(params.toString())), [params]);

  const [isEditing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Stay>(committed);

  useEffect(() => {
    if (!isEditing) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setEditing(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isEditing]);

  const guests = committed.adults + committed.children;
  const hasStay = committed.checkIn !== null && committed.checkOut !== null;
  const nights =
    committed.checkIn && committed.checkOut
      ? countNights(stayDays(committed.checkIn.toString(), committed.checkOut.toString()))
      : 0;

  const stayLabel = stayLabelWith(formatDay, committed);
  const stayLabelShort = stayLabelWith(formatDayShort, committed);

  const draftRange =
    draft.checkIn && draft.checkOut ? { start: draft.checkIn, end: draft.checkOut } : null;

  function toggleEditor() {
    // Reopening always starts from what the page is priced for, so an abandoned edit cannot
    // leave a draft that silently disagrees with the rates on screen.
    if (!isEditing) setDraft(committed);
    setEditing(!isEditing);
  }

  function submit() {
    const next = new URLSearchParams(params.toString());
    if (draft.checkIn) next.set("checkIn", draft.checkIn.toString());
    else next.delete("checkIn");
    if (draft.checkOut && draft.checkIn && draft.checkOut.compare(draft.checkIn) > 0) {
      next.set("checkOut", draft.checkOut.toString());
    } else next.delete("checkOut");
    next.set("adults", String(draft.adults));
    if (draft.children > 0) next.set("children", String(draft.children));
    else next.delete("children");
    // Room quantity belongs to the room card that quotes it; clear any inherited from a link.
    next.delete("rooms");

    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setEditing(false);
  }

  return (
    <form
      role="search"
      aria-label="Check availability"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="bg-surface ring-border/70 rounded-md shadow-lg ring-1"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 md:px-5 md:py-3">
        <button
          type="button"
          onClick={toggleEditor}
          aria-expanded={isEditing}
          aria-controls={isEditing ? EDITOR_ID : undefined}
          aria-label={`Stay dates, ${
            hasStay ? stayLabel : "not chosen"
          }. ${guests} ${guests === 1 ? "guest" : "guests"}. Edit`}
          className={cn(
            "hover:bg-surface-muted/60 -mx-1.5 flex min-w-0 flex-1 items-center gap-2.5",
            "rounded-sm px-1.5 py-1 text-left transition-colors duration-[120ms] ease-out",
            "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          <CalendarDays
            size={18}
            strokeWidth={1.7}
            aria-hidden
            className="text-brand-500 shrink-0"
          />
          <span
            className={cn(
              "text-body min-w-0 truncate font-semibold",
              hasStay ? "text-fg" : "text-fg-subtle",
            )}
          >
            <span className="sm:hidden">{stayLabelShort}</span>
            <span className="max-sm:hidden">{stayLabel}</span>
          </span>

          {nights > 0 ? (
            <span className="text-body-sm text-fg-muted hidden shrink-0 md:inline">
              · {nights} {nights === 1 ? "night" : "nights"}
            </span>
          ) : null}

          <span className="border-border flex shrink-0 items-center gap-1.5 border-l pl-2.5">
            <User size={17} strokeWidth={1.7} aria-hidden className="text-brand-500" />
            <span className="tabular text-body text-fg font-semibold">{guests}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={toggleEditor}
          aria-expanded={isEditing}
          aria-controls={isEditing ? EDITOR_ID : undefined}
          className={cn(
            "text-body-sm text-brand-600 dark:text-brand-300 shrink-0 rounded-sm px-1 py-1 font-semibold",
            "focus-visible:outline-brand-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          {isEditing ? "Close" : hasStay ? "Change search" : "Select dates"}
        </button>
      </div>

      {/* Mounted on open, not merely hidden: a prerendered calendar spends the page's first
          bytes on a month nobody asked for, and react-aria's own day labels do not survive
          hydration identically when the server and the browser disagree on locale data. */}
      {isEditing ? (
        <div id={EDITOR_ID} className="border-border border-t p-4 md:p-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-8">
            <StayPriceCalendar
              rooms={roomPricing}
              value={draftRange}
              onChange={(range) =>
                setDraft((current) => ({ ...current, checkIn: range.start, checkOut: range.end }))
              }
            />

            <div className="flex flex-col">
              <GuestStepper
                label="Adults"
                hint="Ages 13 or above"
                value={draft.adults}
                min={1}
                max={MAX_ADULTS}
                onChange={(adults) => setDraft((current) => ({ ...current, adults }))}
              />
              <div className="bg-border h-px" />
              <GuestStepper
                label="Children"
                hint="Ages 0 to 12"
                value={draft.children}
                min={0}
                max={MAX_CHILDREN}
                onChange={(children) => setDraft((current) => ({ ...current, children }))}
              />

              <button
                type="submit"
                className={cn(
                  "bg-brand-500 mt-5 flex h-11 items-center justify-center gap-2 rounded-sm px-6",
                  "text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
                  "transition-[background-color,transform] duration-[120ms] ease-out",
                  "hover:bg-brand-600 active:scale-[0.98]",
                  "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
                  "md:mt-auto md:self-start",
                )}
              >
                <Search size={15} strokeWidth={2.4} aria-hidden />
                Check availability
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
