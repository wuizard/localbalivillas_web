import type { MetadataRoute } from "next";
import { ABOUT_PAGES } from "@/features/content";
import { getProperties } from "@/features/property";
import { env } from "@/shared/config/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /activities and /events are deliberately absent: both are coming-soon placeholders and
  // carry `noindex`, so listing them here would ask Google to crawl what we tell it to skip.
  // Add them back the moment there is a catalogue behind them.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${env.siteUrl}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${env.siteUrl}/deals`, changeFrequency: "weekly", priority: 0.6 },
    ...ABOUT_PAGES.map((page) => ({
      url: `${env.siteUrl}/about-us/${page.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
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
