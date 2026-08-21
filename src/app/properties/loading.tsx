import { PropertyGridSkeleton, Skeleton } from "@/shared/ui";

export default function PropertiesLoading() {
  return (
    <div className="container-page py-8 md:py-14">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
      </header>

      <PropertyGridSkeleton />
    </div>
  );
}
