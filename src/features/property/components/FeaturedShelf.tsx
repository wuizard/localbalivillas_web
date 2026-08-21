import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ButtonLink, SectionHeading } from "@/shared/ui";
import type { PropertySummary } from "../types";
import { PropertyCard } from "./PropertyCard";

type FeaturedShelfProps = {
  properties: PropertySummary[];
};

export function FeaturedShelf({ properties }: FeaturedShelfProps) {
  if (properties.length === 0) return null;

  return (
    <section aria-label="Featured villas" className="py-10 md:container-page md:py-20">
      {/* App pattern on mobile: title left, "View all" right. The ornamental centred heading
          returns from md, where there is room for it to breathe. Only one is ever rendered,
          so the accessibility tree never sees two headings for one shelf. */}
      <div className="flex items-center justify-between gap-4 px-4 md:hidden">
        <h2 className="font-display text-display-sm text-fg">Explore Top Villas</h2>
        <Link
          href="/properties"
          className="flex shrink-0 items-center gap-0.5 text-body-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          View all
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </Link>
      </div>

      <div className="max-md:hidden">
        <SectionHeading
          eyebrow="Our handpicked villas"
          title="Luxury stays, unforgettable moments"
        />
      </div>

      <ul
        className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar px-4 scroll-px-4 pb-2
                   md:mt-10 md:grid md:grid-cols-2 md:overflow-visible md:px-0
                   lg:grid-cols-4"
      >
        {properties.map((property, index) => (
          <li key={property.id} className="w-[46vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
            <PropertyCard property={property} priority={index === 0} className="h-full" />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center max-md:hidden md:mt-10">
        <ButtonLink href="/properties" variant="outline" size="lg">
          View all villas
        </ButtonLink>
      </div>
    </section>
  );
}
