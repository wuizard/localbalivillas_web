import { z } from "zod";
import { apiGet } from "@/shared/api";
import { htmlToParagraphs } from "@/shared/lib/html";
import type { EventPackageDetail, EventPackageSummary } from "../types";

const EVENTS_REVALIDATE_SECONDS = 300;

const packageSchema = z.object({
  _id: z.string(),
  key: z.string(),
  name: z.string(),
  summary: z.string().nullish(),
  description: z.string().nullish(),
  typicallyIncludes: z.array(z.string()).nullish(),
  packageImage: z.array(z.string()).nullish(),
  indicativeFrom: z.number().nullish(),
  indicativeTo: z.number().nullish(),
  suitableGuestsMin: z.number().nullish(),
  suitableGuestsMax: z.number().nullish(),
});

type RawPackage = z.infer<typeof packageSchema>;

function money(value: number | null | undefined): number | null {
  return typeof value === "number" && value > 0 ? Math.round(value) : null;
}

function count(value: number | null | undefined): number | null {
  return typeof value === "number" && value > 0 ? Math.floor(value) : null;
}

function toSummary(raw: RawPackage): EventPackageSummary {
  const key = raw.key.trim();
  return {
    id: raw._id,
    key,
    name: raw.name.trim(),
    summary: raw.summary?.trim() ?? "",
    images: (raw.packageImage ?? []).filter((url) => url.startsWith("http")),
    indicativeFrom: money(raw.indicativeFrom),
    indicativeTo: money(raw.indicativeTo),
    suitableGuestsMin: count(raw.suitableGuestsMin),
    suitableGuestsMax: count(raw.suitableGuestsMax),
    href: `/events/${key}`,
  };
}

export async function getEventPackages(): Promise<EventPackageSummary[]> {
  const raw = await apiGet("/event-packages", z.array(packageSchema), {
    revalidate: EVENTS_REVALIDATE_SECONDS,
    tags: ["event-packages"],
  });
  return raw.map(toSummary);
}

/** Returns null on a 404 so the route can render notFound() rather than a 500. */
export async function getEventPackageDetail(key: string): Promise<EventPackageDetail | null> {
  try {
    const raw = await apiGet(`/event-package/${encodeURIComponent(key)}`, packageSchema, {
      revalidate: EVENTS_REVALIDATE_SECONDS,
      tags: ["event-packages", `event-package:${key}`],
    });

    return {
      ...toSummary(raw),
      description: htmlToParagraphs(raw.description),
      typicallyIncludes: (raw.typicallyIncludes ?? []).map((item) => item.trim()).filter(Boolean),
    };
  } catch {
    return null;
  }
}
