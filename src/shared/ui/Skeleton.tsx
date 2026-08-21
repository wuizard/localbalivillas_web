import { cn } from "@/shared/lib/cn";

/**
 * Placeholder block. Skeletons must mirror the final layout exactly (DESIGN.md §5) — a
 * skeleton that is the wrong height just moves the layout shift rather than removing it.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-sm bg-surface-muted", className)} />;
}

/** Mirrors PropertyCard: 4:3 image, title, location, rating row, price row. */
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <Skeleton className="aspect-[4/3] rounded-none" />

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Skeleton className="h-[1.625rem] w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-5 w-2/5" />

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-2.5">
          <div className="flex w-full flex-col gap-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-2.5 w-10" />
          </div>
          <Skeleton className="size-8 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <PropertyCardSkeleton className="h-full" />
        </li>
      ))}
    </ul>
  );
}
