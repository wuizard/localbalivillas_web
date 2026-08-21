import type { Metadata } from "next";
import { ButtonLink } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-label text-brand-600 uppercase dark:text-brand-300">Error 404</p>
      <h1 className="mt-3 font-display text-display-lg text-fg">We can&apos;t find that page</h1>
      <p className="mt-4 max-w-md text-body text-fg-muted">
        The link may be out of date, or the villa may no longer be listed. Everything we have is a
        search away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/properties" size="lg">
          Browse villas
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
