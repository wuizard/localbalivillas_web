"use client";

import { Ban, CalendarDays, Tag, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { applyCoupon } from "@/features/pricing";
import { cn } from "@/shared/lib/cn";
import { formatIDR, pluralise } from "@/shared/lib/format";
import { checkCoupon } from "../api/queries";
import type { AppliedCoupon, BookingDraft } from "../types";

type BookingSummaryProps = {
  draft: BookingDraft;
  coupon: AppliedCoupon | null;
  onCouponChange: (coupon: AppliedCoupon | null) => void;
};

export function BookingSummary({ draft, coupon, onCouponChange }: BookingSummaryProps) {
  const { discount, total } = applyCoupon({
    subtotal: draft.subtotal,
    nights: draft.nights,
    breakdown: draft.breakdown,
    rooms: draft.rooms,
    coupon,
  });

  return (
    <aside
      aria-labelledby="summary"
      className="rounded-md border border-border bg-surface shadow-sm"
    >
      <div className="flex gap-3 border-b border-border p-4">
        {draft.image ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-sm">
            <Image src={draft.image} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : null}

        <div className="min-w-0">
          <h2 id="summary" className="font-display text-title text-fg">
            <Link href={draft.propertyHref} className="hover:text-brand-600">
              {draft.propertyName}
            </Link>
          </h2>
          <p className="text-body-sm text-fg-muted">{draft.location}, Bali</p>
          <p className="mt-1 text-body-sm text-fg">{draft.roomName}</p>
        </div>
      </div>

      <dl className="flex flex-col gap-2.5 border-b border-border p-4 text-body-sm">
        <Row icon={CalendarDays} label="Dates">
          {draft.checkIn} → {draft.checkOut}
        </Row>
        <Row icon={CalendarDays} label="Length">
          {pluralise(draft.nights, "night")} · {pluralise(draft.rooms, "room")}
        </Row>
        <Row icon={Users} label="Guests">
          {pluralise(draft.adults, "adult")}
          {draft.children > 0 ? `, ${pluralise(draft.children, "child", "children")}` : ""}
        </Row>
      </dl>

      <div className="border-b border-border p-4">
        <PromoCode draft={draft} coupon={coupon} onCouponChange={onCouponChange} />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <details className="text-body-sm">
          <summary className="cursor-pointer text-fg-muted">
            {pluralise(draft.nights, "night")} × {pluralise(draft.rooms, "room")}
          </summary>
          <ul className="tabular mt-2 flex flex-col gap-1 text-fg-muted">
            {draft.breakdown.map((night) => (
              <li key={night.date} className="flex justify-between">
                <span>{night.date}</span>
                <span>{formatIDR(night.price)}</span>
              </li>
            ))}
          </ul>
        </details>

        <div className="flex justify-between text-body">
          <span className="text-fg-muted">Subtotal</span>
          <span className="tabular text-fg">{formatIDR(draft.subtotal)}</span>
        </div>

        {discount > 0 ? (
          <div className="flex justify-between text-body text-success">
            <span>Discount</span>
            <span className="tabular">−{formatIDR(discount)}</span>
          </div>
        ) : null}

        <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-body font-semibold text-fg">Total</span>
          <span className="tabular text-price text-fg">{formatIDR(total)}</span>
        </div>

        <p className="mt-1 flex items-start gap-2 text-body-sm text-fg-muted">
          <Ban size={14} strokeWidth={1.7} className="mt-0.5 shrink-0 text-danger" aria-hidden />
          This reservation cannot be cancelled or modified.
        </p>
      </div>
    </aside>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand-400" aria-hidden />
      <dt className="sr-only">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

function PromoCode({ draft, coupon, onCouponChange }: BookingSummaryProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a promo code");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const applied = await checkCoupon({
        code: trimmed,
        propertyId: draft.propertyId,
        dates: draft.breakdown.map((night) => night.date),
        total: draft.subtotal,
      });
      onCouponChange(applied);
      setCode("");
    } catch {
      setError("That code isn't valid for these dates.");
    } finally {
      setPending(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-sm bg-success/10 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2 text-body-sm">
          <Tag size={15} strokeWidth={1.7} className="shrink-0 text-success" aria-hidden />
          <span className="truncate font-semibold text-fg">{coupon.code}</span>
          <span className="truncate text-fg-muted">{coupon.label}</span>
        </span>
        <button
          type="button"
          onClick={() => onCouponChange(null)}
          aria-label={`Remove promo code ${coupon.code}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface-muted"
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="promo" className="text-label text-fg-muted uppercase">
        Promo code
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          placeholder="Enter code"
          aria-invalid={error !== null}
          aria-describedby={error ? "promo-error" : undefined}
          className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-surface px-3 text-body-sm text-fg placeholder:text-fg-subtle focus:border-brand-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={pending}
          className={cn(
            "h-10 shrink-0 rounded-sm border border-brand-500 px-4 text-label font-semibold",
            "tracking-[0.08em] text-brand-600 uppercase disabled:opacity-50",
            "dark:text-brand-300",
          )}
        >
          {pending ? "Checking" : "Apply"}
        </button>
      </div>
      {error ? (
        <p id="promo-error" role="alert" className="mt-2 text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
