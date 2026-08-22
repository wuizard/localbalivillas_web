import { z } from "zod";
import { apiGet } from "@/shared/api";

const DEALS_REVALIDATE_SECONDS = 900;

const couponSchema = z.object({
  _id: z.string(),
  couponCode: z.string(),
  couponType: z.enum(["nominal", "percentage"]).nullish(),
  couponUsage: z.string().nullish(),
  amount: z.number().nullish(),
  termsCondition: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  isActive: z.boolean().nullish(),
});

export type Deal = {
  id: string;
  code: string;
  headline: string;
  terms: string | null;
  endsOn: string | null;
};

function headlineFor(raw: z.infer<typeof couponSchema>): string {
  const amount = raw.amount ?? 0;
  const perNight = raw.couponUsage === "night" ? " per night" : "";

  if (raw.couponType === "percentage") return `${amount}% off${perNight}`;
  if (raw.couponType === "nominal") return `IDR ${amount.toLocaleString("en-US")} off${perNight}`;
  return "Discount available";
}

/**
 * `GET /coupon-list/`. Returns an empty array today, which the page renders as a real empty
 * state rather than inventing offers — a fake discount is a promise the checkout will break.
 */
export async function getDeals(): Promise<Deal[]> {
  try {
    const raw = await apiGet("/coupon-list/", z.array(couponSchema), {
      revalidate: DEALS_REVALIDATE_SECONDS,
      tags: ["deals"],
    });

    return raw
      .filter((coupon) => coupon.isActive !== false)
      .map((coupon) => ({
        id: coupon._id,
        code: coupon.couponCode,
        headline: headlineFor(coupon),
        terms: coupon.termsCondition?.trim() || null,
        endsOn: coupon.endDate ?? null,
      }));
  } catch {
    return [];
  }
}
