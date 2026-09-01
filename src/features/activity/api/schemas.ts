import { z } from "zod";
import { htmlToParagraphs } from "@/shared/lib/html";
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  type ActivityDetail,
  type ActivitySummary,
} from "../types";

/** The API hands back raw Mongo documents; map them here so `__v` never reaches a component. */
const pricingSchema = z
  .object({
    basis: z.string().nullish(),
    adult: z.number().nullish(),
    child: z.number().nullish(),
    minPax: z.number().nullish(),
    maxPax: z.number().nullish(),
  })
  .nullish();

/** Arrays default to `null` in the schema, so every list field tolerates it. */
const stringList = z.array(z.string()).nullish();

/** One date/weekday override row. The base row is the activity's own `pricing`. */
const priceRuleSchema = z.object({
  date: stringList,
  day: stringList,
  adultPrice: z.number().nullish(),
  childPrice: z.number().nullish(),
});

const activitySchema = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string(),
  summary: z.string().nullish(),
  description: z.string().nullish(),
  highlights: stringList,
  category: z.string().nullish(),
  region: z.string().nullish(),
  location: z.string().nullish(),
  activityImage: stringList,
  durationMinutes: z.number().nullish(),
  pricing: pricingSchema,
  childMaxAge: z.number().nullish(),
  meetingPoint: z.string().nullish(),
  mapInfo: z.string().nullish(),
  inclusions: stringList,
  exclusions: stringList,
  whatToBring: stringList,
  cancellationPolicy: z.string().nullish(),
  disabledDate: stringList,
  priceList: z.array(priceRuleSchema).nullish(),
});

export const activityListSchema = z.array(activitySchema);
export const activityDetailSchema = activitySchema;

type RawActivity = z.infer<typeof activitySchema>;

function toCategory(value: string | null | undefined): ActivityCategory {
  return (ACTIVITY_CATEGORIES as readonly string[]).includes(value ?? "")
    ? (value as ActivityCategory)
    : "tour";
}

/** A zero rate is "not published", not "free" — `Price` renders null as "on request". */
function money(value: number | null | undefined): number | null {
  return typeof value === "number" && value > 0 ? Math.round(value) : null;
}

function count(value: number | null | undefined): number | null {
  return typeof value === "number" && value > 0 ? Math.floor(value) : null;
}

function list(value: string[] | null | undefined): string[] {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

export function toActivitySummary(raw: RawActivity): ActivitySummary {
  const key = raw.key.trim();

  return {
    id: raw._id,
    key,
    name: raw.name.trim(),
    summary: raw.summary?.trim() ?? "",
    category: toCategory(raw.category),
    region: raw.region?.trim() || raw.location?.trim() || "Bali",
    images: (raw.activityImage ?? []).filter((url) => url.startsWith("http")),
    durationMinutes: count(raw.durationMinutes),
    pricing: {
      basis: raw.pricing?.basis === "per_group" ? "per_group" : "per_person",
      adult: money(raw.pricing?.adult),
      child: money(raw.pricing?.child),
      minPax: count(raw.pricing?.minPax),
      maxPax: count(raw.pricing?.maxPax),
    },
    href: `/activities/${key}`,
  };
}

export function toActivityDetail(raw: RawActivity): ActivityDetail {
  return {
    ...toActivitySummary(raw),
    description: htmlToParagraphs(raw.description),
    highlights: list(raw.highlights),
    inclusions: list(raw.inclusions),
    exclusions: list(raw.exclusions),
    whatToBring: list(raw.whatToBring),
    meetingPoint: raw.meetingPoint?.trim() || null,
    mapInfo: raw.mapInfo?.trim() || null,
    cancellationPolicy: raw.cancellationPolicy?.trim() || null,
    childMaxAge: count(raw.childMaxAge),
    disabledDates: list(raw.disabledDate),
    // Base rows (both fields null) are dropped: the base lives on `pricing`, and
    // keeping a copy here would give the resolver two places to disagree.
    priceRules: (raw.priceList ?? [])
      .filter((rule) => (rule.date?.length ?? 0) > 0 || (rule.day?.length ?? 0) > 0)
      .map((rule) => ({
        date: rule.date ?? null,
        day: rule.day ?? null,
        adultPrice: Math.round(rule.adultPrice ?? 0),
        childPrice: Math.round(rule.childPrice ?? 0),
      })),
  };
}
