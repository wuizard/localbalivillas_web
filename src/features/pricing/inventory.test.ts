import { describe, expect, it } from "vitest";
import { isSoldOut, lowestRateOn, rateCalendar } from "./inventory";
import type { PricedRoom } from "./types";

/** Open on the 10th, closed on the 11th. Carries a New Year's Eve surcharge. */
const cheap: PricedRoom = {
  basePrice: 2_000_000,
  priceRules: [{ date: ["2026-12-31"], day: null, price: 6_000_000 }],
  disabledDates: ["2026-09-11"],
};

/** Closed on both the 10th and the 11th, so the 11th is a property-wide sell-out. */
const pricey: PricedRoom = {
  basePrice: 3_500_000,
  priceRules: [],
  disabledDates: ["2026-09-10", "2026-09-11"],
};

const rooms = [cheap, pricey];

describe("lowestRateOn", () => {
  it("is the cheapest room's rate for that night", () => {
    expect(lowestRateOn(rooms, "2026-08-25")).toBe(2_000_000);
  });

  it("follows a date override rather than the base price", () => {
    // The cheap room surcharges to 6M on NYE, so the pricey room becomes the cheapest.
    expect(lowestRateOn(rooms, "2026-12-31")).toBe(3_500_000);
  });

  it("ignores rooms that are blocked — an unbookable rate is not a price", () => {
    // Pricey is closed on the 10th, so the only bookable rate is the cheap room's.
    expect(lowestRateOn(rooms, "2026-09-10")).toBe(2_000_000);
  });

  it("is null when every room is closed", () => {
    expect(lowestRateOn(rooms, "2026-09-11")).toBeNull();
  });

  it("is null when the property has no rooms at all", () => {
    expect(lowestRateOn([], "2026-08-25")).toBeNull();
  });
});

describe("isSoldOut", () => {
  it("is false while any room is open", () => {
    expect(isSoldOut(rooms, "2026-09-10")).toBe(false);
  });

  it("is true only when every room is blocked", () => {
    expect(isSoldOut(rooms, "2026-09-11")).toBe(true);
  });

  it("does not call an empty property sold out", () => {
    expect(isSoldOut([], "2026-08-25")).toBe(false);
  });
});

describe("rateCalendar", () => {
  it("paints a window in one pass", () => {
    const map = rateCalendar(rooms, ["2026-08-25", "2026-09-10", "2026-09-11", "2026-12-31"]);

    expect(map.get("2026-08-25")).toEqual({ price: 2_000_000, soldOut: false });
    expect(map.get("2026-09-10")).toEqual({ price: 2_000_000, soldOut: false });
    expect(map.get("2026-09-11")).toEqual({ price: null, soldOut: true });
    expect(map.get("2026-12-31")).toEqual({ price: 3_500_000, soldOut: false });
  });
});
