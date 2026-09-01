import type { MetadataRoute } from "next";
import { getActivities } from "@/features/activity";
import { ABOUT_PAGES } from "@/features/content";
import { getEventPackages } from "@/features/event";
import { getProperties } from "@/features/property";
import { env } from "@/shared/config/env";

export const revalidate = 3600;

/** Each source fails on its own. One dead endpoint must not empty the whole sitemap. */
async function safely<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${env.siteUrl}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${env.siteUrl}/activities`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${env.siteUrl}/events`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${env.siteUrl}/deals`, changeFrequency: "weekly", priority: 0.6 },
    ...ABOUT_PAGES.map((page) => ({
      url: `${env.siteUrl}/about-us/${page.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];

  const [properties, activities, eventPackages] = await Promise.all([
    safely(getProperties),
    safely(getActivities),
    safely(getEventPackages),
  ]);

  return [
    ...staticRoutes,
    ...properties.map((property) => ({
      url: `${env.siteUrl}${property.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...activities.map((activity) => ({
      url: `${env.siteUrl}${activity.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...eventPackages.map((pkg) => ({
      url: `${env.siteUrl}${pkg.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
