"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/shared/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-label text-brand-600 uppercase dark:text-brand-300">Something broke</p>
      <h1 className="mt-3 font-display text-display-lg text-fg">This page didn&apos;t load</h1>
      <p className="mt-4 max-w-md text-body text-fg-muted">
        It&apos;s us, not you. Try again, and if it keeps happening, message us on WhatsApp and
        we&apos;ll sort your booking out directly.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
