import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ActivityAbout,
  ActivityBookingBar,
  ActivityGallery,
  ActivityHeader,
  ActivityLogistics,
  InclusionList,
  categoryLabel,
  getActivities,
  getActivityAvailability,
  getActivityDetail,
  getCategoryLabels,
} from "@/features/activity";
import { EnquiryForm } from "@/features/enquiry";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";

export const revalidate = 300;

/** Two months is what the calendar paints, and as far ahead as rates are trustworthy. */
const WINDOW_DAYS = 60;

export async function generateStaticParams() {
  try {
    const activities = await getActivities();
    return activities.map((activity) => ({ key: activity.key }));
  } catch {
    return [];
  }
}

type PageProps = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { key } = await params;
  const activity = await getActivityDetail(key);

  if (!activity) return { title: "Not found", robots: { index: false, follow: false } };

  return {
    title: `${activity.name}: ${activity.region}, Bali`,
    description: activity.summary || `${activity.name} in ${activity.region}, Bali.`,
    alternates: { canonical: `/activities/${activity.key}` },
    openGraph: {
      title: activity.name,
      description: activity.summary,
      images: activity.images.slice(0, 1),
    },
  };
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isoIn(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

export default async function ActivityPage({ params }: PageProps) {
  const { key } = await params;

  const activity = await getActivityDetail(key);
  if (!activity) notFound();

  // Names come from the CMS taxonomy; the slug is humanised if it is not in the list.
  const labels = await getCategoryLabels().catch(() => ({}));
  const categoryName = activity.category ? categoryLabel(labels, activity.category) : null;

  // A dead availability endpoint costs the calendar, not the page.
  const availability = await getActivityAvailability(key, isoToday(), isoIn(WINDOW_DAYS)).catch(
    () => null,
  );

  /**
   * Date and party live in the URL, and they are read on the client — by the booking
   * bar and by the enquiry form. Reading them here instead would opt the whole route
   * out of static rendering, which is the one thing this page cannot afford.
   */
  const days = availability?.days ?? [];

  /**
   * No `Offer` markup. An offer asserts this is buyable at this price right now, and
   * it is not yet — the page ends in a conversation. The type describes what the
   * thing is; price returns with the booking release.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: activity.name,
    description: activity.summary,
    ...(activity.images.length > 0 ? { image: activity.images } : {}),
    address: { "@type": "PostalAddress", addressRegion: activity.region, addressCountry: "ID" },
    isAccessibleForFree: false,
    publicAccess: true,
    provider: { "@type": "Organization", name: site.name, url: env.siteUrl },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Activities", item: `${env.siteUrl}/activities` },
      // The category rung is dropped rather than faked when the activity has none.
      ...(categoryName
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: categoryName,
              item: `${env.siteUrl}/activities?category=${activity.category}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: categoryName ? 3 : 2, name: activity.name },
    ],
  };

  return (
    <div className="container-page flex flex-col gap-10 py-8 md:gap-14 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <ActivityHeader activity={activity} categoryLabel={categoryName ?? undefined} />
      <ActivityGallery images={activity.images} name={activity.name} />
      <ActivityAbout activity={activity} />

      {/* Third, not fifth. A villa page defers its rooms because there is a lot to
          compare first; an activity has one price and one date, so there is nothing
          to defer. */}
      {days.length > 0 ? (
        <Suspense fallback={null}>
          <ActivityBookingBar activity={activity} days={days} />
        </Suspense>
      ) : null}

      <InclusionList activity={activity} />
      <ActivityLogistics activity={activity} />

      <section id="enquire" className="max-w-2xl scroll-mt-24">
        <EnquiryForm
          kind="activity"
          source="direct"
          subjectRef={activity.id}
          subjectName={activity.name}
          heading="Check your date with us"
          intro="Online booking for activities is coming. Put your date and numbers below and we'll confirm availability and the price with you directly. Nothing is charged, and nothing is held until we've replied."
        />
      </section>
    </div>
  );
}
