import { z } from "zod";
import { apiPost } from "@/shared/api";

const staySchema = z.object({
  bookingId: z.string(),
  propertyName: z.string().nullish(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
});

/** The stay a villa booking covers. Dates only — the endpoint returns no guest details. */
export type StayWindow = z.infer<typeof staySchema>;

/**
 * `POST /booking/stay-lookup`. Email is required alongside the booking id because a
 * booking id is an identifier, not a secret: it sits in confirmation emails and gets
 * forwarded. The server answers with one message for every failure, so nothing here
 * should try to explain *why* a lookup failed.
 *
 * A stay that has already finished comes back as not found — there is no activity to
 * sell against it.
 */
export async function lookupStay(input: {
  bookingId: string;
  email: string;
}): Promise<StayWindow> {
  return apiPost(
    "/booking/stay-lookup",
    { bookingId: input.bookingId.trim(), email: input.email.trim() },
    staySchema,
  );
}

/** Every date from check-in to check-out inclusive, as YYYY-MM-DD. */
export function stayDates(stay: StayWindow): string[] {
  const out: string[] = [];
  const cursor = new Date(`${stay.checkIn}T00:00:00.000Z`);
  const last = new Date(`${stay.checkOut}T00:00:00.000Z`);
  while (cursor <= last) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}
