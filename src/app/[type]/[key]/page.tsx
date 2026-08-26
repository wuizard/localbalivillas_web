import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  BookingSteps,
  ImportantInformation,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  PropertyAbout,
  PropertyGallery,
  PropertyHeader,
  PropertyHighlights,
  PropertyMap,
  RoomOfferList,
  getProperties,
  getPropertyDetail,
  type PropertyDetail,
  type PropertyType,
} from "@/features/property";
import { PropertyReviews, getReviewsWithFallback, type GuestReview } from "@/features/review";
import { AvailabilityBar } from "@/features/search";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";
import { Skeleton } from "@/shared/ui";

type PageProps = {
  params: Promise<{ type: string; key: string }>;
};

function readType(value: string): PropertyType | null {
  return (PROPERTY_TYPES as readonly string[]).includes(value) ? (value as PropertyType) : null;
}

/** The URL's type segment must match the property's own, or two URLs serve one page. */
async function load(params: PageProps["params"]): Promise<PropertyDetail | null> {
  const { type, key } = await params;
  if (!readType(type)) return null;

  const property = await getPropertyDetail(key);
  if (!property || property.type !== type) return null;
  return property;
}

export const revalidate = 300;

/**
 * Every active property is prerendered at build. Indexability is the reason this rebuild
 * exists (CLAUDE.md §1), and a route rendered on demand is one Google may never see warm.
 * `dynamicParams` stays on by default, so a property added after a build still renders.
 */
export async function generateStaticParams() {
  try {
    const properties = await getProperties();
    return properties.map((property) => ({ type: property.type, key: property.key }));
  } catch {
    // A build must not fail because the API blipped; these fall back to on-demand rendering.
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await load(params);
  if (!property) return { title: "Property not found", robots: { index: false, follow: true } };

  const label = PROPERTY_TYPE_LABEL[property.type];
  const description =
    property.description[0]?.slice(0, 155) ??
    `Book ${property.name}, a ${label.toLowerCase()} in ${property.location}, Bali, direct with ${site.name}.`;

  return {
    title: `${property.name} — ${label} in ${property.location}, Bali`,
    description,
    alternates: { canonical: property.href },
    // Next merges `openGraph` shallowly, so the page object replaces the layout's outright —
    // siteName and locale have to be restated here or the share card loses them.
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_GB",
      title: property.name,
      description,
      url: `${env.siteUrl}${property.href}`,
      // No `images` here on purpose: an explicit list overrides the file convention, and
      // `opengraph-image.tsx` beside this file renders a 1200x630 card from our own domain
      // instead of linking the oversized, mistyped S3 original.
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await load(params);
  if (!property) notFound();

  const reviews = await getReviewsWithFallback([
    { id: property.id, name: property.name, href: property.href },
  ]);

  return (
    <article>
      <script
        type="application/ld+json"
        // Structured data only, built from values we already render on the page.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(property, reviews)) }}
      />

      <PropertyHeader property={property} />

      <div className="mt-4 md:mt-6">
        <PropertyGallery images={property.images} propertyName={property.name} />
      </div>

      <PropertyAbout property={property} />

      <PropertyHighlights property={property} />

      <BookingSteps />

      {/* The availability bar reads the URL, which a prerendered page cannot know at build.
          Suspense lets the rest of the page stay static while this one strip hydrates. */}
      <RoomOfferList
        property={property}
        availabilitySlot={
          <Suspense fallback={<Skeleton className="h-[58px] rounded-md md:h-[64px]" />}>
            <AvailabilityBar roomPricing={property.rooms.map((room) => room.pricing)} />
          </Suspense>
        }
      />

      <ImportantInformation groups={property.houseRuleGroups} />

      <PropertyReviews reviews={reviews} propertyName={property.name} />

      <PropertyMap property={property} />
    </article>
  );
}

function buildJsonLd(property: PropertyDetail, reviews: GuestReview[]) {
  /**
   * Only emitted when reviews exist. Demo reviews are gated out of production, so this can
   * never publish a rating nobody gave — a fabricated `AggregateRating` is a manual action
   * from Google and a consumer-protection problem besides.
   */
  const aggregateRating =
    reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
          ).toFixed(1),
          reviewCount: reviews.length,
          bestRating: 5,
          worstRating: 1,
        }
      : null;

  const offers = property.rooms
    .filter((room) => room.basePrice !== null)
    .map((room) => ({
      "@type": "Offer",
      name: room.name,
      price: room.basePrice,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: `${env.siteUrl}${property.href}`,
    }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        name: property.name,
        description: property.description[0],
        image: property.images.slice(0, 6),
        url: `${env.siteUrl}${property.href}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.location,
          addressRegion: "Bali",
          addressCountry: "ID",
        },
        ...(offers.length > 0 ? { makesOffer: offers } : {}),
        ...(aggregateRating ? { aggregateRating } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: env.siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: `${PROPERTY_TYPE_LABEL[property.type]}s`,
            item: `${env.siteUrl}/properties?type=${property.type}`,
          },
          { "@type": "ListItem", position: 3, name: property.name },
        ],
      },
    ],
  };
}
