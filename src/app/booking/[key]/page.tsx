import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm, type BookingDraft } from "@/features/booking";
import { quoteStay } from "@/features/pricing";
import { getPropertyDetail } from "@/features/property";
import { ButtonLink } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return first && first.length > 0 ? first : null;
}

function count(value: string | string[] | undefined, fallback: number): number {
  const parsed = Number(one(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function BookingPage({ params, searchParams }: PageProps) {
  const [{ key }, query] = await Promise.all([params, searchParams]);

  const property = await getPropertyDetail(key);
  if (!property) notFound();

  const roomId = one(query.room);
  const room = property.rooms.find((candidate) => candidate.id === roomId) ?? property.rooms[0];
  const checkIn = one(query.checkIn);
  const checkOut = one(query.checkOut);

  // Without dates there is nothing to price, so send the guest back rather than guessing.
  if (!room || !checkIn || !checkOut) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-display-sm text-fg">Choose your dates first</h1>
        <p className="mt-3 max-w-md text-body text-fg-muted">
          We need your arrival and departure dates before we can show you a total.
        </p>
        <ButtonLink href={property.href} size="lg" className="mt-6">
          Back to {property.name}
        </ButtonLink>
      </div>
    );
  }

  const rooms = count(query.rooms, 1);
  const quote = quoteStay({ room: room.pricing, checkIn, checkOut, rooms });

  const draft: BookingDraft = {
    propertyId: property.id,
    propertyKey: property.key,
    propertyName: property.name,
    propertyHref: property.href,
    location: property.location,
    image: room.images[0] ?? property.images[0] ?? null,
    roomId: room.id,
    roomName: room.name,
    checkIn,
    checkOut,
    nights: quote.nights,
    rooms: quote.rooms,
    adults: count(query.adults, 2),
    children: count(query.children, 0),
    breakdown: quote.breakdown,
    subtotal: quote.subtotal,
    available: quote.available && quote.nights > 0,
  };

  return (
    <div className="container-page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-body-sm text-fg-muted">
        <Link href={property.href} className="hover:text-brand-600">
          ← Back to {property.name}
        </Link>
      </nav>

      <h1 className="mt-3 font-display text-display-lg text-fg">Complete your booking</h1>

      {draft.available ? null : (
        <p
          role="alert"
          className="mt-5 rounded-md border border-danger/40 bg-danger/10 p-4 text-body text-fg"
        >
          Those dates are no longer available for this room. Pick different dates and we&apos;ll
          re-check.
        </p>
      )}

      <div className="mt-6 md:mt-8">
        <BookingForm draft={draft} />
      </div>
    </div>
  );
}
