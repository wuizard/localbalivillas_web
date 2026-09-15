import type { DateRule } from "@/features/pricing";

/** One date/weekday override row. The base rate lives on `ActivityPricing`. */
export type ActivityRule = DateRule & {
  adultPrice: number;
  childPrice: number;
};

/**
 * The slug an activity is filed under. It used to be a fixed union here, which meant
 * a category added in the CMS could not appear on the site until someone shipped a
 * matching line of TypeScript. The taxonomy is managed in the CMS now, so this is an
 * open string and the display names come from `getCategories()`.
 */
export type ActivityCategory = string;

/** A category as the API describes it. `slug` is what an activity stores. */
export type ActivityCategoryInfo = {
  slug: string;
  name: string;
  description: string | null;
  /** Published activities in this category, per the API. */
  activityCount: number;
};

/**
 * Last-resort display name, for the odd place that has a slug but no list to look it
 * up in. Slugs are generated from the name, so this reads correctly for almost all of
 * them - "culinary-experience" comes back as "Culinary Experience". Punctuation is the
 * exception ("tour-activities" loses its ampersand), which is why anything rendering a
 * set of categories takes its labels from the API instead.
 */
export function humaniseCategory(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
  /** Bali or Lombok. */
  region: string;
  /** The area within the region - Ubud, Canggu, Nusa Dua. Empty when unset. */
  location: string;
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
  /**
   * Whether the CMS wants the "What's included" section on the page at all. An
   * activity with both lists empty hides it regardless; this is the switch for the
   * ones that have lines written but should not show them.
   */
  showInclusions: boolean;
  whatToBring: string[];
  meetingPoint: string | null;
  mapInfo: string | null;
  cancellationPolicy: string | null;
  childMaxAge: number | null;
};
