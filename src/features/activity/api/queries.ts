import { apiGet, isNotFound } from "@/shared/api";
import type { ActivityCategory, ActivityDetail, ActivitySummary } from "../types";
import { activityDetailSchema, activityListSchema, toActivityDetail, toActivitySummary } from "./schemas";

const ACTIVITIES_REVALIDATE_SECONDS = 300;

export type ActivityFilters = {
  category?: ActivityCategory | null;
  region?: string | null;
  search?: string | null;
};

/**
 * `GET /activities/list`. Drafts are excluded by the API, not here — a filter the
 * client applies is a filter a client can forget. Empty on a 404: the endpoint is not
 * live in every environment. See `isNotFound`.
 */
export async function getActivities(filters: ActivityFilters = {}): Promise<ActivitySummary[]> {
  try {
    const raw = await apiGet("/activities/list", activityListSchema, {
      revalidate: ACTIVITIES_REVALIDATE_SECONDS,
      tags: ["activities"],
      query: {
        category: filters.category ?? undefined,
        region: filters.region ?? undefined,
        search: filters.search ?? undefined,
      },
    });

    return raw.map(toActivitySummary);
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

/** `GET /activity/:key`. Returns null on a 404 so the route can render notFound(). */
export async function getActivityDetail(key: string): Promise<ActivityDetail | null> {
  try {
    const raw = await apiGet(`/activity/${encodeURIComponent(key)}`, activityDetailSchema, {
      revalidate: ACTIVITIES_REVALIDATE_SECONDS,
      tags: ["activities", `activity:${key}`],
    });
    return toActivityDetail(raw);
  } catch {
    return null;
  }
}

/**
 * Categories that actually have something in them. The nav dropdown and the filter
 * rail both read this: a category offering "Wellness" that lands on an empty list is
 * worse than not offering it.
 */
export function categoriesWithActivities(activities: ActivitySummary[]): ActivityCategory[] {
  return [...new Set(activities.map((activity) => activity.category))];
}
