import type { Metadata } from "next";
import { LookupForm } from "@/features/enquiry";
import { site } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Find your enquiry",
  description: "Look up an enquiry with your reference and the email you used.",
  // Nothing to index: the page is useless without a reference someone already holds.
  robots: { index: false, follow: false },
};

export default function LookupPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">Your enquiry</p>
        <h1 className="font-display text-display-lg text-fg mt-2">Find your enquiry</h1>
        <p className="text-body text-fg-muted mt-3">
          Enter the reference we sent you and the email address you used. If you still have our
          email, the link in it takes you straight there.
        </p>
      </header>

      <div className="mt-8">
        <LookupForm />
      </div>

      <p className="text-body-sm text-fg-muted mt-8 max-w-md">
        Lost the reference? Message us on WhatsApp at {site.phoneDisplay} or email {site.email} and
        we&rsquo;ll find it.
      </p>
    </div>
  );
}
