import { PropertyGridSkeleton, Skeleton } from "@/shared/ui";

export default function WishlistLoading() {
  return (
    <div className="container-page py-8 md:py-14">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-56" />
      </header>

      <PropertyGridSkeleton count={4} />
    </div>
  );
}
