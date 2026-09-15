import { Clock, ImageOff, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/shared/ui";
import { humaniseCategory, type ActivitySummary } from "../types";
import { formatDuration, priceSuffix } from "../lib/format";

/**
 * `categoryLabel` is passed down by the page, which has the list from the API. Without
 * it the slug is humanised, so a card rendered somewhere that has not fetched the
 * taxonomy still reads properly rather than showing a raw slug.
 */
export function ActivityCard({
  activity,
  priority,
  categoryLabel,
}: {
  activity: ActivitySummary;
  priority?: boolean;
  categoryLabel?: string;
}) {
  const duration = formatDuration(activity.durationMinutes);
  const cover = activity.images[0] ?? null;
  const label = categoryLabel ?? (activity.category ? humaniseCategory(activity.category) : null);

  return (
    <li className="border-border bg-surface flex flex-col overflow-hidden rounded-md border shadow-sm">
      <Link href={activity.href} className="group flex flex-1 flex-col">
        <div className="bg-surface-muted relative aspect-[4/3] overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            /* An activity without photography is a CMS gap, not a broken card - say so
               quietly rather than leaving a grey hole in the grid. */
            <span
              aria-hidden
              className="text-fg-subtle absolute inset-0 flex items-center justify-center"
            >
              <ImageOff size={28} strokeWidth={1.4} />
            </span>
          )}
          {label ? (
            <span className="bg-surface/90 text-label text-fg absolute top-3 left-3 rounded-sm px-2 py-1 uppercase backdrop-blur-sm">
              {label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-display text-title text-fg group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {activity.name}
          </h3>

          <p className="text-body-sm text-fg-muted line-clamp-2">{activity.summary}</p>

          <div className="text-body-sm text-fg-subtle mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.8} aria-hidden />
              {activity.location || activity.region}
            </span>
            {duration ? (
              <span className="flex items-center gap-1.5">
                <Clock size={14} strokeWidth={1.8} aria-hidden />
                {duration}
              </span>
            ) : null}
          </div>

          <Price
            amount={activity.pricing.adult}
            suffix={priceSuffix(activity.pricing)}
            prefixLabel="From"
            className="border-border mt-1 border-t pt-3"
          />
        </div>
      </Link>
    </li>
  );
}
