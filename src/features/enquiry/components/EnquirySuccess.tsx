"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { site } from "@/shared/config/site";
import { markHandoff } from "../api/submit";
import type { EnquiryReceipt } from "../types";

/**
 * The reference is the point of this screen. It is what the guest quotes in WhatsApp,
 * what the team searches on, and the only thing they need to keep — so it is the
 * largest thing here and it is copyable in one tap.
 */
export function EnquirySuccess({ receipt }: { receipt: EnquiryReceipt }) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(receipt.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the reference is on screen either way.
    }
  }

  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-md border p-6 md:p-8">
      <div className="flex items-start gap-3">
        <span className="bg-success/15 text-success flex size-11 shrink-0 items-center justify-center rounded-full">
          <Check size={22} strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-display-sm text-fg">We have your enquiry</h2>
          <p className="text-body text-fg-muted mt-1.5 max-w-prose">
            Our team will come back to you with what&rsquo;s possible and what it costs. Keep this
            reference. Quote it in any message and we&rsquo;ll find you straight away.
          </p>
        </div>
      </div>

      <div className="border-border bg-surface-muted flex flex-wrap items-center gap-4 rounded-md border p-4">
        <div>
          <p className="text-label text-fg-muted uppercase">Your reference</p>
          <p className="tabular font-display text-display-sm text-fg mt-1 tracking-wide">
            {receipt.reference}
          </p>
        </div>
        <button
          type="button"
          onClick={copyReference}
          className="border-border text-body-sm text-fg hover:bg-surface ml-auto flex h-10 items-center gap-2 rounded-sm border px-4 transition-colors"
        >
          {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={receipt.handoffUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => markHandoff(receipt.reference, "whatsapp")}
          className="bg-whatsapp text-label flex h-12 items-center justify-center gap-2 rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase shadow-sm transition-transform duration-[120ms] active:scale-[0.98]"
        >
          <MessageCircle size={16} strokeWidth={1.9} aria-hidden />
          Continue on WhatsApp
        </a>

        {/* The quiet alternative. Plenty of guests do not use WhatsApp, and the email
            has already gone out either way — this only sets expectations. */}
        <p className="text-body-sm text-fg-muted text-center">
          Prefer email? We&rsquo;ve already sent your reference to your inbox and we&rsquo;ll reply
          there. You can also write to{" "}
          <a href={`mailto:${site.email}`} className="text-brand-600 dark:text-brand-300 underline">
            {site.email}
          </a>
          .
        </p>
      </div>

      <p className="text-body-sm text-fg-subtle border-border border-t pt-4">
        Nothing is reserved yet. No dates are held and no payment is due until we&rsquo;ve agreed the
        details with you.
      </p>
    </div>
  );
}
