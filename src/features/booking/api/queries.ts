import { z } from "zod";
import { stayDays, type IsoDate } from "@/features/pricing";
import { apiPost } from "@/shared/api";
import { env } from "@/shared/config/env";
import { BASE_CURRENCY, formatMoney } from "@/shared/currency";
import type { AppliedCoupon, BookingDraft, BookingResult, GuestDetails } from "../types";

const couponSchema = z.object({
  couponCode: z.string(),
  couponType: z.enum(["nominal", "percentage"]),
  couponUsage: z.string().nullish(),
  amount: z.number(),
  termsCondition: z.string().nullish(),
});

/**
 * `POST /booking/coupon-check`. The server validates the code against the property and the
 * dates; the discount itself is then computed by `features/pricing`, never here, so the
 * summary and the room card can never disagree about what a coupon is worth.
 */
export async function checkCoupon(input: {
  code: string;
  propertyId: string;
  dates: IsoDate[];
  total: number;
}): Promise<AppliedCoupon> {
  const raw = await apiPost(
    "/booking/coupon-check",
    {
      couponCode: input.code,
      dates: input.dates,
      total: input.total,
      propertyId: input.propertyId,
    },
    couponSchema,
  );

  return {
    code: raw.couponCode,
    type: raw.couponType,
    usage: raw.couponUsage === "night" ? "night" : "total",
    amount: raw.amount,
    label:
      raw.couponType === "percentage"
        ? `${raw.amount}% off${raw.couponUsage === "night" ? " each night" : ""}`
        : `Fixed discount${raw.couponUsage === "night" ? " per night" : ""}`,
  };
}

const submitSchema = z.object({
  paymentLink: z.string().url(),
});

export type SubmitInput = {
  draft: BookingDraft;
  guest: GuestDetails;
  coupon: AppliedCoupon | null;
  subtotal: number;
  total: number;
};

/**
 * Field-for-field with what the legacy front end posts (`../lbv_fe` OrderSummary → the
 * spread of `form` over `bookingData`), because that is the only description of this
 * endpoint that exists. Three things are worth knowing before changing any of it:
 *
 * - `totalDays` is `days.length`, which is **nights + 1** — `days` runs check-in through
 *   check-out inclusive and nobody sleeps on the night they leave.
 * - the occupancy field is `kids`, not `children`.
 * - `value` is the formatted *pre-coupon* subtotal. It is display text in a money payload
 *   and almost certainly ignored, but it is carried for parity rather than guessed at.
 *
 * The one deliberate deviation: `startDate`/`endDate` go as `YYYY-MM-DD`. Legacy sends
 * `Date` objects, which JSON-serialise to UTC and shift a Bali midnight back to 16:00 the
 * previous day — that is how you book the wrong night. The plain dates also match the
 * entries in `days`.
 */
function toPayload({ draft, guest, coupon, subtotal, total }: SubmitInput) {
  const days = stayDays(draft.checkIn, draft.checkOut);

  return {
    ...guest,
    firstName: guest.firstName.trim(),
    lastName: guest.lastName.trim(),
    propertyId: draft.propertyId,
    placeId: draft.propertyId,
    placeName: draft.propertyName,
    roomId: draft.roomId,
    roomName: draft.roomName,
    startDate: draft.checkIn,
    endDate: draft.checkOut,
    days,
    totalDays: days.length,
    rooms: draft.rooms,
    adult: draft.adults,
    kids: draft.children,
    childrenAge: null,
    value: formatMoney(subtotal, BASE_CURRENCY),
    priceList: draft.breakdown,
    subtotal,
    totalPrice: total,
    voucherInfo: coupon
      ? {
          voucherCode: coupon.code,
          nominal: coupon.amount,
          discountType: coupon.type,
          couponUsage: coupon.usage,
        }
      : null,
  };
}

/**
 * `POST /booking/submit` creates a real, non-refundable reservation and returns the hosted
 * payment link the guest is handed off to. There is no staging environment — both env files
 * point at the production API — so it fires only where `NEXT_PUBLIC_BOOKING_LIVE=1` is set,
 * and everywhere else returns a simulated link rather than booking a villa nobody asked for.
 * The payload is built and type-checked either way; the only step simulation skips is the
 * network round trip.
 *
 * Still outstanding before launch: confirm with the backend that the endpoint is idempotent,
 * per the duplicate-booking risk in CLAUDE.md §12. Nothing here can make a replayed POST
 * safe on its own.
 */
export async function submitBooking(input: SubmitInput): Promise<BookingResult> {
  const payload = toPayload(input);

  if (!env.liveBooking) {
    return {
      paymentLink: `/booking/confirmation?simulated=1&property=${encodeURIComponent(
        input.draft.propertyKey,
      )}`,
      simulated: true,
    };
  }

  const result = await apiPost("/booking/submit", payload, submitSchema);
  return { paymentLink: result.paymentLink, simulated: false };
}

export const __testing = { toPayload };
