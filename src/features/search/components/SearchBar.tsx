"use client";

import { DatePicker, ListBox, Select } from "@heroui/react";
import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { StayCalendar } from "./CalendarLayout";
import { searchHref } from "../lib/query";
import type { Destination } from "../types";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN, guestSummary } from "./GuestPicker";
import { SearchSegment, SegmentValue } from "./SearchSegment";
import { SearchSheet } from "./SearchSheet";

type SearchBarProps = {
  destinations: Destination[];
  className?: string;
};

function formatDay(date: CalendarDate | null): string | null {
  return date ? format(date.toDate(getLocalTimeZone()), "EEE, d MMM") : null;
}

export function SearchBar({ destinations, className }: SearchBarProps) {
  const router = useRouter();
  const now = today(getLocalTimeZone());

  const [destination, setDestination] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<CalendarDate | null>(null);
  const [checkOut, setCheckOut] = useState<CalendarDate | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const {
    isOpen: isGuestsOpen,
    setOpen: setGuestsOpen,
    containerRef: guestsRef,
    triggerRef: guestsTriggerRef,
  } = useDismissable<HTMLDivElement>();

  function handleCheckIn(next: CalendarDate | null) {
    setCheckIn(next);
    // A check-out on or before the new check-in is no longer a stay.
    if (next && checkOut && checkOut.compare(next) <= 0) setCheckOut(null);
  }

  function submit() {
    router.push(
      searchHref({
        destination,
        checkIn: checkIn?.toString() ?? null,
        checkOut: checkOut?.toString() ?? null,
        adults,
        children,
      }),
    );
  }

  return (
    <>
      {/* Mobile: one tappable row that opens a full-screen sheet. */}
      <SearchSheet
        destinations={destinations}
        className={cn("md:hidden", className)}
        initial={{ destination, checkIn, checkOut, adults, children }}
      />

      <form
        role="search"
        aria-label="Search villas"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn(
          "hidden md:grid",
          "grid-cols-[1.3fr_1fr_1fr_1.1fr_auto] items-stretch",
          // Crisper than the DESIGN.md `lg` radius: at 70px tall, 22px reads as a pill.
          "rounded-[14px] bg-surface p-1.5 shadow-lg ring-1 ring-border/70",
          className,
        )}
      >
        <Select
          aria-label="Destination"
          placeholder="Search destination"
          selectedKey={destination}
          onSelectionChange={(key) => setDestination(key === null ? null : String(key))}
        >
          {/* HeroUI styles its select trigger as a standalone field — background, ring and
              shadow. Inside the search bar that reads as a card floating on a card, so the
              chrome is stripped back to match the plain date and guest segments. */}
          <Select.Trigger className="h-full w-full rounded-md border-0 bg-transparent p-0 text-left shadow-none ring-0 hover:bg-surface-muted/70">
            <SearchSegment icon={MapPin} label="Where are you going?">
              <SegmentValue value={destination} placeholder="Search destination" />
            </SearchSegment>
          </Select.Trigger>
          <Select.Popover className="min-w-64">
            <ListBox items={destinations}>
              {(item: Destination) => <ListBox.Item id={item.name}>{item.name}</ListBox.Item>}
            </ListBox>
          </Select.Popover>
        </Select>

        <DateField
          label="Check-in"
          value={checkIn}
          onChange={handleCheckIn}
          minValue={now}
          className="border-l border-border"
        />

        <DateField
          label="Check-out"
          value={checkOut}
          onChange={setCheckOut}
          minValue={checkIn?.add({ days: 1 }) ?? now.add({ days: 1 })}
          className="border-l border-border"
        />

        <div className="relative border-l border-border">
          <button
            type="button"
            ref={guestsTriggerRef}
            aria-label={`Guests, ${guestSummary(adults, children)}`}
            aria-expanded={isGuestsOpen}
            aria-haspopup="dialog"
            onClick={() => setGuestsOpen(!isGuestsOpen)}
            className="h-full w-full rounded-md text-left hover:bg-surface-muted/70"
          >
            <SearchSegment icon={Users} label="Guests">
              <SegmentValue
                value={adults + children > 0 ? guestSummary(adults, children) : null}
                placeholder="Add guests"
              />
            </SearchSegment>
          </button>

          {isGuestsOpen ? (
            <div
              ref={guestsRef}
              role="dialog"
              aria-label="Guests"
              className="absolute top-[calc(100%+12px)] right-0 z-30 w-80 rounded-lg border border-border bg-surface p-5 shadow-lg"
            >
              <GuestStepper
                label="Adults"
                hint="Ages 13 or above"
                value={adults}
                min={1}
                max={MAX_ADULTS}
                onChange={setAdults}
              />
              <div className="h-px bg-border" />
              <GuestStepper
                label="Children"
                hint="Ages 0–12"
                value={children}
                min={0}
                max={MAX_CHILDREN}
                onChange={setChildren}
              />
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          aria-label="Search villas"
          className={cn(
            // mr-4 balances the 16px inset the first segment gives the left edge.
            "my-auto mr-4 ml-2 flex h-10 items-center justify-center gap-2 rounded-sm bg-brand-500 px-5",
            "text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
            "transition-[background-color,transform] duration-[120ms] ease-out",
            "hover:bg-brand-600 active:scale-[0.97]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          )}
        >
          <Search size={15} strokeWidth={2.4} aria-hidden className="lg:hidden" />
          <span className="hidden lg:inline">Search</span>
        </button>
      </form>
    </>
  );
}

type DateFieldProps = {
  label: string;
  value: CalendarDate | null;
  onChange: (next: CalendarDate | null) => void;
  minValue: CalendarDate;
  className?: string;
};

function DateField({ label, value, onChange, minValue, className }: DateFieldProps) {
  // This composition has no RAC date-input group, so the popover has nothing to anchor
  // to unless we hand it the trigger explicitly — without it, it renders at 0,0.
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DatePicker
      aria-label={label}
      value={value}
      onChange={onChange}
      minValue={minValue}
      className={className}
    >
      <DatePicker.Trigger
        ref={triggerRef}
        aria-label={label}
        className="h-full w-full rounded-md text-left hover:bg-surface-muted/70"
      >
        <SearchSegment icon={CalendarDays} label={label}>
          <SegmentValue value={formatDay(value)} placeholder="Add date" />
        </SearchSegment>
      </DatePicker.Trigger>
      <DatePicker.Popover triggerRef={triggerRef} placement="bottom start" offset={12}>
        {/* HeroUI's calendar root takes minValue as its own prop rather than inheriting
            the picker's, so unavailable days stay selectable unless it is passed here too. */}
        <StayCalendar aria-label={label} minValue={minValue} />
      </DatePicker.Popover>
    </DatePicker>
  );
}
