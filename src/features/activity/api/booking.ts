import { z } from "zod";
import { apiPost } from "@/shared/api";
import { env } from "@/shared/config/env";

const quoteSchema = z.object({
  date: z.string(),
  rates: z.object({ adult: z.number(), child: z.number() }),
  chargedAdults: z.number(),
  minimumApplied: z.boolean(),
  subtotal: z.number(),
  discount: z.number(),
  totalPrice: z.number(),
  seatsRemaining: z.number().nullish(),
});

const submitSchema = z.object({
  activityBookingId: z.string(),
  paymentLink: z.string().url(),
  subtotal: z.number(),
  discount: z.number(),
  totalPrice: z.number(),
});

/** What the server says a booking costs. Distinct from `quoteActivity()`, which is
 * the same maths run client-side to paint the calendar. */
export type ActivityQuoteResult = z.infer<typeof quoteSchema>;

export type ActivityBookingResult = {
  activityBookingId: string;
  paymentLink: string;
  totalPrice: number;
  simulated: boolean;
};

export type ActivityGuest = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  country?: string;
  pickupArea?: string;
  specialRequest?: string;
};

export type ActivityBookingInput = {
  activityKey: string;
  date: string;
  adult: number;
  child: number;
  couponCode?: string;
  guest: ActivityGuest;
};

/**
 * `POST /activity/quote`. The server is the only thing that prices a booking — this
 * asks it what the total is rather than trusting the number the page rendered. The
 * submit endpoint recomputes it again regardless; asking here is what stops the guest
 * seeing one figure and being charged another.
 */
export async function quoteActivityBooking(input: {
  activityKey: string;
  date: string;
  adult: number;
  child: number;
  couponCode?: string;
}): Promise<ActivityQuoteResult> {
  return apiPost(
    "/activity/quote",
    {
      activityId: input.activityKey,
      date: input.date,
      adult: input.adult,
      child: input.child,
      couponCode: input.couponCode,
    },
    quoteSchema,
  );
}

/**
 * `POST /activity/booking` creates a real, payable order and returns the hosted Xendit
 * link. Gated on `NEXT_PUBLIC_BOOKING_LIVE` exactly as the villa funnel is: a preview
 * build is a production build, so without the guard every preview deploy could take
 * money. The payload is built and validated either way — simulation skips only the
 * network call.
 */
export async function submitActivityBooking(
  input: ActivityBookingInput,
): Promise<ActivityBookingResult> {
  const payload = {
    activityId: input.activityKey,
    date: input.date,
    adult: input.adult,
    child: input.child,
    couponCode: input.couponCode || undefined,
    ...input.guest,
  };

  if (!env.liveBooking) {
    return {
      activityBookingId: "SIMULATED",
      paymentLink: `/booking/confirmation?simulated=1&activity=${encodeURIComponent(input.activityKey)}`,
      totalPrice: 0,
      simulated: true,
    };
  }

  const result = await apiPost("/activity/booking", payload, submitSchema);
  return {
    activityBookingId: result.activityBookingId,
    paymentLink: result.paymentLink,
    totalPrice: result.totalPrice,
    simulated: false,
  };
}
