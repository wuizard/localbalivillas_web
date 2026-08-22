import { resolveNightlyRate } from "./rates";
import type { IsoDate, PricedRoom } from "./types";

/**
 * The cheapest a guest could sleep on this date across every room the property offers.
 * Rooms blocked on the date are excluded — a rate nobody can book is not a "from" price.
 * Returns null when the whole property is closed that night.
 */
export function lowestRateOn(rooms: PricedRoom[], date: IsoDate): number | null {
  const open = rooms.filter((room) => !room.disabledDates.includes(date));
  if (open.length === 0) return null;

  return open.reduce<number>(
    (lowest, room) => Math.min(lowest, resolveNightlyRate(room, date)),
    Number.POSITIVE_INFINITY,
  );
}

/** True when every room is blocked — the calendar marks these Sold and refuses selection. */
export function isSoldOut(rooms: PricedRoom[], date: IsoDate): boolean {
  return rooms.length > 0 && rooms.every((room) => room.disabledDates.includes(date));
}

/**
 * Lowest rate per date across a window, for painting a calendar in one pass rather than
 * resolving every room on every cell render.
 */
export function rateCalendar(
  rooms: PricedRoom[],
  dates: IsoDate[],
): Map<IsoDate, { price: number | null; soldOut: boolean }> {
  const map = new Map<IsoDate, { price: number | null; soldOut: boolean }>();
  for (const date of dates) {
    map.set(date, { price: lowestRateOn(rooms, date), soldOut: isSoldOut(rooms, date) });
  }
  return map;
}
