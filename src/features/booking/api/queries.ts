import { z } from "zod";
import type { IsoDate } from "@/features/pricing";
import { apiPost } from "@/shared/api";
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

function toPayload({ draft, guest, coupon, subtotal, total }: SubmitInput) {
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
    totalDays: draft.nights,
    rooms: draft.rooms,
    adult: draft.adults,
    children: draft.children,
    childrenAge: null,
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
 * `POST /booking/submit` creates a real, non-refundable reservation against a live payment
 * link. There is no staging environment to point at right now, so outside production this
 * simulates the call rather than booking a villa nobody asked for — the payload is still
 * built and type-checked, so the only untested step is the network round trip.
 *
 * Before this ships: verify the payload field-by-field against the backend and confirm the
 * endpoint is idempotent, per the duplicate-booking risk in CLAUDE.md §12.
 */
export async function submitBooking(input: SubmitInput): Promise<BookingResult> {
  const payload = toPayload(input);

  if (process.env.NODE_ENV !== "production") {
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
