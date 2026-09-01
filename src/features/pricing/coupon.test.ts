import { describe, expect, it } from "vitest";
import { applyCoupon, couponDiscount } from "./coupon";
import type { Coupon, NightRate } from "./types";

const breakdown: NightRate[] = [
  { date: "2026-08-25", price: 2_000_000 },
  { date: "2026-08-26", price: 2_000_000 },
  { date: "2026-08-27", price: 3_000_000 },
];

const subtotal = 7_000_000;
const nights = 3;

function base(coupon: Coupon | null, rooms = 1) {
  return { subtotal, nights, breakdown, rooms, coupon };
}

const NOMINAL_NIGHT: Coupon = { code: "N1", type: "nominal", usage: "night", amount: 100_000 };
const NOMINAL_TOTAL: Coupon = { code: "N2", type: "nominal", usage: "total", amount: 500_000 };
const PERCENT_NIGHT: Coupon = { code: "P1", type: "percentage", usage: "night", amount: 10 };
const PERCENT_TOTAL: Coupon = { code: "P2", type: "percentage", usage: "total", amount: 10 };

describe("the four coupon combinations", () => {
  it("nominal per night — amount once per night", () => {
    expect(couponDiscount(base(NOMINAL_NIGHT))).toBe(300_000);
  });

  it("nominal on the total — amount once", () => {
    expect(couponDiscount(base(NOMINAL_TOTAL))).toBe(500_000);
  });

  it("percentage per night — a share of each night, summed", () => {
    expect(couponDiscount(base(PERCENT_NIGHT))).toBe(700_000);
  });

  it("percentage on the total — a share of the subtotal", () => {
    expect(couponDiscount(base(PERCENT_TOTAL))).toBe(700_000);
  });
});

describe("room count", () => {
  it("scales a per-night nominal coupon with the rooms booked", () => {
    expect(couponDiscount({ ...base(NOMINAL_NIGHT, 2), subtotal: 14_000_000 })).toBe(600_000);
  });

  it("does not scale a whole-booking nominal coupon", () => {
    expect(couponDiscount({ ...base(NOMINAL_TOTAL, 2), subtotal: 14_000_000 })).toBe(500_000);
  });
});

describe("guard rails legacy does not have", () => {
  it("never discounts more than the stay costs", () => {
    const huge: Coupon = { code: "X", type: "nominal", usage: "total", amount: 99_000_000 };
    const { discount, total } = applyCoupon(base(huge));

    expect(discount).toBe(subtotal);
    expect(total).toBe(0);
  });

  it("never returns a negative total, which legacy would hand to a live payment link", () => {
    const huge: Coupon = { code: "X", type: "nominal", usage: "night", amount: 99_000_000 };
    expect(applyCoupon(base(huge)).total).toBeGreaterThanOrEqual(0);
  });

  it("keeps money in whole rupiah", () => {
    const odd: Coupon = { code: "O", type: "percentage", usage: "night", amount: 7.5 };
    const { discount, total } = applyCoupon(base(odd));

    expect(Number.isInteger(discount)).toBe(true);
    expect(Number.isInteger(total)).toBe(true);
  });

  it("ignores a missing, empty or zero-value coupon", () => {
    expect(couponDiscount(base(null))).toBe(0);
    expect(couponDiscount(base({ ...NOMINAL_TOTAL, amount: 0 }))).toBe(0);
  });

  it("discounts nothing when there is nothing to discount", () => {
    expect(couponDiscount({ ...base(PERCENT_TOTAL), subtotal: 0 })).toBe(0);
  });
});
