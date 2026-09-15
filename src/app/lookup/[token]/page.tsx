import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryStatusCard, lookupByToken } from "@/features/enquiry";

export const metadata: Metadata = {
  title: "Your enquiry",
  robots: { index: false, follow: false },
};

// The token is the credential, so this page is never cached or prerendered.
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export default async function LookupTokenPage({ params }: PageProps) {
  const { token } = await params;
  const record = await lookupByToken(token);

  return (
    <div className="container-page py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">Your enquiry</p>
        <h1 className="font-display text-display-lg text-fg mt-2">
          {record ? "Where things stand" : "This link didn't work"}
        </h1>
      </header>

      <div className="mt-8">
        {record ? (
          <EnquiryStatusCard record={record} />
        ) : (
          <div className="border-border bg-surface-muted max-w-md rounded-md border p-6">
            <p className="text-body text-fg-muted">
              The link may have been mistyped or truncated by an email client. You can look your
              enquiry up with the reference and your email address instead.
            </p>
            <Link
              href="/lookup"
              className="text-label text-brand-600 dark:text-brand-300 mt-4 inline-flex uppercase underline"
            >
              Find my enquiry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
