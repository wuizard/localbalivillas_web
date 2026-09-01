import type { DateRule } from "@/features/pricing";

/** One date/weekday override row. The base rate lives on `ActivityPricing`. */
export type ActivityRule = DateRule & {
  adultPrice: number;
  childPrice: number;
};

export const ACTIVITY_CATEGORIES = [
  "tour",
  "transfer",
  "wellness",
  "water",
  "culture",
  "adventure",
  "class",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const ACTIVITY_CATEGORY_LABEL: Record<ActivityCategory, string> = {
  tour: "Tours",
  transfer: "Transfers",
  wellness: "Wellness",
  water: "On the water",
  culture: "Culture",
  adventure: "Adventure",
  class: "Classes",
};

/**
 * Base rates only. Date and weekday overrides live in their own collection on the
 * backend and are not read here — this release lists and describes activities, it
 * does not quote a party on a date.
 */
export type ActivityPricing = {
  basis: "per_person" | "per_group";
  /** IDR integer. `null` when the activity has no published rate. */
  adult: number | null;
  child: number | null;
  minPax: number | null;
  maxPax: number | null;
};

export type ActivitySummary = {
  id: string;
  key: string;
  name: string;
  summary: string;
  category: ActivityCategory;
  region: string;
  images: string[];
  durationMinutes: number | null;
  pricing: ActivityPricing;
  href: string;
};

export type ActivityDetail = ActivitySummary & {
  /** Dates the activity cannot run. */
  disabledDates: string[];
  /** Date and weekday overrides. The base rate lives on `pricing`. */
  priceRules: ActivityRule[];
  description: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  whatToBring: string[];
  meetingPoint: string | null;
  mapInfo: string | null;
  cancellationPolicy: string | null;
  childMaxAge: number | null;
};
