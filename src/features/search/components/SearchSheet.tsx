"use client";

import { getLocalTimeZone, today, type CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { CalendarDays, Check, ChevronRight, MapPin, Search, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { cn } from "@/shared/lib/cn";
import { searchHref } from "../lib/query";
import type { Destination } from "../types";
import { StayRangeCalendar } from "./CalendarLayout";
import { GuestStepper, MAX_ADULTS, MAX_CHILDREN, guestTotal } from "./GuestPicker";

type Draft = {
  destination: string | null;
  checkIn: CalendarDate | null;
  checkOut: CalendarDate | null;
  adults: number;
  children: number;
};

type Step = "where" | "when" | "who";

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
  return `${from} to ${format(checkOut.toDate(zone), "d MMM")}`;
}

export function SearchSheet({ destinations, initial, className }: SearchSheetProps) {
  const router = useRouter();
  const [openStep, setOpenStep] = useState<Step | null>(null);
  const [draft, setDraft] = useState<Draft>(initial);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stepRefs = useRef<Partial<Record<Step, HTMLElement | null>>>({});

  const isOpen = openStep !== null;
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
        adults: draft.adults,
        children: draft.children,
      }),
    );
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-md bg-surface p-1.5 shadow-lg ring-1 ring-border/60">
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
          label="Check-in date"
          value={formatStay(draft.checkIn, draft.checkOut)}
          placeholder="Select date"
          onPress={() => setOpenStep("when")}
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
            "mt-1.5 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-brand-900",
            "text-body font-semibold text-white transition-transform duration-[120ms] ease-out",
            "active:scale-[0.98]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          )}
        >
          Search Villas
          <Search size={17} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search villas"
          className="fixed inset-0 z-[70] flex flex-col bg-bg"
        >
          <header
            className="flex items-center justify-between border-b border-border px-4 py-3"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
          >
            <h2 className="font-display text-title text-fg">Find your villa</h2>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpenStep(null)}
              aria-label="Close search"
              className="flex size-10 items-center justify-center rounded-full text-fg-muted hover:bg-surface-muted"
            >
              <X size={20} aria-hidden />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <Section
              title="Where"
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
                        <span className="flex-1 text-body">{item.name}</span>
                        {selected ? <Check size={18} aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section
              title="When"
              onMount={(el) => {
                stepRefs.current.when = el;
              }}
            >
              <StayRangeCalendar
                aria-label="Stay dates"
                minValue={today(getLocalTimeZone())}
                value={
                  draft.checkIn && draft.checkOut
                    ? { start: draft.checkIn, end: draft.checkOut }
                    : null
                }
                onChange={(range) =>
                  setDraft((d) => ({
                    ...d,
                    checkIn: range?.start ?? null,
                    checkOut: range?.end ?? null,
                  }))
                }
              />
            </Section>

            <Section
              title="Who"
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
              <div className="h-px bg-border" />
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
            className="border-t border-border bg-surface px-4 py-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
          >
            <button
              type="button"
              onClick={submit}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-brand-900 text-body font-semibold text-white active:scale-[0.98]"
            >
              Search Villas
              <Search size={17} strokeWidth={2} aria-hidden />
            </button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="mx-3 h-px bg-border" />;
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
      className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-left transition-colors duration-[120ms] active:bg-surface-muted"
    >
      <Icon size={18} strokeWidth={1.6} className="shrink-0 text-brand-500" aria-hidden />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] leading-none font-semibold tracking-[0.06em] text-fg-muted uppercase">
          {label}
        </span>
        {/* The card is deliberately narrower than the hero on mobile, so the value steps
            down a size rather than truncating "Where are you going?" mid-word. */}
        <span
          className={cn(
            "truncate text-[0.8125rem] md:text-body",
            value ? "font-medium text-fg" : "text-fg-subtle",
          )}
        >
          {value ?? placeholder}
        </span>
      </span>

      <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-fg-subtle" aria-hidden />
    </button>
  );
}

function Section({
  title,
  onMount,
  children,
}: {
  title: string;
  onMount: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section ref={onMount} className="scroll-mt-4 border-b border-border py-5 last:border-b-0">
      <h3 className="mb-2 text-label text-fg-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}
