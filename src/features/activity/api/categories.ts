import { z } from "zod";
import { apiGet, isNotFound } from "@/shared/api";
import { humaniseCategory, type ActivityCategoryInfo } from "../types";

/**
 * The tag the CMS busts when a category is added, renamed, reordered or removed.
 * `POST /api/revalidate` on this site does the busting; see that route.
 */
export const CATEGORIES_TAG = "categories";

/**
 * An hour, not the five minutes the activity lists use. The taxonomy changes rarely
 * and a change invalidates the tag immediately, so the window only matters if that
 * webhook is missed.
 */
const CATEGORIES_REVALIDATE_SECONDS = 3600;

const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  activityCount: z.number().nullish(),
});

/**
 * `GET /categories`. Active categories only, in the order set in the CMS.
 *
 * Empty on a 404, matching `getActivities`: the endpoint is not live in every
 * environment, and a missing taxonomy should cost the filter rail, not the page.
 */
export async function getCategories(): Promise<ActivityCategoryInfo[]> {
  try {
    const raw = await apiGet("/categories", z.array(categorySchema), {
      revalidate: CATEGORIES_REVALIDATE_SECONDS,
      tags: [CATEGORIES_TAG],
    });

    return raw.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description ?? null,
      activityCount: category.activityCount ?? 0,
    }));
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
}

/** Slug to display name, for rendering a single activity's badge. */
export async function getCategoryLabels(): Promise<Record<string, string>> {
  const categories = await getCategories();
  return Object.fromEntries(categories.map((category) => [category.slug, category.name]));
}

/** The name for one slug, falling back to the humanised slug when it is not in the list. */
export function categoryLabel(labels: Record<string, string>, slug: string): string {
  return labels[slug] ?? humaniseCategory(slug);
}
