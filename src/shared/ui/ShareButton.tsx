"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { FacebookIcon, WhatsAppIcon } from "./BrandIcons";

type ShareButtonProps = {
  /** Absolute URL. Relative paths are resolved against the current origin on click. */
  url: string;
  title: string;
  className?: string;
};

const COPIED_RESET_MS = 2000;

/**
 * The legacy share card — copy field, Facebook, WhatsApp — rebuilt without `react-share`.
 * Both share endpoints are a URL with a query string, so a 13KB dependency bought nothing.
 *
 * On a phone the native share sheet is offered first when the browser has one: it reaches
 * every app the guest actually uses, which a two-icon popover never will.
 */
export function ShareButton({ url, title, className }: ShareButtonProps) {
  const { isOpen, setOpen, containerRef, triggerRef } = useDismissable<HTMLDivElement>();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Legacy left a 2s interval running for the life of the page; this clears with the component.
  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  function absolute(): string {
    if (typeof window === "undefined") return url;
    return new URL(url, window.location.origin).toString();
  }

  async function onShare() {
    const shareUrl = absolute();

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // Cancelled, or the sheet refused — fall through to the popover.
      }
    }
    setOpen(!isOpen);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(absolute());
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard blocked: the field is selectable, so the guest can still copy by hand.
    }
  }

  const shareUrl = typeof window === "undefined" ? url : absolute();
  const encoded = encodeURIComponent(shareUrl);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => void onShare()}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-full px-3 py-2 text-body-sm font-medium text-fg transition-colors duration-[120ms] hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <Share2 size={17} strokeWidth={1.8} aria-hidden />
        Share
      </button>

      {isOpen ? (
        <div
          ref={containerRef}
          role="dialog"
          aria-label={`Share ${title}`}
          className="absolute top-[calc(100%+8px)] right-0 z-40 w-[min(20rem,calc(100vw-2rem))] rounded-md border border-border bg-surface p-3 shadow-lg"
        >
          <button
            type="button"
            onClick={() => void copy()}
            className="flex w-full items-center gap-2.5 rounded-sm bg-surface-muted px-3 py-2.5 text-left transition-colors duration-[120ms] hover:bg-border/50"
          >
            {copied ? (
              <Check size={16} strokeWidth={2} className="shrink-0 text-success" aria-hidden />
            ) : (
              <Copy size={16} strokeWidth={1.8} className="shrink-0 text-fg-muted" aria-hidden />
            )}
            <span className="truncate text-body-sm text-fg-muted">{shareUrl}</span>
          </button>

          <p aria-live="polite" className="sr-only">
            {copied ? "Link copied to clipboard" : ""}
          </p>

          <ul className="mt-3 flex items-center gap-2">
            <li>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="flex size-10 items-center justify-center rounded-full bg-[#1877f2] text-white transition-transform duration-[120ms] hover:scale-105"
              >
                <FacebookIcon size={20} />
              </a>
            </li>
            <li>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="flex size-10 items-center justify-center rounded-full bg-whatsapp text-white transition-transform duration-[120ms] hover:scale-105"
              >
                <WhatsAppIcon size={20} />
              </a>
            </li>
            {copied ? (
              <li className="ml-auto text-body-sm font-medium text-success">Copied</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
