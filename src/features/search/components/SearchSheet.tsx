"use client";

import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import {
  BedDouble,
  CalendarDays,
  Check,
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

const STEPS = [
  { id: "where", label: "Where" },
  { id: "when", label: "When" },
  { id: "bedrooms", label: "Beds" },
  { id: "who", label: "Who" },
] as const satisfies readonly { id: Step; label: string }[];

function summaryFor(step: Step, draft: Draft): string | null {
  switch (step) {
    case "where":
      return draft.destination;
    case "when":
      return formatStay(draft.checkIn, draft.checkOut);
    case "bedrooms":
      return bedroomSummary(draft.bedrooms)?.replace(/ bedrooms?$/, "") ?? null;
    case "who":
      return guestTotal(draft.adults, draft.children);
  }
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
    if (!openStep) return;
    closeRef.current?.focus();
    stepRefs.current[openStep]?.scrollIntoView({ block: "start", behavior: "auto" });
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
        className="border-border bg-bg border-b px-4 pb-2"
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

        {/* Four sections is more than one phone screen, so the sheet carries its own index.
            Each chip shows what is chosen, which doubles as the answer to "what did I
            already fill in?" without scrolling back up. */}
        <nav aria-label="Search steps" className="no-scrollbar -mx-4 mt-1 overflow-x-auto">
          <ul className="flex w-max gap-1.5 px-4 pb-1">
            {STEPS.map((step) => {
              const summary = summaryFor(step.id, draft);
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    aria-current={openStep === step.id ? "step" : undefined}
                    onClick={() => setOpenStep(step.id)}
                    className={cn(
                      "text-body-sm flex h-8 items-center gap-1.5 rounded-full border px-3 whitespace-nowrap",
                      "transition-colors duration-[120ms]",
                      openStep === step.id
                        ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300"
                        : "border-border text-fg-muted",
                    )}
                  >
                    <span className="text-fg font-medium">{step.label}</span>
                    {/* Only the answers are spelled out. Four "Anywhere / Any dates / Any"
                      placeholders push the last chip off a 375px screen to say nothing. */}
                    {summary ? <span className="truncate">{summary}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <Section
          title="Where"
          value={draft.destination}
          onMount={(el) => {
            stepRefs.current.where = el;
          }}
        >
          <ul className="flex flex-col">
            {destinations.map((item) => {
              const selected = draft.destination === item.name;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, destination: selected ? null : item.name }))
                    }
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm px-2 py-3 text-left",
                      selected ? "text-brand-600" : "text-fg",
                    )}
                  >
                    <MapPin size={18} strokeWidth={1.6} aria-hidden className="text-brand-500" />
                    <span className="text-body flex-1">{item.name}</span>
                    {selected ? <Check size={18} aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="When"
          value={formatStay(draft.checkIn, draft.checkOut)}
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
            onChange={(range) =>
              setDraft((d) => {
                if (!range) return { ...d, checkIn: null, checkOut: null };
                // Tapping one day twice is a same-day range in react-aria, which is zero
                // nights. Treat it as "one night from here" instead of a stay nobody can book.
                const end =
                  range.end.compare(range.start) <= 0 ? range.start.add({ days: 1 }) : range.end;
                return { ...d, checkIn: range.start, checkOut: end };
              })
            }
          />
        </Section>

        <Section
          title="Bedrooms"
          value={bedroomSummary(draft.bedrooms)}
          onMount={(el) => {
            stepRefs.current.bedrooms = el;
          }}
        >
          <BedroomPicker
            value={draft.bedrooms}
            onChange={(bedrooms) => setDraft((d) => ({ ...d, bedrooms }))}
          />
        </Section>

        <Section
          title="Who"
          value={guestTotal(draft.adults, draft.children)}
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
          icon={CalendarDays}
          label="Dates"
          value={formatStay(draft.checkIn, draft.checkOut)}
          placeholder="Select dates"
          onPress={() => setOpenStep("when")}
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

function Section({
  title,
  value,
  onMount,
  children,
}: {
  title: string;
  value: string | null;
  onMount: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section ref={onMount} className="border-border scroll-mt-2 border-b py-4 last:border-b-0">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="text-label text-fg-muted uppercase">{title}</h3>
        {value ? <p className="text-body-sm text-fg truncate font-medium">{value}</p> : null}
      </div>
      {children}
    </section>
  );
}
