import { occupiedNights, weekdayOf } from "./nights";
import type { IsoDate, NightRate, PricedRoom } from "./types";

/**
 * The rate for one night: an exact-date rule wins, then a weekday rule, then the base price.
 *
 * Two deliberate departures from the legacy loop in `RoomTable.js`, both documented because
 * §12 asks for production parity:
 *
 *  1. Legacy does `if (!dateList) continue;` *before* reading `day`, so a rule with
 *     `date: null, day: ["Saturday"]` is silently skipped and weekday pricing never fires.
 *     No production data uses day-only rules today (445 date rules, 0 day rules across the
 *     20 properties sampled), so outputs are identical — but the moment ops adds one, this
 *     charges the weekday rate and legacy charges base. That divergence must be settled
 *     before the canary runs both sites at once.
 *  2. Legacy lets a later weekday rule overwrite an earlier one. First match wins here.
 */
export function resolveNightlyRate(room: PricedRoom, date: IsoDate): number {
  const weekday = weekdayOf(date);
  let weekdayMatch: number | null = null;

  for (const rule of room.priceRules) {
    if (rule.date?.includes(date)) return rule.price;
    if (weekdayMatch === null && rule.day?.includes(weekday)) weekdayMatch = rule.price;
  }

  return weekdayMatch ?? room.basePrice;
}

/** One rate per night slept, in stay order. The checkout date is never charged. */
export function nightlyBreakdown(room: PricedRoom, days: IsoDate[]): NightRate[] {
  return occupiedNights(days).map((date) => ({
    date,
    price: resolveNightlyRate(room, date),
  }));
}

export function subtotalOf(breakdown: NightRate[], rooms = 1): number {
  const perRoom = breakdown.reduce((total, night) => total + night.price, 0);
  return perRoom * Math.max(rooms, 1);
}
