import { describe, expect, it } from "vitest";
import { lowestNightlyRate, quoteStay } from "./quote";
import type { Coupon, PricedRoom } from "./types";

const room: PricedRoom = {
  basePrice: 2_000_000,
  priceRules: [
    { date: null, day: null, price: 2_000_000 },
    { date: ["2026-12-31"], day: null, price: 6_000_000 },
    { date: null, day: ["Saturday"], price: 2_500_000 },
  ],
  disabledDates: ["2026-09-10"],
};

describe("quoteStay", () => {
  it("prices a plain three-night stay", () => {
    const quote = quoteStay({ room, checkIn: "2026-08-25", checkOut: "2026-08-28" });

    expect(quote.nights).toBe(3);
    expect(quote.breakdown).toHaveLength(3);
    expect(quote.subtotal).toBe(6_000_000);
    expect(quote.discount).toBe(0);
    expect(quote.total).toBe(6_000_000);
    expect(quote.available).toBe(true);
  });

  it("mixes base, weekday and date rates across one stay", () => {
    // 2026-12-29 Tue, 30 Wed, 31 Thu (date rule) — checkout 1 Jan is not charged.
    const quote = quoteStay({ room, checkIn: "2026-12-29", checkOut: "2027-01-01" });

    expect(quote.breakdown.map((night) => night.price)).toEqual([
      2_000_000,
      2_000_000,
      6_000_000,
    ]);
    expect(quote.subtotal).toBe(10_000_000);
  });

  it("multiplies the whole stay by the number of rooms", () => {
    const quote = quoteStay({ room, checkIn: "2026-08-25", checkOut: "2026-08-28", rooms: 3 });

    expect(quote.rooms).toBe(3);
    expect(quote.subtotal).toBe(18_000_000);
  });

  it("reports a stay that covers a blocked night as unavailable", () => {
    const quote = quoteStay({ room, checkIn: "2026-09-09", checkOut: "2026-09-12" });

    expect(quote.available).toBe(false);
    expect(quote.blockedNights).toEqual(["2026-09-10"]);
  });

  it("still allows a stay that merely checks out on a blocked date", () => {
    const quote = quoteStay({ room, checkIn: "2026-09-08", checkOut: "2026-09-10" });

    expect(quote.available).toBe(true);
    expect(quote.blockedNights).toEqual([]);
  });

  it("applies a coupon to the subtotal it just computed", () => {
    const coupon: Coupon = { code: "P10", type: "percentage", usage: "total", amount: 10 };
    const quote = quoteStay({ room, checkIn: "2026-08-25", checkOut: "2026-08-28", coupon });

    expect(quote.subtotal).toBe(6_000_000);
    expect(quote.discount).toBe(600_000);
    expect(quote.total).toBe(5_400_000);
    expect(quote.coupon?.code).toBe("P10");
  });

  it("returns a zero quote for a same-day range rather than throwing", () => {
    const quote = quoteStay({ room, checkIn: "2026-08-25", checkOut: "2026-08-25" });

    expect(quote.nights).toBe(0);
    expect(quote.subtotal).toBe(0);
    expect(quote.total).toBe(0);
  });

  it("returns a zero quote when check-out precedes check-in", () => {
    const quote = quoteStay({ room, checkIn: "2026-08-28", checkOut: "2026-08-25" });
    expect(quote.nights).toBe(0);
    expect(quote.total).toBe(0);
  });
});

describe("lowestNightlyRate", () => {
  it("is the cheapest rate the room ever charges, not just its base", () => {
    const discounted: PricedRoom = {
      basePrice: 2_000_000,
      priceRules: [
        { date: null, day: null, price: 2_000_000 },
        { date: ["2026-05-05"], day: null, price: 1_200_000 },
      ],
      disabledDates: [],
    };
    expect(lowestNightlyRate(discounted)).toBe(1_200_000);
  });

  it("is the base price when every override costs more", () => {
    expect(lowestNightlyRate(room)).toBe(2_000_000);
  });

  it("ignores the base row masquerading as an override", () => {
    const onlyBase: PricedRoom = {
      basePrice: 900_000,
      priceRules: [{ date: null, day: null, price: 9_999_999 }],
      disabledDates: [],
    };
    expect(lowestNightlyRate(onlyBase)).toBe(900_000);
  });
});
