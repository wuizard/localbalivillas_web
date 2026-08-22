import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { site, whatsappHref } from "@/shared/config/site";
import { ButtonLink, Skeleton } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Booking received",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const simulated = query.simulated === "1";

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Suspense fallback={<Skeleton className="h-14 w-14 rounded-full" />}>
        <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} strokeWidth={1.8} aria-hidden />
        </span>
      </Suspense>

      <h1 className="mt-5 font-display text-display-lg text-fg">Thank you</h1>

      <p className="mt-3 max-w-md text-body text-fg-muted">
        Your booking request is in. Your confirmation is emailed by our team and that email is
        the record of your reservation — this page is not.
      </p>

      {simulated ? (
        <p
          role="status"
          className="mt-6 max-w-md rounded-md border border-border bg-surface-muted p-4 text-body-sm text-fg"
        >
          <strong>Development mode.</strong> No booking was created and nothing was charged. The
          submit call is simulated outside production so a real, non-refundable reservation is
          never made by accident during testing.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/properties" size="lg">
          Browse more villas
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Back home
        </ButtonLink>
      </div>

      <ul className="mt-10 flex flex-col items-center gap-2 text-body-sm text-fg-muted">
        <li className="flex items-center gap-2">
          <Mail size={15} strokeWidth={1.7} className="text-brand-400" aria-hidden />
          {site.email}
        </li>
        <li>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-brand-600 hover:underline dark:text-brand-300"
          >
            <MessageCircle size={15} strokeWidth={1.7} aria-hidden />
            Message us on WhatsApp
          </a>
        </li>
      </ul>
    </div>
  );
}
