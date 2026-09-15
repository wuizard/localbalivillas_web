import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ActivityCheckoutForm,
  getActivityDetail,
  quoteActivityBooking,
} from "@/features/activity";

export const metadata: Metadata = {
  title: "Confirm and pay",
  // A checkout page has nothing to offer search, and it carries a date and party size
  // in its URL. Same treatment as /booking/*.
  robots: { index: false, follow: false },
};

// The quote must be current at the moment of payment, so this never renders from cache.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ date?: string; adult?: string; child?: string }>;
};

export default async function ActivityBookPage({ params, searchParams }: PageProps) {
  const [{ key }, query] = await Promise.all([params, searchParams]);

  const activity = await getActivityDetail(key);
  if (!activity) notFound();

  // Without a date there is nothing to price. Send them back to choose one rather than
  // rendering an empty checkout.
  if (!query.date) redirect(`/activities/${key}#dates`);

  const adult = Math.max(1, Number(query.adult) || activity.pricing.minPax || 1);
  const child = Math.max(0, Number(query.child) || 0);

  // Priced on the server. If the date has since filled, been blocked, or passed, this
  // throws and the guest is returned to the calendar instead of reaching a payment
  // button for something they cannot have.
  let quote;
  try {
    quote = await quoteActivityBooking({ activityKey: key, date: query.date, adult, child });
  } catch {
    redirect(`/activities/${key}?date=${query.date}&adult=${adult}&child=${child}#dates`);
  }

  return (
    <div className="container-page py-8 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="text-body-sm text-fg-muted flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/activities" className="hover:text-brand-600 dark:hover:text-brand-300">
              Activities
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/activities/${activity.key}`}
              className="hover:text-brand-600 dark:hover:text-brand-300"
            >
              {activity.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-fg">Confirm and pay</li>
        </ol>
      </nav>

      <h1 className="font-display text-display-lg text-fg">Confirm and pay</h1>
      <p className="text-body text-fg-muted mt-2 max-w-prose">
        Your place isn&rsquo;t held until payment completes.
      </p>

      <div className="mt-8">
        <ActivityCheckoutForm
          activity={activity}
          date={query.date}
          adult={adult}
          child={child}
          initialQuote={quote}
        />
      </div>
    </div>
  );
}
