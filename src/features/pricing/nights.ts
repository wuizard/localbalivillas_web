import type { IsoDate } from "./types";

const MS_PER_DAY = 86_400_000;

/** Parsed as UTC so a stay never gains or loses a night to a timezone or a DST boundary. */
function toUtc(date: IsoDate): number {
  return Date.parse(`${date}T00:00:00.000Z`);
}

function fromUtc(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Every date the stay touches, check-in through check-out **inclusive**. The API and the
 * legacy front end both model a stay this way, which is why nights are one fewer than days.
 */
export function stayDays(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const start = toUtc(checkIn);
  const end = toUtc(checkOut);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];

  const days: IsoDate[] = [];
  for (let ms = start; ms <= end; ms += MS_PER_DAY) days.push(fromUtc(ms));
  return days;
}

/**
 * The `days.length - 1` rule. `days` includes the checkout date, and nobody sleeps on the
 * night they leave — a 25th–28th stay is four dates and three nights. Every rate loop and
 * the availability check stop one short for this reason.
 */
export function countNights(days: IsoDate[]): number {
  return Math.max(days.length - 1, 0);
}

/** The dates actually slept on: every day except the checkout date. */
export function occupiedNights(days: IsoDate[]): IsoDate[] {
  return days.slice(0, countNights(days));
}

/** Weekday name in UTC, matching how the API writes `priceList[].day`. */
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function weekdayOf(date: IsoDate): string {
  const ms = toUtc(date);
  return Number.isNaN(ms) ? "" : (WEEKDAYS[new Date(ms).getUTCDay()] ?? "");
}
