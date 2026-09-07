import type { Metadata } from "next";
import Link from "next/link";
import {
  ActivityCard,
  ActivityFilterBar,
  ActivitySearch,
  categoriesWithActivities,
  getActivities,
  getCategories,
  locationsWithActivities,
} from "@/features/activity";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Things to do in Bali",
  description:
    "Tours, transfers, snorkelling and cultural days across Bali, arranged by the team who look after your villa.",
  alternates: { canonical: "/activities" },
};

type PageProps = {
  searchParams: Promise<{ category?: string; location?: string; q?: string }>;
};

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { category, location, q } = await searchParams;

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

  const activities = hasFilters
    ? await getActivities({
        category: selectedCategories.length ? selectedCategories : null,
        location: selectedLocation,
        search: search || null,
      })
    : all;

  // A category is only offered when something sits behind it - an empty filtered page
  // is worse than no filter. Order follows the CMS.
  const present = new Set(categoriesWithActivities(all));
  const available = categories
    .filter((item) => present.has(item.slug))
    .map((item) => ({ value: item.slug, label: item.name }));
  const labels = Object.fromEntries(categories.map((item) => [item.slug, item.name]));

  const description = [
    search ? `matching “${search}”` : null,
    selectedCategories.length
      ? `in ${selectedCategories.map((slug) => labels[slug] ?? slug).join(" or ")}`
      : null,
    selectedLocation ? `around ${selectedLocation}` : null,
  ]
    .filter(Boolean)
    .join(" ");

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

      {all.length === 0 ? (
        <EmptyCatalogue />
      ) : (
        <>
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

          {activities.length === 0 ? (
            <NoMatches />
          ) : (
            <section className="flex flex-col gap-4">
              <p className="text-body-sm text-fg-muted">
                {hasFilters
                  ? `${activities.length} of ${all.length} ${all.length === 1 ? "activity" : "activities"} ${description}`
                  : `All ${activities.length} ${activities.length === 1 ? "activity" : "activities"}`}
              </p>

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
          )}
        </>
      )}
    </div>
  );
}

function NoMatches() {
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
