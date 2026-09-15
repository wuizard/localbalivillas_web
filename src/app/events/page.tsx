import type { Metadata } from "next";
import { EnquiryForm } from "@/features/enquiry";
import { EventPackageCard, getEventPackages } from "@/features/event";
import { site } from "@/shared/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & celebrations at our Bali villas",
  description:
    "Birthdays, anniversaries, proposals and blessings arranged at our villas across Seminyak, Canggu, Ubud, Jimbaran and Uluwatu. Tell us your date and we'll quote it.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const packages = await getEventPackages();

  return (
    <div className="container-page flex flex-col gap-12 py-8 md:gap-16 md:py-14">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">Events</p>
        <h1 className="font-display text-display-lg text-fg mt-2">Celebrations at our villas</h1>
        <p className="text-body text-fg-muted mt-3 md:text-[1.0625rem] md:leading-7">
          A birthday dinner on the deck, a proposal timed to the light, a blessing with a priest
          and an interpreter. We arrange each one by hand with the villa team. Tell us the date
          and roughly what you have in mind, and we&rsquo;ll come back with what&rsquo;s possible
          and what it costs.
        </p>
      </header>

      {packages.length > 0 ? (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-display-sm text-fg">What we arrange</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg, index) => (
              <EventPackageCard key={pkg.id} pkg={pkg} priority={index < 3} />
            ))}
          </ul>
        </section>
      ) : null}

      <section id="enquire" className="max-w-2xl scroll-mt-24">
        <EnquiryForm
          kind="event"
          source="events_page"
          heading="Tell us about your celebration"
          intro={`Nothing is reserved by sending this. We'll read it, check what the villa team can do, and reply with a quote, usually the same day. You can also message us on WhatsApp at ${site.phoneDisplay}.`}
        />
      </section>
    </div>
  );
}
