import type { Metadata } from "next";
import {
  CategoryShelf,
  HomeHero,
  LocationsSection,
  TrustStrip,
  type CategoryTile,
} from "@/features/content";
import { FeaturedShelf, getFeaturedProperties, getPropertiesByKey } from "@/features/property";
import { ReviewWall, getReviewsWithFallback } from "@/features/review";
import { SearchBar, getDestinations } from "@/features/search";
import { site } from "@/shared/config/site";

export const metadata: Metadata = {
  title: `${site.name} | Luxury Villa Rentals in Bali`,
  description:
    "Book handpicked luxury villas, resorts and private retreats across Bali directly with " +
    "Local Bali Villas. Best rates guaranteed, local experts, 24/7 support.",
  alternates: { canonical: "/" },
  // Without these the share card inherits the layout's generic tagline as its description and
  // carries no url at all; the image comes from `app/opengraph-image.tsx`.
  openGraph: {
    title: `${site.name} | Luxury Villa Rentals in Bali`,
    description:
      "Book handpicked luxury villas, resorts and private retreats across Bali directly. " +
      "Best rates guaranteed, local experts, 24/7 support.",
    url: "/",
  },
};

/** Editorial picks. If a key disappears from the API the tile falls back to a featured villa. */
const HERO_KEY = "the-cove-bali";
const CATEGORY_KEYS = ["villa-morada", "amala-ubud", "villa-naga-sutra"] as const;

/**
 * Night frames, chosen by hand from the same library — the page shifts to evening on the
 * guest's local clock. A slot without an entry keeps its day photograph under a night
 * grade rather than showing a picture that misrepresents the place; add a key here the
 * moment real night photography exists for it.
 */
const NIGHT_FRAMES = [
  { slot: "hero", key: "hideout-bali", index: 26 },
  { slot: "villas", key: "leceni-villa", index: 19 },
  { slot: "events", key: "majapahit-villa", index: 20 },
] as const;

export default async function HomePage() {
  const [featured, editorial, destinations] = await Promise.all([
    getFeaturedProperties(4),
    getPropertiesByKey([
      HERO_KEY,
      ...CATEGORY_KEYS,
      ...NIGHT_FRAMES.map((frame) => frame.key),
    ]),
    getDestinations(),
  ]);

  const imageFor = (key: string, fallbackIndex: number) =>
    editorial.find((property) => property.key === key)?.images[0] ??
    featured[fallbackIndex]?.images[0] ??
    null;

  const nightFor = (slot: (typeof NIGHT_FRAMES)[number]["slot"]) => {
    const frame = NIGHT_FRAMES.find((candidate) => candidate.slot === slot);
    if (!frame) return null;
    return editorial.find((property) => property.key === frame.key)?.images[frame.index] ?? null;
  };

  const reviews = await getReviewsWithFallback(
    featured.map((property) => ({ id: property.id, name: property.name, href: property.href })),
  );

  const heroImage = imageFor(HERO_KEY, 0);

  const tiles: CategoryTile[] = [
    { key: "villas", image: imageFor(CATEGORY_KEYS[0], 1), nightImage: nightFor("villas") },
    { key: "activities", image: imageFor(CATEGORY_KEYS[1], 2) },
    { key: "events", image: imageFor(CATEGORY_KEYS[2], 3), nightImage: nightFor("events") },
  ];

  return (
    <>
      {heroImage ? (
        <HomeHero
          image={heroImage}
          nightImage={nightFor("hero")}
          imageAlt="A Bali villa at sunset, framed by coconut palms"
          searchSlot={<SearchBar destinations={destinations} />}
        />
      ) : null}

      <TrustStrip />

      <CategoryShelf tiles={tiles} />

      <FeaturedShelf properties={featured} />

      <LocationsSection available={destinations.map((destination) => destination.name)} />

      <ReviewWall reviews={reviews} />
    </>
  );
}
