import { Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { Price } from "@/shared/ui";
import { ACTIVITY_CATEGORY_LABEL, type ActivityDetail } from "../types";
import { formatDuration, partySizeLabel, priceSuffix } from "../lib/format";

export function ActivityHeader({ activity }: { activity: ActivityDetail }) {
  const duration = formatDuration(activity.durationMinutes);
  const party = partySizeLabel(activity.pricing);

  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="text-body-sm text-fg-muted flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/activities" className="hover:text-brand-600 dark:hover:text-brand-300">
              Activities
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/activities?category=${activity.category}`}
              className="hover:text-brand-600 dark:hover:text-brand-300"
            >
              {ACTIVITY_CATEGORY_LABEL[activity.category]}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-display-lg text-fg">{activity.name}</h1>

          <div className="text-body-sm text-fg-muted mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin size={15} strokeWidth={1.8} aria-hidden />
              {activity.region}
            </span>
            {duration ? (
              <span className="flex items-center gap-1.5">
                <Clock size={15} strokeWidth={1.8} aria-hidden />
                {duration}
              </span>
            ) : null}
            {party ? (
              <span className="flex items-center gap-1.5">
                <Users size={15} strokeWidth={1.8} aria-hidden />
                {party}
              </span>
            ) : null}
          </div>
        </div>

        {/* The rate is in the header so cost is never buried, the way the property
            header carries its from-price above the room list. */}
        <Price
          amount={activity.pricing.adult}
          suffix={priceSuffix(activity.pricing)}
          prefixLabel="From"
          className="shrink-0"
        />
      </div>
    </header>
  );
}
