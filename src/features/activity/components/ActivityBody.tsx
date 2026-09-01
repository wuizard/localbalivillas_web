import { Backpack, Check, Info, MapPin, Sparkles, X } from "lucide-react";
import type { ActivityDetail } from "../types";

export function ActivityAbout({ activity }: { activity: ActivityDetail }) {
  if (activity.description.length === 0 && activity.highlights.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 id="about-activity" className="font-display text-display-sm text-fg">
        About this activity
      </h2>

      {activity.description.map((paragraph) => (
        <p key={paragraph} className="text-body text-fg-muted max-w-prose leading-relaxed">
          {paragraph}
        </p>
      ))}

      {activity.highlights.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-2">
          {activity.highlights.map((item) => (
            <li key={item} className="text-body text-fg flex items-start gap-2.5">
              <Sparkles size={16} strokeWidth={1.9} className="text-brand-500 mt-1 shrink-0" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/**
 * Included and not included sit side by side deliberately. The exclusions column is the
 * one that prevents arguments on the day, so it gets equal weight rather than a
 * footnote under the inclusions.
 */
export function InclusionList({ activity }: { activity: ActivityDetail }) {
  if (activity.inclusions.length === 0 && activity.exclusions.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 id="whats-included" className="font-display text-display-sm text-fg">
        What&rsquo;s included
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Column
          title="Included"
          items={activity.inclusions}
          icon={Check}
          tone="text-success"
        />
        <Column
          title="Not included"
          items={activity.exclusions}
          icon={X}
          tone="text-fg-subtle"
        />
      </div>
    </section>
  );
}

function Column({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof Check;
  tone: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="border-border bg-surface-muted rounded-md border p-5">
      <h3 className="text-label text-fg uppercase">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="text-body-sm text-fg flex items-start gap-2.5">
            <Icon size={15} strokeWidth={2} className={`mt-1 shrink-0 ${tone}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityLogistics({ activity }: { activity: ActivityDetail }) {
  const rows = [
    activity.meetingPoint
      ? { icon: MapPin, title: "Where you'll meet", body: activity.meetingPoint }
      : null,
    activity.whatToBring.length > 0
      ? { icon: Backpack, title: "What to bring", body: activity.whatToBring.join(" · ") }
      : null,
    activity.cancellationPolicy
      ? { icon: Info, title: "If plans change", body: activity.cancellationPolicy }
      : null,
    activity.childMaxAge
      ? {
          icon: Info,
          title: "Child rate",
          body: `Applies up to age ${activity.childMaxAge}. Above that, the adult rate applies.`,
        }
      : null,
  ].filter((row): row is { icon: typeof MapPin; title: string; body: string } => row !== null);

  if (rows.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 id="good-to-know" className="font-display text-display-sm text-fg">
        Good to know
      </h2>

      <dl className="border-border divide-border divide-y rounded-md border">
        {rows.map((row) => (
          <div key={row.title} className="flex items-start gap-3 p-4">
            <row.icon size={17} strokeWidth={1.8} className="text-brand-500 mt-0.5 shrink-0" aria-hidden />
            <div>
              <dt className="text-label text-fg uppercase">{row.title}</dt>
              <dd className="text-body-sm text-fg-muted mt-1">{row.body}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
