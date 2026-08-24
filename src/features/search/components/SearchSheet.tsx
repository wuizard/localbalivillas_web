"use client";

import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import {
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { cn } from "@/shared/lib/cn";
import { searchHref } from "../lib/query";
import { DEFAULT_CRITERIA, bedroomSummary, type Destination } from "../types";
import { BedroomPicker } from "./BedroomPicker";
import { StayRangeCalendar } from "./CalendarLayout";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN, guestTotal } from "./GuestPicker";

type Draft = {
  destination: string | null;
  checkIn: CalendarDate | null;
  checkOut: CalendarDate | null;
  bedrooms: number;
  adults: number;
  children: number;
};

type Step = "where" | "when" | "bedrooms" | "who";

const EMPTY_DRAFT: Draft = {
  destination: null,
  checkIn: null,
  checkOut: null,
  bedrooms: 0,
  adults: DEFAULT_CRITERIA.adults,
  children: DEFAULT_CRITERIA.children,
};

type SearchSheetProps = {
  destinations: Destination[];
  initial: Draft;
  className?: string;
};

function formatStay(checkIn: CalendarDate | null, checkOut: CalendarDate | null): string | null {
  if (!checkIn) return null;
  const zone = getLocalTimeZone();
  const from = format(checkIn.toDate(zone), "d MMM");
  if (!checkOut) return from;
  return `${from} – ${format(checkOut.toDate(zone), "d MMM")}`;
}

/** The one-line recap above the submit button, so the CTA is never a blind press. */
function describe(draft: Draft): string {
  const parts = [
    draft.destination ?? "Anywhere in Bali",
    formatStay(draft.checkIn, draft.checkOut) ?? "any dates",
    bedroomSummary(draft.bedrooms),
    guestTotal(draft.adults, draft.children).toLowerCase(),
  ].filter(Boolean);
  return parts.join(" · ");
}

