"use client";

import { getLocalTimeZone, parseDate, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { BedDouble, CalendarDays, Search, User } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PricedRoom } from "@/features/pricing";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { StayPriceCalendar } from "./StayPriceCalendar";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN, guestTotal } from "./GuestPicker";
import { SearchSegment, SegmentValue } from "./SearchSegment";

const MAX_ROOMS = 10;

function formatDay(date: CalendarDate | null): string | null {
  return date ? format(date.toDate(getLocalTimeZone()), "EEE, d MMM") : null;
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

/**
 * The property page's date and occupancy picker. It writes to the URL rather than to local
 * state so a chosen stay survives a refresh and can be shared — the same rule the results
 * page follows (CLAUDE.md §4) — and it reads the URL back on mount so a shared link opens
 * with the dates it was shared with.
 */
export function AvailabilityBar({ roomPricing = [] }: { roomPricing?: PricedRoom[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [checkIn, setCheckIn] = useState<CalendarDate | null>(() =>
    readDate(params.get("checkIn")),
  );
  const [checkOut, setCheckOut] = useState<CalendarDate | null>(() => {
    const start = readDate(params.get("checkIn"));
    const end = readDate(params.get("checkOut"));
    return end && start && end.compare(start) <= 0 ? null : end;
  });
  const [adults, setAdults] = useState(Number(params.get("adults")) || 2);
  const [children, setChildren] = useState(Number(params.get("children")) || 0);
  const [rooms, setRooms] = useState(Number(params.get("rooms")) || 1);

  const {
    isOpen: isStayOpen,
    setOpen: setStayOpen,
    containerRef: stayRef,
    triggerRef: stayTriggerRef,
  } = useDismissable<HTMLDivElement>();
  const guests = useDismissable<HTMLDivElement>();
  const roomPicker = useDismissable<HTMLDivElement>();

  const stayRange = checkIn && checkOut ? { start: checkIn, end: checkOut } : null;

  function pickStay(range: { start: CalendarDate; end: CalendarDate }) {
    setCheckIn(range.start);
    setCheckOut(range.end);
    setStayOpen(false);
  }

  function submit() {
    const next = new URLSearchParams(params.toString());
    if (checkIn) next.set("checkIn", checkIn.toString());
    else next.delete("checkIn");
    if (checkOut && checkIn && checkOut.compare(checkIn) > 0) {
      next.set("checkOut", checkOut.toString());
    } else next.delete("checkOut");
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
        "bg-surface ring-border/70 rounded-md p-2 shadow-lg ring-1",
        "grid gap-1 md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-stretch md:gap-0",
      )}
    >
      <Popover
        control={roomPicker}
        icon={BedDouble}
        label="Rooms"
        value={`${rooms} ${rooms === 1 ? "Room" : "Rooms"}`}
        className="border-border max-md:border-t md:border-l"
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

      <Popover
        control={guests}
        icon={User}
        label="Guests"
        value={guestTotal(adults, children)}
        className="border-border max-md:border-t md:border-l"
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
          hint="Ages 0 to 12"
          value={children}
          min={0}
          max={MAX_CHILDREN}
          onChange={setChildren}
        />
      </Popover>

      {/* Two readouts, one calendar. Both halves open the same range picker, so a stay is
          picked the way it is thought about — arrival then departure, in two taps, with the
          nights between them filled in. */}
      <div ref={stayRef} className="relative md:col-span-2 md:grid md:grid-cols-2 md:items-stretch">
        <button
          type="button"
          ref={stayTriggerRef}
          aria-label={`Stay dates, ${formatDay(checkIn) ?? "not chosen"}${
            checkOut ? ` to ${formatDay(checkOut)}` : ""
          }`}
          aria-expanded={isStayOpen}
          aria-haspopup="dialog"
          onClick={() => setStayOpen(!isStayOpen)}
          className="hover:bg-surface-muted/70 h-full w-full rounded-sm text-left"
        >
          <SearchSegment icon={CalendarDays} label="Check-in">
            <SegmentValue value={formatDay(checkIn)} placeholder="Add dates" />
          </SearchSegment>
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setStayOpen(!isStayOpen)}
          className="border-border hover:bg-surface-muted/70 h-full w-full rounded-sm border-t text-left md:border-t-0 md:border-l"
        >
          <SearchSegment icon={CalendarDays} label="Check-out">
            <SegmentValue value={formatDay(checkOut)} placeholder="Add dates" />
          </SearchSegment>
        </button>

        {isStayOpen ? (
          <div
            role="dialog"
            aria-label="Stay dates"
            className="border-border bg-surface absolute top-[calc(100%+12px)] left-0 z-30 w-[22rem] max-w-[calc(100vw-2rem)] rounded-md border p-5 shadow-lg"
          >
            <StayPriceCalendar rooms={roomPricing} value={stayRange} onChange={pickStay} />
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        className={cn(
          "bg-brand-500 flex h-12 items-center justify-center gap-2 rounded-sm px-6",
          "text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
          "transition-[background-color,transform] duration-[120ms] ease-out",
          "hover:bg-brand-600 active:scale-[0.98]",
          "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          "max-md:mt-1 md:my-auto md:ml-3 md:h-11",
        )}
      >
        <Search size={15} strokeWidth={2.4} aria-hidden className="md:hidden" />
        Check availability
      </button>
    </form>
  );
}

function Popover({
  control,
  icon,
  label,
  value,
  className,
  panelClassName,
  children,
}: {
  control: ReturnType<typeof useDismissable<HTMLDivElement>>;
  icon: typeof User;
  label: string;
  value: string | null;
  className?: string;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  const { isOpen, setOpen, containerRef, triggerRef } = control;
  const placeholder = `Add ${label.toLowerCase()}`;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        aria-label={`${label}, ${value ?? placeholder}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setOpen(!isOpen)}
        className="hover:bg-surface-muted/70 h-full w-full rounded-sm text-left"
      >
        <SearchSegment icon={icon} label={label}>
          <SegmentValue value={value} placeholder={placeholder} />
        </SearchSegment>
      </button>

      {isOpen ? (
        <div
          ref={containerRef}
          role="dialog"
          aria-label={label}
          className={cn(
            "border-border bg-surface absolute top-[calc(100%+12px)] right-0 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-md border p-5 shadow-lg",
            panelClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
