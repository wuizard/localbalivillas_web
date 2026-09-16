import type { Metadata } from "next";
import Link from "next/link";
import { getReviewInvite, ReviewInviteForm, StayCard } from "@/features/review";
import { whatsappHref } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Review your stay",
  robots: { index: false, follow: false },
};

// The token is the credential, so this page is never cached or prerendered.
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export default async function ReviewInvitePage({ params }: PageProps) {
  const { token } = await params;
  const invite = await getReviewInvite(token);

  // Expired and revoked both mean "ask us for another one" — an expired link is not the
  // guest's mistake, so neither reads like an error page.
  const unusable = !invite || invite.status === "expired" || invite.status === "revoked";

  if (unusable) {
    return (
      <div className="container-page flex flex-col items-center py-16 md:py-24">
        <div className="border-border bg-surface w-full max-w-md rounded-[var(--radius-md)] border p-8 text-center shadow-[var(--shadow-sm)]">
          <h1 className="font-display text-display-sm text-fg">This link isn&apos;t active</h1>
          <p className="text-body text-fg-muted mt-3">
            {invite?.status === "expired"
              ? "Review links stay open for a week. Message us and we'll send a fresh one — it takes a second."
              : "It may have been mistyped, cut short by a messaging app, or replaced by a newer one. Message us and we'll send another."}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-500 text-label hover:bg-brand-600 mt-6 inline-flex h-11 items-center justify-center rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase transition-colors"
          >
            Message us
          </a>
          <Link
            href="/"
            className="text-body-sm text-fg-muted hover:text-fg mt-4 block underline-offset-2 hover:underline"
          >
            Back to Local Bali Villas
          </Link>
        </div>
      </div>
    );
  }

  const firstName = invite.guestName.split(" ").filter(Boolean)[0];

  return (
    <div className="container-page py-8 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-label text-brand-600 dark:text-brand-300 uppercase">
            {invite.status === "submitted" ? "Your review" : "Your stay"}
          </p>
          <h1 className="font-display text-display-lg text-fg mt-2 text-balance">
            {invite.status === "submitted"
              ? "Thank you for writing this"
              : `How was ${invite.propertyName || "your stay"}?`}
          </h1>
          <p className="text-body text-fg-muted mt-3">
            {invite.status === "submitted"
              ? "It is with our team now."
              : `${firstName ? `Thanks for staying with us, ${firstName}. ` : ""}A few honest lines help the next guest more than anything we could write ourselves.`}
          </p>
        </header>

        {/* The stay leads on mobile — it is the reminder of what is being reviewed — and
            sits alongside on desktop, where the form should be the first thing in the eye. */}
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <StayCard invite={invite} />
          <ReviewInviteForm token={token} invite={invite} />
        </div>
      </div>
    </div>
  );
}
