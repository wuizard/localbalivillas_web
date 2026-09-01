import { MessageCircle, Tag } from "lucide-react";
import type { Metadata } from "next";
import { getDeals } from "@/features/content";
import { site, whatsappHref } from "@/shared/config/site";
import { ButtonLink } from "@/shared/ui";
import { htmlToParagraphs } from "@/shared/lib/html";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Deals & promo codes",
  description: `Current promo codes for direct bookings with ${site.name}. Book direct for the best rate.`,
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="container-page py-8 md:py-14">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 uppercase dark:text-brand-300">Deals</p>
        <h1 className="mt-2 font-display text-display-lg text-fg">Promo codes</h1>
        <p className="mt-3 text-body text-fg-muted">
          Booking direct is already the best rate we offer. When we run a promotion, the code
          appears here. Enter it at checkout and the discount is applied to your total.
        </p>
      </header>

      {deals.length === 0 ? (
        <div className="mt-8 flex max-w-2xl flex-col items-start gap-4 rounded-md border border-border bg-surface-muted p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface text-brand-500">
            <Tag size={22} strokeWidth={1.6} aria-hidden />
          </span>
          <h2 className="font-display text-title text-fg">No promotions running right now</h2>
          <p className="text-body text-fg-muted">
            We would rather show you nothing than a code that fails at checkout. Our best-price
            guarantee still applies to every direct booking, and if you are travelling with a
            group or for longer than a fortnight, message us. We quote those by hand.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <ButtonLink href="/properties" size="md">
              Browse villas
            </ButtonLink>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center gap-2 rounded-sm border border-brand-500 px-5 text-label font-semibold tracking-[0.08em] text-brand-600 uppercase dark:text-brand-300"
            >
              <MessageCircle size={15} strokeWidth={1.8} aria-hidden />
              Ask for a quote
            </a>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <li
              key={deal.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5 shadow-sm"
            >
              <span className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
                <Tag size={16} strokeWidth={1.8} aria-hidden />
                <span className="text-label uppercase">Promo code</span>
              </span>

              <p className="font-display text-title text-fg">{deal.headline}</p>

              <p className="tabular rounded-sm border border-dashed border-brand-300 bg-brand-50 px-3 py-2 text-body font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {deal.code}
              </p>

              {deal.terms
                ? htmlToParagraphs(deal.terms).map((line) => (
                    <p key={line} className="text-body-sm text-fg-muted">
                      {line}
                    </p>
                  ))
                : null}

              {deal.endsOn ? (
                <p className="mt-auto text-body-sm text-fg-subtle">Ends {deal.endsOn.slice(0, 10)}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
