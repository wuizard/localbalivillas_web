import { describe, expect, it } from "vitest";
import { stayDays } from "./nights";
import { nightlyBreakdown, resolveNightlyRate, subtotalOf } from "./rates";
import type { PricedRoom } from "./types";

const room: PricedRoom = {
  basePrice: 2_500_000,
  priceRules: [
    // The base row the API stores alongside room.price — carries no override.
    { date: null, day: null, price: 2_500_000 },
    { date: ["2026-12-24", "2026-12-25"], day: null, price: 5_000_000 },
    { date: null, day: ["Saturday"], price: 3_000_000 },
  ],
  disabledDates: [],
};

describe("resolveNightlyRate", () => {
  it("falls back to the base price when no rule covers the night", () => {
    expect(resolveNightlyRate(room, "2026-08-25")).toBe(2_500_000);
  });

  it("applies an exact-date rule", () => {
    expect(resolveNightlyRate(room, "2026-12-25")).toBe(5_000_000);
  });

  it("applies a weekday rule", () => {
    // 2026-08-29 is a Saturday.
    expect(resolveNightlyRate(room, "2026-08-29")).toBe(3_000_000);
  });

  it("lets a date rule beat a weekday rule for the same night", () => {
    // 2026-12-26 is a Saturday, and the date rule covers 24–25 only, so Saturday wins.
    expect(resolveNightlyRate(room, "2026-12-26")).toBe(3_000_000);

    const clash: PricedRoom = {
      ...room,
      priceRules: [
        { date: null, day: ["Friday"], price: 3_000_000 },
        { date: ["2026-12-25"], day: null, price: 5_000_000 },
      ],
    };
    // 2026-12-25 is a Friday and matches both. Date must win, whatever the rule order.
    expect(resolveNightlyRate(clash, "2026-12-25")).toBe(5_000_000);
  });

  it("ignores the base row rather than treating it as an override", () => {
    const onlyBaseRow: PricedRoom = {
      basePrice: 1_000_000,
      priceRules: [{ date: null, day: null, price: 9_999_999 }],
      disabledDates: [],
    };
    expect(resolveNightlyRate(onlyBaseRow, "2026-08-25")).toBe(1_000_000);
  });
});

describe("nightlyBreakdown", () => {
  it("prices every night and never the checkout day", () => {
    const breakdown = nightlyBreakdown(room, stayDays("2026-12-23", "2026-12-26"));

    expect(breakdown).toEqual([
      { date: "2026-12-23", price: 2_500_000 },
      { date: "2026-12-24", price: 5_000_000 },
      { date: "2026-12-25", price: 5_000_000 },
    ]);
    // 26 Dec is the checkout date and is absent, even though a Saturday rule would cover it.
    expect(breakdown).toHaveLength(3);
  });

  it("is empty for a same-day range", () => {
    expect(nightlyBreakdown(room, stayDays("2026-08-25", "2026-08-25"))).toEqual([]);
  });
});

describe("subtotalOf", () => {
  it("multiplies by the room count", () => {
    const breakdown = nightlyBreakdown(room, stayDays("2026-08-25", "2026-08-28"));
    expect(subtotalOf(breakdown)).toBe(7_500_000);
    expect(subtotalOf(breakdown, 2)).toBe(15_000_000);
  });

  it("treats a zero or negative room count as one", () => {
    const breakdown = nightlyBreakdown(room, stayDays("2026-08-25", "2026-08-26"));
    expect(subtotalOf(breakdown, 0)).toBe(2_500_000);
  });
});
