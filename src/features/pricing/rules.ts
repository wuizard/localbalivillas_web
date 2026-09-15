import { weekdayOf } from "./nights";
import type { IsoDate } from "./types";

/**
 * The shape every date-conditional rate rule shares, whatever it is pricing. A row
 * with both fields null is a base row and matches nothing here.
 */
export type DateRule = {
  date: IsoDate[] | null;
  /** Weekday names as the API writes them: "Monday", "Tuesday"… */
  day: string[] | null;
};

/**
 * The rule that applies on a date: an exact-date rule wins, then a weekday rule,
 * first match in each tier. Returns the rule itself rather than a price, because
 * what a rule carries differs — a room row has one `price`, an activity row has an
 * adult and a child rate — while *which* row applies is identical logic.
 *
 * This is the only thing nightly rates and activity rates share. The nights
 * arithmetic is deliberately not shared: a stay drops its checkout day, an activity
 * is charged for the day it happens, and running one through the other's helpers
 * prices a single-day activity at zero.
 */
export function matchDateRule<T extends DateRule>(rules: T[], date: IsoDate): T | null {
  const weekday = weekdayOf(date);
  let weekdayMatch: T | null = null;

  for (const rule of rules) {
    if (rule.date?.includes(date)) return rule;
    if (weekdayMatch === null && rule.day?.includes(weekday)) weekdayMatch = rule;
  }

  return weekdayMatch;
}
