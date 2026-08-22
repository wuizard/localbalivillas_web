import { isRoomAvailable, unavailableNights } from "./availability";
import { applyCoupon } from "./coupon";
import { countNights, stayDays } from "./nights";
import { nightlyBreakdown, subtotalOf } from "./rates";
import type { Coupon, IsoDate, PricedRoom, Quote } from "./types";

export type QuoteInput = {
  room: PricedRoom;
  checkIn: IsoDate;
  checkOut: IsoDate;
  rooms?: number;
  coupon?: Coupon | null;
};

export type StayQuote = Quote & {
  available: boolean;
  blockedNights: IsoDate[];
};

/**
 * The single entry point every surface uses: room card, calendar, booking summary. Nothing
 * outside this module may add, discount or total a price — one code path means one place a
 * pricing bug can live.
 */
export function quoteStay({
  room,
  checkIn,
  checkOut,
  rooms = 1,
  coupon = null,
}: QuoteInput): StayQuote {
  const days = stayDays(checkIn, checkOut);
  const nights = countNights(days);
  const roomCount = Math.max(rooms, 1);

  const breakdown = nightlyBreakdown(room, days);
  const subtotal = subtotalOf(breakdown, roomCount);
  const { discount, total } = applyCoupon({ subtotal, nights, breakdown, rooms: roomCount, coupon });

  return {
    nights,
    rooms: roomCount,
    breakdown,
    subtotal,
    discount,
    total,
    coupon,
    available: isRoomAvailable(room, days),
    blockedNights: unavailableNights(room, days),
  };
}

/** Lowest nightly rate a room ever charges — the "from" price on cards and headers. */
export function lowestNightlyRate(room: PricedRoom): number {
  const overrides = room.priceRules
    .filter((rule) => rule.date !== null || rule.day !== null)
    .map((rule) => rule.price);

  return Math.min(room.basePrice, ...overrides);
}
