"use client";

import { DatePicker } from "@heroui/react";
import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { BedDouble, CalendarDays, Search, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { StayCalendar } from "./CalendarLayout";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN, guestTotal } from "./GuestPicker";
import { SearchSegment, SegmentValue } from "./SearchSegment";

const MAX_ROOMS = 10;

function formatDay(date: CalendarDate | null): string | null {
  return date ? format(date.toDate(getLocalTimeZone()), "EEE, d MMM") : null;
}

/**
 * The property page's date and occupancy picker. It writes to the URL rather than to local
 * state so a chosen stay survives a refresh and can be shared — the same rule the results
 * page follows (CLAUDE.md §4).
 */
export function AvailabilityBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const now = today(getLocalTimeZone());
  const [checkIn, setCheckIn] = useState<CalendarDate | null>(null);
  const [checkOut, setCheckOut] = useState<CalendarDate | null>(null);
  const [adults, setAdults] = useState(Number(params.get("adults")) || 2);
  const [children, setChildren] = useState(Number(params.get("children")) || 0);
  const [rooms, setRooms] = useState(Number(params.get("rooms")) || 1);

  const guests = useDismissable<HTMLDivElement>();
  const roomPicker = useDismissable<HTMLDivElement>();

  function handleCheckIn(next: CalendarDate | null) {
    setCheckIn(next);
    if (next && checkOut && checkOut.compare(next) <= 0) setCheckOut(null);
  }

  function submit() {
    const next = new URLSearchParams(params.toString());
    if (checkIn) next.set("checkIn", checkIn.toString());
    else next.delete("checkIn");
    if (checkOut) next.set("checkOut", checkOut.toString());
    else next.delete("checkOut");
    next.set("adults", String(adults));
    if (children > 0) next.set("children", String(children));
    else next.delete("children");
    next.set("rooms", String(rooms));

    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <form
      role="search"
      aria-label="Check availability"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(
        "rounded-md bg-surface p-2 shadow-lg ring-1 ring-border/70",
        "grid gap-1 md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-stretch md:gap-0",
      )}
    >
      <DateField label="Check-in" value={checkIn} onChange={handleCheckIn} minValue={now} />

      <DateField
        label="Check-out"
        value={checkOut}
        onChange={setCheckOut}
        minValue={checkIn?.add({ days: 1 }) ?? now.add({ days: 1 })}
        className="max-md:border-t md:border-l border-border"
      />

      <Popover
        control={guests}
        icon={User}
        label="Guests"
        value={guestTotal(adults, children)}
        className="max-md:border-t md:border-l border-border"
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
          hint="Ages 0 to 12"
          value={children}
          min={0}
          max={MAX_CHILDREN}
          onChange={setChildren}
        />
      </Popover>

      <Popover
        control={roomPicker}
        icon={BedDouble}
        label="Rooms"
        value={`${rooms} ${rooms === 1 ? "Room" : "Rooms"}`}
        className="max-md:border-t md:border-l border-border"
      >
        <GuestStepper
          label="Rooms"
          hint="How many you need"
          value={rooms}
          min={1}
          max={MAX_ROOMS}
          onChange={setRooms}
        />
      </Popover>

      <button
        type="submit"
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-sm bg-brand-500 px-6",
          "text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
          "transition-[background-color,transform] duration-[120ms] ease-out",
          "hover:bg-brand-600 active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          "max-md:mt-1 md:my-auto md:ml-3 md:h-11",
        )}
      >
        <Search size={15} strokeWidth={2.4} aria-hidden className="md:hidden" />
        Check availability
      </button>
    </form>
  );
}

function DateField({
  label,
  value,
  onChange,
  minValue,
  className,
}: {
  label: string;
  value: CalendarDate | null;
  onChange: (next: CalendarDate | null) => void;
  minValue: CalendarDate;
  className?: string;
}) {
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
        className="h-full w-full rounded-sm text-left hover:bg-surface-muted/70"
      >
        <SearchSegment icon={CalendarDays} label={label}>
          <SegmentValue value={formatDay(value)} placeholder="Add date" />
        </SearchSegment>
      </DatePicker.Trigger>
      <DatePicker.Popover triggerRef={triggerRef} placement="bottom start" offset={12}>
        <StayCalendar aria-label={label} minValue={minValue} />
      </DatePicker.Popover>
    </DatePicker>
  );
}

function Popover({
  control,
  icon,
  label,
  value,
  className,
  children,
}: {
  control: ReturnType<typeof useDismissable<HTMLDivElement>>;
  icon: typeof User;
  label: string;
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { isOpen, setOpen, containerRef, triggerRef } = control;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        aria-label={`${label}, ${value}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setOpen(!isOpen)}
        className="h-full w-full rounded-sm text-left hover:bg-surface-muted/70"
      >
        <SearchSegment icon={icon} label={label}>
          <SegmentValue value={value} placeholder={`Add ${label.toLowerCase()}`} />
        </SearchSegment>
      </button>

      {isOpen ? (
        <div
          ref={containerRef}
          role="dialog"
          aria-label={label}
          className="absolute top-[calc(100%+12px)] right-0 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-surface p-5 shadow-lg"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
