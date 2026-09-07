import { existsSync } from "node:fs";
import path from "node:path";

/**
 * The activities tile is the one category we cannot illustrate from the property
 * library — a pool photograph does not say "things to do". These four frames ship with
 * the app rather than coming from the API: `/activities/list` is not live in production,
 * so an API-fed tile would render empty on the site that matters.
 *
 * Order is the reading order of the grid: top-left, top-right, bottom-left, bottom-right.
 */
const ACTIVITY_MOSAIC = [
  "/images/activities/candlelight-dinner.jpg",
  "/images/activities/mount-batur-sunrise.jpg",
  "/images/activities/snorkeling.jpg",
  "/images/activities/atv.jpg",
] as const;

/**
 * All four or none. A missing file is a broken `next/image` on the home page, so until
 * every frame is in `public/` the tile keeps its single-photograph fallback.
 */
export function getActivityMosaic(): readonly string[] | null {
  const present = ACTIVITY_MOSAIC.every((src) =>
    existsSync(path.join(process.cwd(), "public", src)),
  );

  return present ? ACTIVITY_MOSAIC : null;
}
