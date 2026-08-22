import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/shared/ui";
import type { PropertyDetail } from "../types";
import { RoomOfferCard } from "./RoomOfferCard";

/**
 * Room cards quote from the dates in the URL, which a prerendered page cannot know at build
 * time, so they hydrate behind a Suspense boundary and show this until they do.
 */
function RoomListSkeleton({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-4 md:gap-5">
      {Array.from({ length: Math.max(count, 1) }, (_, index) => (
        <li key={index}>
          <Skeleton className="h-[420px] rounded-md lg:h-[280px]" />
        </li>
      ))}
    </ul>
  );
}

type RoomOfferListProps = {
  property: PropertyDetail;
  /** The availability picker, owned by the search feature and injected by the route. */
  availabilitySlot: ReactNode;
};

export function RoomOfferList({ property, availabilitySlot }: RoomOfferListProps) {
  return (
    <section aria-labelledby="find-your-stay" className="relative">
      <div className="relative overflow-hidden bg-brand-900 py-10 md:py-14">
        {property.images[1] ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${property.images[1]})` }}
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-900 to-brand-900/60" />

        <div className="container-page relative">
          <h2 id="find-your-stay" className="font-display text-display-sm text-white md:text-4xl">
            Find your perfect stay
          </h2>
          <p className="mt-2 max-w-md text-body-sm text-white/80 md:text-body">
            Choose from our selection of private villas and suites designed for your comfort.
          </p>
        </div>
      </div>

      <div className="container-page relative z-10 -mt-8 md:-mt-9">{availabilitySlot}</div>

      <div className="container-page pt-8 md:pt-10">
        {property.rooms.length === 0 ? (
          <p className="rounded-md border border-border bg-surface-muted p-6 text-body text-fg-muted">
            Room details for this property aren&apos;t published yet. Message us on WhatsApp and
            we&apos;ll send availability and rates the same day.
          </p>
        ) : (
          <Suspense fallback={<RoomListSkeleton count={property.rooms.length} />}>
            <ul className="flex flex-col gap-4 md:gap-5">
              {property.rooms.map((room) => (
                <li key={room.id}>
                  <RoomOfferCard
                    room={room}
                    propertyKey={property.key}
                    propertyType={property.type}
                  />
                </li>
              ))}
            </ul>
          </Suspense>
        )}
      </div>
    </section>
  );
}
