import { ArrowRight, CalendarHeart, Home, Palmtree } from "lucide-react";
import Link from "next/link";
import { TimeAwareImage } from "@/shared/ui/TimeAwareImage";

export type CategoryTile = {
  key: "villas" | "activities" | "events";
  image: string | null;
  nightImage?: string | null;
};

const CATEGORIES = {
  villas: {
    title: "Villas",
    description: "Beautiful places to stay for every kind of traveler",
    cta: "Explore villas",
    href: "/properties",
    icon: Home,
  },
  activities: {
    title: "Activities",
    description: "Discover amazing things to do in Bali",
    cta: "Explore activities",
    href: "/activities",
    icon: Palmtree,
  },
  events: {
    title: "Events",
    description: "Weddings, birthdays, and special moments we make magical",
    cta: "Explore events",
    href: "/events",
    icon: CalendarHeart,
  },
} as const;

export function CategoryShelf({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section aria-label="Browse by category" className="pt-8 md:container-page md:pt-20">
      {/* Three stacked 4:3 tiles cost three screens on a phone, so mobile gets a snap rail. */}
      <ul
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto no-scrollbar px-4 scroll-px-4 pb-2
                   md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0"
      >
        {tiles.map(({ key, image, nightImage }) => {
          const category = CATEGORIES[key];
          const Icon = category.icon;

          return (
            <li key={key} className="w-[70vw] shrink-0 snap-start sm:w-[48vw] md:w-auto">
              <Link
                href={category.href}
                className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-md text-center"
              >
                {image ? (
                  <TimeAwareImage
                    day={image}
                    night={nightImage}
                    alt=""
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <span aria-hidden className="absolute inset-0 bg-brand-200" />
                )}

                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
                />

                <span className="relative flex w-full flex-col items-center gap-2.5 px-5 pb-5 md:gap-3 md:px-6">
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-colors duration-200 group-hover:bg-white/25 md:size-14">
                    <Icon size={22} strokeWidth={1.6} aria-hidden />
                  </span>

                  <span className="font-display text-xl tracking-[0.06em] text-white uppercase md:text-2xl">
                    {category.title}
                  </span>

                  {/* Fixed two-line box so the icon and title align across all three tiles. */}
                  <span className="flex min-h-10 max-w-[16rem] items-start justify-center text-body-sm text-white/85">
                    {category.description}
                  </span>

                  <span className="mt-2 flex w-full items-center justify-center gap-2 border-t border-white/25 pt-3.5 text-label text-white uppercase md:mt-3 md:pt-4">
                    {category.cta}
                    <ArrowRight
                      size={14}
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                    />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
