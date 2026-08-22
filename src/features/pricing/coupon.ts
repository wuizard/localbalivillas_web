import type { Coupon, NightRate } from "./types";

export type CouponInput = {
  subtotal: number;
  nights: number;
  breakdown: NightRate[];
  rooms: number;
  coupon: Coupon | null;
};

/**
 * The four combinations of `couponType` × `couponUsage`, ported from `OrderSummary.js`:
 *
 * | type       | usage | discount                                   |
 * |------------|-------|--------------------------------------------|
 * | nominal    | night | amount × nights                            |
 * | nominal    | total | amount, once                               |
 * | percentage | night | amount% of each night, summed              |
 * | percentage | total | amount% of the subtotal                    |
 *
 * Two things legacy gets wrong that are fixed here, because both are money bugs:
 *
 *  1. **No floor.** Legacy computes `subtotal - discount` unclamped, so a coupon worth more
 *     than the stay produces a negative total and is handed to a live payment link. Clamped
 *     at zero.
 *  2. **Floats.** Legacy sums unrounded percentages, so a total can carry fractional rupiah.
 *     All money here is integer IDR (CLAUDE.md §4); each night is rounded before summing,
 *     which is also how a per-night discount is actually invoiced.
 */
export function couponDiscount({
  subtotal,
  nights,
  breakdown,
  rooms,
  coupon,
}: CouponInput): number {
  if (!coupon || coupon.amount <= 0 || subtotal <= 0) return 0;

  const roomCount = Math.max(rooms, 1);
  const raw = (() => {
    if (coupon.type === "nominal") {
      return coupon.usage === "night" ? coupon.amount * nights * roomCount : coupon.amount;
    }

    const rate = coupon.amount / 100;
    if (coupon.usage === "night") {
      const perRoom = breakdown.reduce(
        (total, night) => total + Math.round(night.price * rate),
        0,
      );
      return perRoom * roomCount;
    }

    return Math.round(subtotal * rate);
  })();

  return Math.min(Math.max(Math.round(raw), 0), subtotal);
}

export function applyCoupon(input: CouponInput): { discount: number; total: number } {
  const discount = couponDiscount(input);
  return { discount, total: input.subtotal - discount };
}
