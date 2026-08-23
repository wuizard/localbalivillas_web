"use client";

import {
  BedDouble,
  Ban,
  Bus,
  ChevronLeft,
  ChevronRight,
  CircleParking,
  Coffee,
  Maximize2,
  Users,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { quoteStay } from "@/features/pricing";
import { useCurrency } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";
import { pluralise } from "@/shared/lib/format";
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
  const thumbnails = room.images.slice(0, 6);

  function scrollBy(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 96, behavior: "smooth" });
  }

  if (room.images.length === 0) {
    return <div className="bg-surface-muted aspect-[4/3] lg:aspect-auto" />;
  }

  return (
    <div className="flex flex-col gap-2 p-4 lg:p-5">
      <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden rounded-sm">
        <Image
          src={room.images[0] ?? ""}
          alt={room.name}
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="object-cover"
        />
      </div>

      {thumbnails.length > 1 ? (
        <div className="relative">
          <ul ref={railRef} className="no-scrollbar flex scroll-px-8 gap-2 overflow-x-auto px-8">
            {thumbnails.map((src, index) => (
              <li key={src} className="relative size-16 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={src}
                  alt={`${room.name}, photo ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>

          <RailButton side="left" onPress={() => scrollBy(-1)} />
          <RailButton side="right" onPress={() => scrollBy(1)} />
        </div>
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
