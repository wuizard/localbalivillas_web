import { revalidateTag } from "next/cache";
import { CATEGORIES_TAG } from "@/features/activity";

/**
 * Cache busting for the CMS.
 *
 * Categories are cached for an hour, which is the right window for a list that changes
 * a few times a year — but "a few times a year" is exactly when someone is watching to
 * see their change appear. The CMS calls this after a category is created, renamed,
 * reordered, switched off or deleted, and the next request rebuilds against fresh data.
 *
 * The secret is required, not optional: an open endpoint here lets anyone force this
 * site to re-fetch the API as fast as they can send requests.
 */
const ALLOWED_TAGS = new Set([CATEGORIES_TAG, "activities"]);

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    // Loud, and a 500 rather than a 401: the deployment is misconfigured, the caller is fine.
    return Response.json(
      { revalidated: false, message: "REVALIDATE_SECRET is not set on this deployment" },
      { status: 500 },
    );
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret") ??
    "";

  if (provided !== secret) {
    return Response.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tag?: string } | null;
  const tag = body?.tag ?? CATEGORIES_TAG;

  if (!ALLOWED_TAGS.has(tag)) {
    return Response.json(
      { revalidated: false, message: `Unknown tag: ${tag}` },
      { status: 400 },
    );
  }

  // Next 16 wants a cache profile alongside the tag. `{ expire: 0 }` says "this entry
  // is stale now", which is the whole point of the call.
  revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tag, now: Date.now() });
}
