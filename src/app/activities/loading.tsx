import { ActivityGridSkeleton, Skeleton } from "@/shared/ui";

/**
 * Every filter is a URL (see ActivityFilterBar), so each pill is a server round trip -
 * this is what a guest sees between clicking "Marine" and the narrowed grid, not just on
 * a cold first load. It mirrors the real page down to the count line above the grid.
 */
export default function ActivitiesLoading() {
  return (
    <div className="container-page flex flex-col gap-8 py-8 md:py-14">
      <header className="flex max-w-2xl flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </header>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full rounded-full" />

        <div className="flex gap-2">
          <Skeleton className="h-11 w-full rounded-full sm:hidden" />
          {/* The pill row is only ever rendered from sm up. */}
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="hidden h-9 w-28 rounded-full sm:block" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <ActivityGridSkeleton />
      </div>
    </div>
  );
}
