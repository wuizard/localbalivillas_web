"use client";

import { DatePicker, ListBox, Select } from "@heroui/react";
import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { BedDouble, CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { StayCalendar } from "./CalendarLayout";
import { searchHref } from "../lib/query";
import { bedroomSummary, type Destination } from "../types";
import { BedroomPicker } from "./BedroomPicker";
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
  const [bedrooms, setBedrooms] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const {
    isOpen: isBedroomsOpen,
    setOpen: setBedroomsOpen,
    containerRef: bedroomsRef,
    triggerRef: bedroomsTriggerRef,
  } = useDismissable<HTMLDivElement>();
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

  function handleCheckOut(next: CalendarDate | null) {
    // The picker's own minValue already refuses these, but a keyboard-typed date does not
    // go through the calendar — clamp rather than emit a zero-night search.
    if (next && checkIn && next.compare(checkIn) <= 0) {
      setCheckOut(checkIn.add({ days: 1 }));
      return;
    }
    setCheckOut(next);
  }

  function submit() {
    router.push(
      searchHref({
        destination,
        checkIn: checkIn?.toString() ?? null,
        checkOut: checkOut?.toString() ?? null,
        bedrooms,
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
        initial={{ destination, checkIn, checkOut, bedrooms, adults, children }}
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
          "grid-cols-[1.15fr_0.8fr_1fr_0.95fr_0.95fr_auto] items-stretch",
          // Crisper than the DESIGN.md `lg` radius: at 70px tall, 22px reads as a pill.
          "bg-surface ring-border/70 rounded-[14px] p-1.5 shadow-lg ring-1",
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
          <Select.Trigger className="hover:bg-surface-muted/70 h-full w-full rounded-md border-0 bg-transparent p-0 text-left shadow-none ring-0">
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

        <div className="border-border relative border-l">
          <button
            type="button"
            ref={bedroomsTriggerRef}
            aria-label={`Bedrooms, ${bedroomSummary(bedrooms) ?? "any"}`}
            aria-expanded={isBedroomsOpen}
            aria-haspopup="dialog"
            onClick={() => setBedroomsOpen(!isBedroomsOpen)}
            className="hover:bg-surface-muted/70 h-full w-full rounded-md text-left"
          >
            <SearchSegment icon={BedDouble} label="Bedrooms">
              <SegmentValue value={bedroomSummary(bedrooms)} placeholder="Any" />
            </SearchSegment>
          </button>

          {isBedroomsOpen ? (
            <div
              ref={bedroomsRef}
              role="dialog"
              aria-label="Bedrooms"
              className="border-border bg-surface absolute top-[calc(100%+12px)] left-0 z-30 w-80 rounded-lg border p-5 shadow-lg"
            >
              <p className="text-body-sm text-fg-muted mb-3">Minimum bedrooms you need</p>
              <BedroomPicker value={bedrooms} onChange={setBedrooms} />
            </div>
          ) : null}
        </div>

        <div className="border-border relative border-l">
          <button
            type="button"
            ref={guestsTriggerRef}
            aria-label={`Guests, ${guestSummary(adults, children)}`}
            aria-expanded={isGuestsOpen}
            aria-haspopup="dialog"
            onClick={() => setGuestsOpen(!isGuestsOpen)}
            className="hover:bg-surface-muted/70 h-full w-full rounded-md text-left"
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
              className="border-border bg-surface absolute top-[calc(100%+12px)] right-0 z-30 w-80 rounded-lg border p-5 shadow-lg"
            >
              <GuestStepper
                label="Adults"
                hint="Ages 13 or above"
                value={adults}
                min={1}
                max={MAX_ADULTS}
                onChange={setAdults}
              />
              <div className="bg-border h-px" />
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

        <DateField
          label="Check-in"
          value={checkIn}
          onChange={handleCheckIn}
          minValue={now}
          className="border-border border-l"
        />

        <DateField
          label="Check-out"
          value={checkOut}
          onChange={handleCheckOut}
          minValue={checkIn?.add({ days: 1 }) ?? now.add({ days: 1 })}
          className="border-border border-l"
        />

        <button
          type="submit"
          aria-label="Search villas"
          className={cn(
            // mr-4 balances the 16px inset the first segment gives the left edge.
            "bg-brand-500 my-auto mr-4 ml-2 flex h-10 items-center justify-center gap-2 rounded-sm px-5",
            "text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
            "transition-[background-color,transform] duration-[120ms] ease-out",
            "hover:bg-brand-600 active:scale-[0.97]",
            "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
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
        className="hover:bg-surface-muted/70 h-full w-full rounded-md text-left"
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
