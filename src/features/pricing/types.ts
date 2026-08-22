/** `YYYY-MM-DD`, the only date shape the API speaks. */
export type IsoDate = string;

/**
 * One row of a room's `priceList`. A row with both `date` and `day` null is the base row the
 * API stores alongside the room's own `price`; it carries no override.
 */
export type PriceRule = {
  date: IsoDate[] | null;
  /** Weekday names as the API writes them: "Monday", "Tuesday"… */
  day: string[] | null;
  price: number;
};

export type PricedRoom = {
  /** IDR integer. Used for any night no rule covers. */
  basePrice: number;
  priceRules: PriceRule[];
  /** Nights the room cannot be occupied. */
  disabledDates: IsoDate[];
};

export type NightRate = {
  date: IsoDate;
  price: number;
};

export type CouponType = "nominal" | "percentage";

/** `night` applies the coupon per night; anything else applies it once to the total. */
export type CouponUsage = "night" | "total";

export type Coupon = {
  code: string;
  type: CouponType;
  usage: CouponUsage;
  /** Rupiah for `nominal`, percent (0–100) for `percentage`. */
  amount: number;
};

export type Quote = {
  nights: number;
  rooms: number;
  /** One entry per night, in stay order. Excludes the checkout day. */
  breakdown: NightRate[];
  /** Nightly rates summed, multiplied by room count. */
  subtotal: number;
  discount: number;
  /** `subtotal - discount`, never below zero. */
  total: number;
  coupon: Coupon | null;
};
