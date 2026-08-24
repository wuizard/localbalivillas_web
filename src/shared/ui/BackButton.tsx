"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";

type BackButtonProps = {
  /** Where to go when there is no history to go back to. Also the crawlable href. */
  href: string;
  label: string;
  /** Chrome variant: a 40px round target with the label read out rather than shown. */
  iconOnly?: boolean;
  className?: string;
};

/**
 * A real link that prefers `history.back()`.
 *
 * Rendering it as a link rather than a button keeps it crawlable and working before
 * hydration, but going *back* is what a guest means — returning to the results they had
 * scrolled and filtered, not a fresh load of the same URL. Someone who arrived from a shared
 * link or a search result has no history to return to, and gets the href.
 */
export function BackButton({ href, label, iconOnly = false, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Link
      href={href}
      aria-label={iconOnly ? label : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        if (window.history.length <= 1) return;
        event.preventDefault();
        router.back();
      }}
      className={cn(
        "inline-flex items-center transition-colors duration-[120ms]",
        "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
        iconOnly
          ? "text-fg hover:bg-surface-muted hover:text-brand-600 size-10 justify-center rounded-full"
          : "text-body-sm text-fg-muted hover:text-brand-600 -ml-1 gap-1.5 rounded-sm py-1 pr-2 pl-1",
        className,
      )}
    >
      <ArrowLeft size={iconOnly ? 22 : 16} strokeWidth={1.8} aria-hidden className="shrink-0" />
      {iconOnly ? null : label}
    </Link>
  );
}
