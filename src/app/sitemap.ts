import type { MetadataRoute } from "next";
import { getProperties } from "@/features/property";
import { env } from "@/shared/config/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${env.siteUrl}/properties`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const properties = await getProperties();
    return [
      ...staticRoutes,
      ...properties.map((property) => ({
        url: `${env.siteUrl}${property.href}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A sitemap missing property URLs beats a 500 that de-indexes the site.
    return staticRoutes;
  }
}
