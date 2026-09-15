import { describe, expect, it } from "vitest";
import rooms from "./__fixtures__/production-rooms.json";
import { unavailableNights } from "./availability";
import { stayDays } from "./nights";
import { nightlyBreakdown } from "./rates";
import type { PricedRoom } from "./types";

/**
 * M2's exit criterion: the ported maths must agree with what production charges today.
 *
 * The fixture is real `GET /property/:key` output — 64 rooms across 20 properties, 510 price
 * rules — captured so the check runs offline and cannot drift when the API is unreachable.
 * `legacyNightlyRate` below is the loop from `lbv_fe/src/component/roomtable/RoomTable.js`
 * transcribed as literally as JavaScript allows, quirks intact, so any disagreement is a real
 * behavioural change rather than a difference in how the two were written.
 */
type FixtureRoom = {
  property: string;
  room: string;
  basePrice: number;
  priceRules: { date: string[] | null; day: string[] | null; price: number }[];
  disabledDates: string[];
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Verbatim port of the legacy loop, including `if (!dateList) continue`. */
function legacyNightlyRate(room: FixtureRoom, day: string): number {
  if (room.priceRules.length === 0) return room.basePrice;

  let specialPrice = room.basePrice;
  let dateSpecialPrice = false;

  for (const rule of room.priceRules) {
    const dateList = rule.date;
    if (!dateList) continue;
    if (dateList.indexOf(day) >= 0) {
      specialPrice = rule.price;
      dateSpecialPrice = true;
      break;
    }
    const dayList = rule.day;
    if (!dayList) continue;
    const weekday = WEEKDAYS[new Date(`${day}T00:00:00.000Z`).getUTCDay()] ?? "";
    if (dayList.length > 0 && dayList.indexOf(weekday) >= 0) {
      if (!dateSpecialPrice) specialPrice = rule.price;
    }
  }

  return specialPrice;
}

const fixture = rooms as FixtureRoom[];

function toPricedRoom(room: FixtureRoom): PricedRoom {
  return {
    basePrice: room.basePrice,
    priceRules: room.priceRules,
    disabledDates: room.disabledDates,
  };
}

/** A year of nights, so seasonal date rules are actually exercised. */
const YEAR = stayDays("2026-06-01", "2027-06-01");

describe("parity with production pricing", () => {
  it("covers a meaningful sample", () => {
    expect(fixture.length).toBeGreaterThanOrEqual(60);
    expect(new Set(fixture.map((room) => room.property)).size).toBeGreaterThanOrEqual(20);
    expect(fixture.reduce((n, room) => n + room.priceRules.length, 0)).toBeGreaterThan(400);
  });

  it("charges every night exactly what the legacy front end charges", () => {
    const mismatches: string[] = [];

    for (const room of fixture) {
      const priced = toPricedRoom(room);
      const ours = nightlyBreakdown(priced, YEAR);

      for (const night of ours) {
        const legacy = legacyNightlyRate(room, night.date);
        if (legacy !== night.price) {
          mismatches.push(`${room.property} / ${room.room} / ${night.date}: ${legacy} → ${night.price}`);
        }
      }
    }

    expect(mismatches.slice(0, 10)).toEqual([]);
  });

  it("never prices the checkout night", () => {
    for (const room of fixture.slice(0, 5)) {
      const days = stayDays("2026-12-20", "2026-12-25");
      const breakdown = nightlyBreakdown(toPricedRoom(room), days);

      expect(breakdown).toHaveLength(days.length - 1);
      expect(breakdown.at(-1)?.date).toBe("2026-12-24");
    }
  });

  it("blocks a stay that covers a disabled night, and allows one that only leaves on it", () => {
    const blocked = fixture.find((room) => room.disabledDates.length > 0);
    expect(blocked, "fixture should contain a room with disabled dates").toBeDefined();
    if (!blocked) return;

    const closed = blocked.disabledDates[0];
    expect(closed).toBeDefined();
    if (!closed) return;

    const priced = toPricedRoom(blocked);
    const over = stayDays(closed, addDays(closed, 2));
    const upTo = stayDays(addDays(closed, -2), closed);

    expect(unavailableNights(priced, over)).toContain(closed);
    // Checking out on a closed date is fine — the guest is not sleeping in it.
    expect(unavailableNights(priced, upTo)).not.toContain(closed);
  });
});

function addDays(date: string, delta: number): string {
  const ms = Date.parse(`${date}T00:00:00.000Z`) + delta * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}
