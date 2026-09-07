import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import {
  ActivityCard,
  ActivityFilterBar,
  ActivitySearch,
  categoriesWithActivities,
  getActivities,
  getCategories,
  locationsWithActivities,
  type ActivitySummary,
} from "@/features/activity";

export const revalidate = 300;

/** Per category on the browse view, before "See all" takes over. */
const SHELF_SIZE = 4;

export const metadata: Metadata = {
  title: "Things to do in Bali",
  description:
    "Tours, transfers, snorkelling and cultural days across Bali, arranged by the team who look after your villa.",
  alternates: { canonical: "/activities" },
};

type PageProps = {
  searchParams: Promise<{ category?: string; location?: string; q?: string; view?: string }>;
};

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { category, location, q, view } = await searchParams;

  // The taxonomy comes from the CMS, so a category is valid when it is in that list -
  // not when it matches a hard-coded union that only changes on a deploy.
  const [categories, all] = await Promise.all([getCategories(), getActivities()]);
  const known = new Set(categories.map((item) => item.slug));

  // Several at once, comma separated: ?category=marine,nature
  const selectedCategories = (category ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => known.has(slug));

  // Areas come from the catalogue rather than a list of their own: an area is only a
  // filter once something runs there.
  const areas = locationsWithActivities(all);
  const selectedLocation = location && areas.includes(location) ? location : null;
  const search = (q ?? "").trim();

  const hasFilters = selectedCategories.length > 0 || Boolean(selectedLocation) || Boolean(search);
  // `view=all` is the explicit "show me everything in one list", so the flat view can
  // be reached without first picking a filter.
  const isFlat = hasFilters || view === "all";

  const filtered = hasFilters
    ? await getActivities({
        category: selectedCategories.length ? selectedCategories : null,
        location: selectedLocation,
        search: search || null,
      })
    : null;

  // A category is only offered when something sits behind it - an empty filtered page
  // is worse than no filter. Order follows the CMS.
  const present = new Set(categoriesWithActivities(all));
  const withActivities = categories.filter((item) => present.has(item.slug));
  const available = withActivities.map((item) => ({ value: item.slug, label: item.name }));
  const labels = Object.fromEntries(categories.map((item) => [item.slug, item.name]));

  const shelves = withActivities.map((item) => ({
    ...item,
    activities: all.filter((activity) => activity.category === item.slug),
  }));

  return (
    <div className="container-page flex flex-col gap-8 py-8 md:py-14">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">Activities</p>
        <h1 className="font-display text-display-lg text-fg mt-2">Things to do in Bali</h1>
        <p className="text-body text-fg-muted mt-3 md:text-[1.0625rem] md:leading-7">
          Days out, transfers and experiences we arrange for guests staying with us, with drivers
          and guides we use ourselves.
        </p>
      </header>

      {all.length > 0 ? (
        <div className="flex flex-col gap-3">
          <ActivitySearch
            key={`${selectedCategories.join(",")}-${selectedLocation ?? ""}-${search}`}
            categories={selectedCategories}
            location={selectedLocation}
            initial={search}
          />

          {available.length > 1 || areas.length > 1 ? (
            <ActivityFilterBar
              categories={available}
              locations={areas}
              selectedCategories={selectedCategories}
              selectedLocation={selectedLocation}
              search={search || null}
            />
          ) : null}
        </div>
      ) : null}

      {isFlat ? (
        <FlatList
          activities={filtered ?? all}
          labels={labels}
          total={all.length}
          categoryNames={selectedCategories.map((slug) => labels[slug] ?? slug)}
          location={selectedLocation}
          search={search}
        />
      ) : shelves.length === 0 ? (
        <EmptyCatalogue />
      ) : (
        <>
          <div className="flex flex-col gap-12">
            {shelves.map((shelf) => (
              <section key={shelf.slug} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                  <div>
                    <h2 className="font-display text-display-sm text-fg">{shelf.name}</h2>
                    {shelf.description ? (
                      <p className="text-body-sm text-fg-muted mt-1 max-w-prose">
                        {shelf.description}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={`/activities?category=${shelf.slug}`}
                    className="text-body-sm text-brand-600 dark:text-brand-300 inline-flex items-center gap-1 hover:underline"
                  >
                    {shelf.activities.length > SHELF_SIZE
                      ? `See all ${shelf.activities.length}`
                      : "See category"}
                    <ChevronRight size={15} strokeWidth={2} aria-hidden />
                  </Link>
                </div>

                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {shelf.activities.slice(0, SHELF_SIZE).map((activity, index) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      priority={index < 2}
                      categoryLabel={shelf.name}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* The shelves show a slice each, so the page needs somewhere to say
              "everything, in one list" - otherwise the only way to the full catalogue
              is to guess that a category pill is the way in. */}
          <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center">
            <p className="text-body text-fg-muted">
              {all.length} {all.length === 1 ? "activity" : "activities"} across{" "}
              {withActivities.length}{" "}
              {withActivities.length === 1 ? "category" : "categories"}.
            </p>
            <Link
              href="/activities?view=all"
              className="bg-brand-500 text-label hover:bg-brand-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-white uppercase transition-colors"
            >
              <LayoutGrid size={16} strokeWidth={2} aria-hidden />
              View all activities
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function FlatList({
  activities,
  labels,
  total,
  categoryNames,
  location,
  search,
}: {
  activities: ActivitySummary[];
  labels: Record<string, string>;
  total: number;
  categoryNames: string[];
  location: string | null;
  search: string;
}) {
  const filtering = categoryNames.length > 0 || Boolean(location) || Boolean(search);

  if (activities.length === 0) {
    return (
      <div className="border-border bg-surface-muted max-w-2xl rounded-md border p-6">
        <h2 className="font-display text-title text-fg">Nothing matches that</h2>
        <p className="text-body text-fg-muted mt-2">
          Try another category or area, or{" "}
          <Link href="/activities" className="text-brand-600 dark:text-brand-300 underline">
            browse everything
          </Link>
          .
        </p>
      </div>
    );
  }

  const description = [
    search ? `matching “${search}”` : null,
    categoryNames.length ? `in ${categoryNames.join(" or ")}` : null,
    location ? `around ${location}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-sm text-fg-muted">
          {filtering
            ? `${activities.length} of ${total} ${total === 1 ? "activity" : "activities"} ${description}`
            : `All ${activities.length} ${activities.length === 1 ? "activity" : "activities"}`}
        </p>
        <Link
          href="/activities"
          className="text-body-sm text-brand-600 dark:text-brand-300 hover:underline"
        >
          Browse by category
        </Link>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            priority={index < 3}
            categoryLabel={labels[activity.category]}
          />
        ))}
      </ul>
    </section>
  );
}

function EmptyCatalogue() {
  return (
    <div className="border-border bg-surface-muted max-w-2xl rounded-md border p-6">
      <h2 className="font-display text-title text-fg">Nothing here yet</h2>
      <p className="text-body text-fg-muted mt-2">
        We&rsquo;re still adding to this section. In the meantime our team arranges tours,
        transfers and days out directly. Message us and we&rsquo;ll put something together.
      </p>
    </div>
  );
}
