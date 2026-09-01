import type { Metadata } from "next";
import Link from "next/link";
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_CATEGORY_LABEL,
  ActivityCard,
  categoriesWithActivities,
  getActivities,
  type ActivityCategory,
} from "@/features/activity";
import { cn } from "@/shared/lib/cn";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Things to do in Bali",
  description:
    "Tours, transfers, snorkelling and cultural days across Bali, arranged by the team who look after your villa.",
  alternates: { canonical: "/activities" },
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  const selected = (ACTIVITY_CATEGORIES as readonly string[]).includes(category ?? "")
    ? (category as ActivityCategory)
    : null;

  // The unfiltered list drives the filter rail, so a category is only offered when
  // something sits behind it — an empty filtered page is worse than no filter.
  const [all, activities] = await Promise.all([
    getActivities(),
    selected ? getActivities({ category: selected }) : Promise.resolve(null),
  ]);

  const shown = activities ?? all;
  const available = categoriesWithActivities(all);

  return (
    <div className="container-page flex flex-col gap-8 py-8 md:py-14">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">Activities</p>
        <h1 className="font-display text-display-lg text-fg mt-2">Things to do in Bali</h1>
        <p className="text-body text-fg-muted mt-3 md:text-[1.0625rem] md:leading-7">
          Days out, transfers and experiences we arrange for guests staying with us, with
          drivers and guides we use ourselves.
        </p>
      </header>

      {available.length > 1 ? (
        <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
          <FilterChip href="/activities" active={selected === null}>
            All
          </FilterChip>
          {available.map((value) => (
            <FilterChip
              key={value}
              href={`/activities?category=${value}`}
              active={selected === value}
            >
              {ACTIVITY_CATEGORY_LABEL[value]}
            </FilterChip>
          ))}
        </nav>
      ) : null}

      {shown.length === 0 ? (
        <div className="border-border bg-surface-muted max-w-2xl rounded-md border p-6">
          <h2 className="font-display text-title text-fg">Nothing here yet</h2>
          <p className="text-body text-fg-muted mt-2">
            We&rsquo;re still adding to this section. In the meantime our team arranges tours,
            transfers and days out directly. Message us and we&rsquo;ll put something together.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} priority={index < 3} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** A link, not a button — the filter is a URL so results stay shareable and crawlable. */
function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-label flex h-9 items-center rounded-full border px-4 uppercase transition-colors",
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-border text-fg hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
      )}
    >
      {children}
    </Link>
  );
}
