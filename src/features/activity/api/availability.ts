import { z } from "zod";
import { apiGet } from "@/shared/api";

const daySchema = z.object({
  date: z.string(),
  adult: z.number(),
  child: z.number(),
  blocked: z.boolean(),
  past: z.boolean(),
  available: z.boolean(),
  seatsRemaining: z.number().nullish(),
});

const availabilitySchema = z.object({
  key: z.string(),
  basis: z.string(),
  minPax: z.number().nullish(),
  maxPax: z.number().nullish(),
  childMaxAge: z.number().nullish(),
  from: z.string(),
  to: z.string(),
  days: z.array(daySchema),
});

export type ActivityDay = {
  date: string;
  adult: number;
  child: number;
  available: boolean;
  blocked: boolean;
  past: boolean;
};

export type ActivityAvailability = {
  from: string;
  to: string;
  days: ActivityDay[];
};

/**
 * `GET /activity/:key/availability`. One request paints a whole calendar: the rate
 * on each date and whether it is open.
 *
 * Short revalidate, and never rendered from a stale cache offline — a rate the guest
 * can see is a rate they will hold us to, even before booking exists.
 */
export async function getActivityAvailability(
  key: string,
  from: string,
  to: string,
): Promise<ActivityAvailability> {
  const raw = await apiGet(
    `/activity/${encodeURIComponent(key)}/availability`,
    availabilitySchema,
    { revalidate: 300, tags: [`activity:${key}`], query: { from, to } },
  );

  return {
    from: raw.from,
    to: raw.to,
    days: raw.days.map((day) => ({
      date: day.date,
      adult: day.adult,
      child: day.child,
      available: day.available,
      blocked: day.blocked,
      past: day.past,
    })),
  };
}
