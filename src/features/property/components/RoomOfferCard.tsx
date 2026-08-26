"use client";

import {
  BedDouble,
  Ban,
  Bus,
  ChevronLeft,
  ChevronRight,
  CircleParking,
  Coffee,
  Expand,
  Maximize2,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { quoteStay } from "@/features/pricing";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";
import { pluralise } from "@/shared/lib/format";
import { Lightbox } from "@/shared/ui";
import { ROOM_FACILITIES, type RoomFacilityKey, type RoomOffer } from "../types";

const FACILITY_ICONS: Record<RoomFacilityKey, typeof Coffee> = {
  breakfast: Coffee,
  airportShuttle: Bus,
  freeParking: CircleParking,
  swimmingPool: Waves,
  publicPool: Waves,
  restaurant: UtensilsCrossed,
};

const FACILITY_LABEL = new Map(ROOM_FACILITIES.map((f) => [f.key, f.label] as const));

/** Shown on every room: the booking is non-refundable, and the guest sees that up front. */
const NON_REFUNDABLE = "No refund or modification";

const MAX_ROOMS = 10;

/** One 64px thumbnail plus the 8px gap, so an arrow press lands on a thumbnail edge. */
const THUMB_STEP = 72;
const THUMB_SCROLL_MS = 420;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type RoomOfferCardProps = {
  room: RoomOffer;
  propertyKey: string;
  propertyType: string;
};

export function RoomOfferCard({ room, propertyKey, propertyType }: RoomOfferCardProps) {
  const [quantity, setQuantity] = useState(1);
  const params = useSearchParams();
  const { format } = useCurrency();

  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");

  // Every price on this card comes from features/pricing — nothing here does its own maths.
  const quote =
    checkIn && checkOut
      ? quoteStay({ room: room.pricing, checkIn, checkOut, rooms: quantity })
      : null;

  const bookQuery = new URLSearchParams({ room: room.id, rooms: String(quantity) });
  if (checkIn) bookQuery.set("checkIn", checkIn);
  if (checkOut) bookQuery.set("checkOut", checkOut);
  const bookHref = `/booking/${propertyKey}?${bookQuery.toString()}`;

  const soldOut = quote !== null && !quote.available;

  return (
    <article className="border-border bg-surface overflow-hidden rounded-md border shadow-sm">
      <div className="lg:grid lg:grid-cols-[minmax(0,34fr)_minmax(0,42fr)_minmax(0,24fr)]">
        <RoomImages room={room} />

        <div className="lg:border-border flex flex-col gap-3 p-4 lg:border-r lg:p-5">
          <h3 className="font-display text-title text-fg lg:text-2xl">{room.name}</h3>

          <ul className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-sm">
            <Spec icon={Users} value={room.maxGuests ? `${room.maxGuests} Guests` : "Ask us"} />
            <Spec
              icon={BedDouble}
              value={
                room.bedrooms ? `${room.bedrooms} Bedroom${room.bedrooms > 1 ? "s" : ""}` : "—"
              }
            />
            <Spec icon={Maximize2} value={room.roomSize ?? "—"} />
            <Spec icon={Waves} value={room.poolSize ? `Pool ${room.poolSize}` : "Resort access"} />
          </ul>

          {room.amenities.length > 0 ? (
            <ul className="border-border text-body-sm text-fg-muted flex flex-wrap gap-x-3 gap-y-1.5 border-t pt-3">
              {room.amenities.slice(0, 6).map((amenity) => (
                <li key={amenity} className="flex items-center gap-1.5">
                  <span aria-hidden className="bg-brand-300 size-1 rounded-full" />
                  {amenity}
                </li>
              ))}
              {room.amenities.length > 6 ? (
                <li className="text-brand-600 dark:text-brand-300">
                  +{room.amenities.length - 6} more
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <div className="border-border flex flex-col gap-3 border-t p-4 lg:border-t-0 lg:p-5">
          <div>
            <p className="text-fg-muted text-[11px] uppercase">
              {quote && quote.nights > 0 ? "Total" : "From"}
            </p>
            <p className="tabular text-price text-fg mt-0.5 lg:text-2xl">
              {quote && quote.nights > 0
                ? format(quote.total)
                : room.basePrice === null
                  ? "On request"
                  : format(room.basePrice)}
            </p>
            <p className="text-body-sm text-fg-muted">
              {quote && quote.nights > 0
                ? `${pluralise(quote.nights, "night")} × ${pluralise(quote.rooms, "room")}`
                : "/ night"}
            </p>
          </div>

          <label className="border-border flex items-center justify-between gap-3 rounded-sm border px-2 py-1.5">
            <span className="sr-only">Rooms</span>
            <Stepper
              label="Remove one room"
              disabled={quantity <= 1}
              onPress={() => setQuantity((value) => value - 1)}
            >
              −
            </Stepper>
            <output className="tabular text-body text-fg font-semibold">{quantity}</output>
            <Stepper
              label="Add one room"
              disabled={quantity >= MAX_ROOMS}
              onPress={() => setQuantity((value) => value + 1)}
            >
              +
            </Stepper>
          </label>

          {soldOut ? (
            <p className="bg-surface-muted text-body-sm text-fg-muted flex h-11 items-center justify-center rounded-sm px-3 text-center font-medium">
              Not available for these dates
            </p>
          ) : (
            <Link
              href={bookHref}
              className={cn(
                "bg-brand-500 text-label flex h-11 items-center justify-center rounded-sm",
                "font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
                "transition-[background-color,transform] duration-[120ms] ease-out",
                "hover:bg-brand-600 active:scale-[0.98]",
                "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
              )}
            >
              Book now
            </Link>
          )}

          <ul className="text-body-sm text-fg-muted flex flex-col gap-1.5">
            <li className="flex items-center gap-2">
              <Ban size={14} strokeWidth={1.7} className="text-danger shrink-0" aria-hidden />
              {NON_REFUNDABLE}
            </li>
            {room.facilities.map((key) => {
              const Icon = FACILITY_ICONS[key];
              return (
                <li key={key} className="flex items-center gap-2">
                  <Icon
                    size={14}
                    strokeWidth={1.7}
                    className="text-brand-400 shrink-0"
                    aria-hidden
                  />
                  {FACILITY_LABEL.get(key)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="border-border bg-surface-muted/60 text-fg-muted border-t px-4 py-2 text-[11px] lg:px-5">
        {quote && quote.nights > 0
          ? "Non-refundable · this reservation cannot be changed or cancelled once paid."
          : `${propertyType === "villas" ? "Whole villa" : "Room"} rate shown before dates are chosen. Pick your dates above for the exact total.`}
      </p>
    </article>
  );
}

function RoomImages({ room }: { room: RoomOffer }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbnails = room.images.slice(0, 6);

  const animation = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (animation.current) cancelAnimationFrame(animation.current);
    },
    [],
  );

  function scrollStep(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    if (animation.current) cancelAnimationFrame(animation.current);

    const from = rail.scrollLeft;
    const to = clamp(from + direction * THUMB_STEP, 0, rail.scrollWidth - rail.clientWidth);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rail.scrollLeft = to;
      return;
    }

    const start = performance.now();
    const frame = (now: number): void => {
      const t = Math.min((now - start) / THUMB_SCROLL_MS, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      rail.scrollLeft = from + (to - from) * eased;
      if (t < 1) animation.current = requestAnimationFrame(frame);
    };
    animation.current = requestAnimationFrame(frame);
  }

  if (room.images.length === 0) {
    return <div className="bg-surface-muted aspect-[4/3] lg:aspect-auto" />;
  }

  return (
    <div className="flex flex-col gap-2 p-4 lg:p-5">
      <button
        type="button"
        onClick={() => setLightboxIndex(active)}
        aria-label={`View ${room.name} photos full screen`}
        className="bg-surface-muted group focus-visible:outline-brand-500 relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Image
          src={room.images[active] ?? ""}
          alt={`${room.name}, photo ${active + 1}`}
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span className="glass glass-sm text-fg pointer-events-none absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand size={14} strokeWidth={1.8} aria-hidden />
        </span>
      </button>

      {thumbnails.length > 1 ? (
        <div className="relative">
          {/* py-1 gives the selected thumbnail's ring room; the rail's overflow clips anything
              drawn outside the content box. */}
          <ul
            ref={railRef}
            className="no-scrollbar flex scroll-px-8 gap-2 overflow-x-auto px-8 py-1"
          >
            {thumbnails.map((src, index) => (
              <li key={src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  onDoubleClick={() => setLightboxIndex(index)}
                  aria-label={`Show photo ${index + 1} of ${room.images.length}`}
                  aria-current={index === active}
                  className={cn(
                    "relative block size-16 overflow-hidden rounded-sm transition-opacity",
                    index === active
                      ? "ring-brand-500 ring-offset-surface ring-2 ring-offset-2"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  <Image
                    src={src}
                    alt={`${room.name}, photo ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>

          <RailButton side="left" onPress={() => scrollStep(-1)} />
          <RailButton side="right" onPress={() => scrollStep(1)} />
        </div>
      ) : null}

      {lightboxIndex !== null ? (
        <Lightbox
          images={room.images}
          label={room.name}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}

function RailButton({ side, onPress }: { side: "left" | "right"; onPress: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={side === "left" ? "Previous photos" : "Next photos"}
      className={cn(
        "absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full",
        "bg-surface text-fg ring-border shadow-md ring-1",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <Icon size={15} strokeWidth={2} aria-hidden />
    </button>
  );
}

function Spec({ icon: Icon, value }: { icon: typeof Users; value: string }) {
  return (
    <li className="bg-surface-muted/60 text-body-sm text-fg flex items-center gap-2 px-3 py-2.5">
      <Icon size={15} strokeWidth={1.6} className="text-brand-400 shrink-0" aria-hidden />
      <span className="truncate">{value}</span>
    </li>
  );
}

function Stepper({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className="text-body text-fg hover:bg-surface-muted flex size-8 items-center justify-center rounded-sm transition-colors disabled:opacity-30"
    >
      {children}
    </button>
  );
}