export function SearchSheet({ destinations, initial, className }: SearchSheetProps) {
  const router = useRouter();
  const [openStep, setOpenStep] = useState<Step | null>(null);
  const [draft, setDraft] = useState<Draft>(initial);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Partial<Record<Step, HTMLElement | null>>>({});

  const isOpen = openStep !== null;
  const isDirty =
    draft.destination !== null ||
    draft.checkIn !== null ||
    draft.bedrooms > 0 ||
    draft.adults !== EMPTY_DRAFT.adults ||
    draft.children > 0;

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
  }, [isOpen]);

  /**
   * Bring the step that just opened to the top of the sheet — which is what makes finishing
   * one step feel like being handed the next.
   *
   * Measured against the container and set outright rather than `scrollIntoView`: opening a
   * step collapses another, so the page shrinks in the same commit. A smooth scroll animates
   * toward a position computed before that reflow and lands past it, which is how the month
   * heading ended up above the fold.
   */
  useEffect(() => {
    const container = scrollRef.current;
    const section = openStep ? stepRefs.current[openStep] : null;
    if (!container || !section) return;

    const delta = section.getBoundingClientRect().top - container.getBoundingClientRect().top;
    if (Math.abs(delta) < 2) return;
    container.scrollTop += delta;
  }, [openStep]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenStep(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function submit() {
    setOpenStep(null);
    router.push(
      searchHref({
        destination: draft.destination,
        checkIn: draft.checkIn?.toString() ?? null,
        checkOut: draft.checkOut?.toString() ?? null,
        bedrooms: draft.bedrooms,
        adults: draft.adults,
        children: draft.children,
      }),
    );
  }

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search villas"
      className="bg-bg fixed inset-0 z-[70] flex flex-col"
    >
      <header
        className="border-border bg-bg border-b px-4 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-title text-fg">Find your villa</h2>

          <div className="flex items-center gap-1">
            {isDirty ? (
              <button
                type="button"
                onClick={() => setDraft(EMPTY_DRAFT)}
                className="text-body-sm text-fg-muted hover:text-brand-600 rounded-sm px-2 py-1.5 underline-offset-2 hover:underline"
              >
                Clear
              </button>
            ) : null}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpenStep(null)}
              aria-label="Close search"
              className="text-fg-muted hover:bg-surface-muted -mr-2 flex size-10 items-center justify-center rounded-full"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6">
        <Section
          title="Where"
          value={draft.destination}
          isOpen={openStep === "where"}
          onOpen={() => setOpenStep("where")}
          onMount={(el) => {
            stepRefs.current.where = el;
          }}
        >
          <DestinationPicker
            destinations={destinations}
            selected={draft.destination}
            onSelect={(name) => {
              setDraft((d) => ({ ...d, destination: name }));
              if (name) setOpenStep("bedrooms");
            }}
          />
        </Section>

        <Section
          title="Bedrooms"
          value={bedroomSummary(draft.bedrooms)}
          isOpen={openStep === "bedrooms"}
          onOpen={() => setOpenStep("bedrooms")}
          onMount={(el) => {
            stepRefs.current.bedrooms = el;
          }}
        >
          <BedroomPicker
            value={draft.bedrooms}
            onChange={(bedrooms) => {
              setDraft((d) => ({ ...d, bedrooms }));
              setOpenStep("who");
            }}
          />
        </Section>

        <Section
          title="Who"
          value={guestTotal(draft.adults, draft.children)}
          isOpen={openStep === "who"}
          onOpen={() => setOpenStep("who")}
          onMount={(el) => {
            stepRefs.current.who = el;
          }}
        >
          <GuestStepper
            label="Adults"
            hint="Ages 13 or above"
            value={draft.adults}
            min={1}
            max={MAX_ADULTS}
            onChange={(adults) => setDraft((d) => ({ ...d, adults }))}
          />
          <div className="bg-border h-px" />
          <GuestStepper
            label="Children"
            hint="Ages 0 to 12"
            value={draft.children}
            min={0}
            max={MAX_CHILDREN}
            onChange={(children) => setDraft((d) => ({ ...d, children }))}
          />
        </Section>

        <Section
          title="When"
          value={formatStay(draft.checkIn, draft.checkOut)}
          isOpen={openStep === "when"}
          onOpen={() => setOpenStep("when")}
          onMount={(el) => {
            stepRefs.current.when = el;
          }}
        >
          <StayRangeCalendar
            aria-label="Stay dates"
            className="calendar-full"
            minValue={today(getLocalTimeZone())}
            value={
              draft.checkIn && draft.checkOut ? { start: draft.checkIn, end: draft.checkOut } : null
            }
            // Only fires once both ends are chosen, which is exactly when the step is done.
            onChange={(range) => {
              if (!range) {
                setDraft((d) => ({ ...d, checkIn: null, checkOut: null }));
                return;
              }
              // Tapping one day twice is a same-day range in react-aria, which is zero
              // nights. Treat it as "one night from here" instead of a stay nobody can book.
              const end =
                range.end.compare(range.start) <= 0 ? range.start.add({ days: 1 }) : range.end;
              setDraft((d) => ({ ...d, checkIn: range.start, checkOut: end }));
            }}
          />
        </Section>
      </div>

      <footer
        className="border-border bg-surface border-t px-4 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      >
        <p className="text-body-sm text-fg-muted mb-2 truncate text-center">{describe(draft)}</p>
        <button
          type="button"
          onClick={submit}
          className="bg-brand-900 text-body flex h-12 w-full items-center justify-center gap-2 rounded-sm font-semibold text-white active:scale-[0.98]"
        >
          Search Villas
          <Search size={17} strokeWidth={2} aria-hidden />
        </button>
      </footer>
    </div>
  );

  return (
    <div className={className}>
      <div className="bg-surface ring-border/60 overflow-hidden rounded-md p-1.5 shadow-lg ring-1">
        <SearchRow
          icon={MapPin}
          label="Location"
          value={draft.destination}
          placeholder="Where are you going?"
          onPress={() => setOpenStep("where")}
        />
        <Divider />
        <SearchRow
          icon={BedDouble}
          label="Bedrooms"
          value={bedroomSummary(draft.bedrooms)}
          placeholder="Any"
          onPress={() => setOpenStep("bedrooms")}
        />
        <Divider />
        <SearchRow
          icon={User}
          label="Guests"
          value={guestTotal(draft.adults, draft.children)}
          placeholder="Add guests"
          onPress={() => setOpenStep("who")}
        />
        <Divider />
        <SearchRow
          icon={CalendarDays}
          label="Dates"
          value={formatStay(draft.checkIn, draft.checkOut)}
          placeholder="Select dates"
          onPress={() => setOpenStep("when")}
        />

        <button
          type="button"
          onClick={submit}
          className={cn(
            "bg-brand-900 mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-sm",
            "text-body font-semibold text-white transition-transform duration-[120ms] ease-out",
            "active:scale-[0.98]",
            "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
        >
          Search Villas
          <Search size={17} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {/* Portalled to <body>. In flow the sheet sits inside the hero's `z-10` stacking
          context, so its own z-index cannot beat the sticky top nav or the bottom bar and
          they paint over the header — including the button that closes it. Only ever open
          after a tap, so `document` is always there by the time this runs. */}
      {isOpen ? createPortal(sheet, document.body) : null}
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="bg-border mx-3 h-px" />;
}

/**
 * Type-to-filter rather than a flat list. Today that is thirteen Bali areas, which already
 * fill a phone screen on their own; the moment the catalogue reaches beyond Bali a flat list
 * stops being browsable at all. The list stays under the field so areas are still
 * discoverable to someone who does not know what to type — it is just bounded, and scrolls
 * inside itself rather than pushing the rest of the sheet down.
 */
function DestinationPicker({
  destinations,
  selected,
  onSelect,
}: {
  destinations: Destination[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? destinations.filter((item) => item.name.toLowerCase().includes(needle))
    : destinations;

  return (
    <div>
      <div className="relative">
        <Search
          size={17}
          strokeWidth={1.8}
          aria-hidden
          className="text-fg-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <label htmlFor="where-search" className="sr-only">
          Search destinations
        </label>
        <input
          id="where-search"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search destinations"
          className={cn(
            "border-border bg-surface text-body text-fg placeholder:text-fg-subtle",
            "focus:border-brand-400 h-11 w-full rounded-sm border pr-10 pl-10 focus:outline-none",
            // Safari draws its own clear affordance on type=search, right beside ours.
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear destination search"
            className="text-fg-muted hover:text-fg absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full"
          >
            <X size={16} aria-hidden />
          </button>
        ) : null}
      </div>

      {matches.length === 0 ? (
        <p className="text-body-sm text-fg-muted px-2 py-4">
          Nowhere matches “{query.trim()}”. Try a shorter search.
        </p>
      ) : (
        <ul className="mt-1 max-h-64 overflow-y-auto overscroll-contain">
          {matches.map((item) => {
            const isSelected = selected === item.name;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(isSelected ? null : item.name)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-2 py-3 text-left",
                    isSelected ? "text-brand-600 dark:text-brand-300" : "text-fg",
                  )}
                >
                  <MapPin size={18} strokeWidth={1.6} aria-hidden className="text-brand-500" />
                  <span className="text-body flex-1">{item.name}</span>
                  {isSelected ? <Check size={18} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SearchRow({
  icon: Icon,
  label,
  value,
  placeholder,
  onPress,
}: {
  icon: typeof MapPin;
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="active:bg-surface-muted flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-left transition-colors duration-[120ms]"
    >
      <Icon size={18} strokeWidth={1.6} className="text-brand-500 shrink-0" aria-hidden />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-fg-muted text-[10px] leading-none font-semibold tracking-[0.06em] uppercase">
          {label}
        </span>
        {/* The card is deliberately narrower than the hero on mobile, so the value steps
            down a size rather than truncating "Where are you going?" mid-word. */}
        <span
          className={cn(
            "md:text-body truncate text-[0.8125rem]",
            value ? "text-fg font-medium" : "text-fg-subtle",
          )}
        >
          {value ?? placeholder}
        </span>
      </span>

      <ChevronRight size={16} strokeWidth={1.8} className="text-fg-subtle shrink-0" aria-hidden />
    </button>
  );
}

/**
 * One step open at a time. Four expanded sections is three screens of scrolling for a form
 * with four answers in it; collapsed, every answer already given is visible at a glance and
 * the one being asked for is the only thing on screen. A step that is already open does not
 * close on a second tap — collapsing all four would leave the sheet showing nothing.
 */
function Section({
  title,
  value,
  isOpen,
  onOpen,
  onMount,
  children,
}: {
  title: string;
  value: string | null;
  isOpen: boolean;
  onOpen: () => void;
  onMount: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section ref={onMount} className="border-border scroll-mt-2 border-b last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onOpen}
          aria-expanded={isOpen}
          className="flex w-full items-baseline justify-between gap-3 py-4 text-left"
        >
          <span className="text-label text-fg-muted uppercase">{title}</span>
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "text-body-sm truncate",
                value ? "text-fg font-medium" : "text-fg-subtle",
              )}
            >
              {value ?? "Any"}
            </span>
            <ChevronDown
              size={16}
              aria-hidden
              className={cn(
                "text-fg-subtle shrink-0 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </span>
        </button>
      </h3>

      {isOpen ? <div className="pb-5">{children}</div> : null}
    </section>
  );
}
