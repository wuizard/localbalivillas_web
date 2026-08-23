"use client";

import { Ban, CalendarDays, Tag, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { applyCoupon } from "@/features/pricing";
import { BASE_CURRENCY, formatMoney, useCurrency } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";
import { pluralise } from "@/shared/lib/format";
import { checkCoupon } from "../api/queries";
import type { AppliedCoupon, BookingDraft } from "../types";

type BookingSummaryProps = {
  draft: BookingDraft;
  coupon: AppliedCoupon | null;
  onCouponChange: (coupon: AppliedCoupon | null) => void;
};

export function BookingSummary({ draft, coupon, onCouponChange }: BookingSummaryProps) {
  const { rate, currency } = useCurrency();
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
      className="border-border bg-surface rounded-md border shadow-sm"
    >
      <div className="border-border flex gap-3 border-b p-4">
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
          <p className="text-body-sm text-fg mt-1">{draft.roomName}</p>
        </div>
      </div>

      <dl className="border-border text-body-sm flex flex-col gap-2.5 border-b p-4">
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

      <div className="border-border border-b p-4">
        <PromoCode draft={draft} coupon={coupon} onCouponChange={onCouponChange} />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <details className="text-body-sm">
          <summary className="text-fg-muted cursor-pointer">
            {pluralise(draft.nights, "night")} × {pluralise(draft.rooms, "room")}
          </summary>
          <ul className="tabular text-fg-muted mt-2 flex flex-col gap-1">
            {draft.breakdown.map((night) => (
              <li key={night.date} className="flex justify-between">
                <span>{night.date}</span>
                <span>{formatMoney(night.price, BASE_CURRENCY)}</span>
              </li>
            ))}
          </ul>
        </details>

        <div className="text-body flex justify-between">
          <span className="text-fg-muted">Subtotal</span>
          <span className="tabular text-fg">{formatMoney(draft.subtotal, BASE_CURRENCY)}</span>
        </div>

        {discount > 0 ? (
          <div className="text-body text-success flex justify-between">
            <span>Discount</span>
            <span className="tabular">−{formatMoney(discount, BASE_CURRENCY)}</span>
          </div>
        ) : null}

        <div className="border-border mt-1 flex items-baseline justify-between border-t pt-3">
          <span className="text-body text-fg font-semibold">Total</span>
          <span className="tabular text-price text-fg">{formatMoney(total, BASE_CURRENCY)}</span>
        </div>

        {/* Everything above is the amount the payment link will actually ask for, so this
            column is rupiah whatever the guest is browsing the site in — a checkout that
            adds up dollars and settles in rupiah is where confusion becomes a chargeback.
            The conversion appears once, below the line, clearly secondary. */}
        {rate === null ? null : (
          <p className="text-body-sm text-fg-muted text-right">
            {formatMoney(total * rate, currency)} · indicative only, charged in {BASE_CURRENCY}
          </p>
        )}

        <p className="text-body-sm text-fg-muted mt-1 flex items-start gap-2">
          <Ban size={14} strokeWidth={1.7} className="text-danger mt-0.5 shrink-0" aria-hidden />
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
      <Icon size={15} strokeWidth={1.6} className="text-brand-400 mt-0.5 shrink-0" aria-hidden />
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
      <div className="bg-success/10 flex items-center justify-between gap-3 rounded-sm px-3 py-2.5">
        <span className="text-body-sm flex min-w-0 items-center gap-2">
          <Tag size={15} strokeWidth={1.7} className="text-success shrink-0" aria-hidden />
          <span className="text-fg truncate font-semibold">{coupon.code}</span>
          <span className="text-fg-muted truncate">{coupon.label}</span>
        </span>
        <button
          type="button"
          onClick={() => onCouponChange(null)}
          aria-label={`Remove promo code ${coupon.code}`}
          className="text-fg-muted hover:bg-surface-muted flex size-7 shrink-0 items-center justify-center rounded-full"
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
          className="border-border bg-surface text-body-sm text-fg placeholder:text-fg-subtle focus:border-brand-400 h-10 min-w-0 flex-1 rounded-sm border px-3 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={pending}
          className={cn(
            "border-brand-500 text-label h-10 shrink-0 rounded-sm border px-4 font-semibold",
            "text-brand-600 tracking-[0.08em] uppercase disabled:opacity-50",
            "dark:text-brand-300",
          )}
        >
          {pending ? "Checking" : "Apply"}
        </button>
      </div>
      {error ? (
        <p id="promo-error" role="alert" className="text-body-sm text-danger mt-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
