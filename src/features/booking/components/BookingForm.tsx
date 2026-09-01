"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { applyCoupon } from "@/features/pricing";
import { cn } from "@/shared/lib/cn";
import { formatIDR } from "@/shared/lib/format";
import { submitBooking } from "../api/queries";
import { ARRIVAL_TIMES, TITLES, guestSchema, type GuestFormValues } from "../lib/guest-schema";
import type { AppliedCoupon, BookingDraft } from "../types";
import { BookingSummary } from "./BookingSummary";

const COUNTRIES = [
  "Australia", "Canada", "China", "France", "Germany", "India", "Indonesia", "Italy",
  "Japan", "Malaysia", "Netherlands", "New Zealand", "Russia", "Singapore", "South Korea",
  "Spain", "Switzerland", "United Kingdom", "United States", "Other",
] as const;

export function BookingForm({ draft }: { draft: BookingDraft }) {
  const router = useRouter();
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: { title: "male", arrivalTime: "14:00", specialRequest: "", phoneNumber: "+62" },
  });

  const { discount, total } = applyCoupon({
    subtotal: draft.subtotal,
    nights: draft.nights,
    breakdown: draft.breakdown,
    rooms: draft.rooms,
    coupon,
  });

  async function onSubmit(values: GuestFormValues) {
    setSubmitError(null);
    try {
      const { acceptTerms, ...guest } = guestSchema.parse(values);
      void acceptTerms;

      const result = await submitBooking({
        draft,
        guest,
        coupon,
        subtotal: draft.subtotal,
        total,
      });

      // A hosted payment link is an external handoff; an internal simulation is a route.
      if (result.simulated) router.push(result.paymentLink);
      else window.location.assign(result.paymentLink);
    } catch {
      setSubmitError(
        "We couldn't complete your booking. Nothing has been charged. Please try again, or message us on WhatsApp.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8"
    >
      <div className="flex flex-col gap-5 lg:order-1">
        <fieldset className="rounded-md border border-border bg-surface p-5">
          <legend className="px-1 text-label text-fg-muted uppercase">Who&apos;s staying</legend>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title?.message} className="sm:col-span-2 sm:max-w-40">
              <select {...register("title")} className={inputClass}>
                {TITLES.map((title) => (
                  <option key={title.value} value={title.value}>
                    {title.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="First name" error={errors.firstName?.message}>
              <input {...register("firstName")} autoComplete="given-name" className={inputClass} />
            </Field>

            <Field label="Last name" error={errors.lastName?.message}>
              <input {...register("lastName")} autoComplete="family-name" className={inputClass} />
            </Field>

            <Field
              label="Email"
              hint="Your confirmation is emailed here"
              error={errors.email?.message}
            >
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className={inputClass}
              />
            </Field>

            <Field label="Phone" error={errors.phoneNumber?.message}>
              <input {...register("phoneNumber")} type="tel" autoComplete="tel" className={inputClass} />
            </Field>

            <Field label="Country" error={errors.country?.message}>
              <select {...register("country")} defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Choose your country
                </option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Arrival time" error={errors.arrivalTime?.message}>
              <select {...register("arrivalTime")} className={inputClass}>
                {ARRIVAL_TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Special requests"
              hint="Optional. We'll pass these to the villa"
              error={errors.specialRequest?.message}
              className="sm:col-span-2"
            >
              <textarea {...register("specialRequest")} rows={3} className={inputClass} />
            </Field>
          </div>
        </fieldset>

        <div className="rounded-md border border-border bg-surface p-5">
          <label className="flex items-start gap-3">
            <input
              {...register("acceptTerms")}
              type="checkbox"
              aria-invalid={errors.acceptTerms !== undefined}
              className="mt-0.5 size-4 shrink-0 accent-brand-500"
            />
            <span className="text-body-sm text-fg">
              I understand this reservation is <strong>non-refundable</strong> and cannot be
              modified, and I accept the terms and privacy policy.
            </span>
          </label>
          {errors.acceptTerms?.message ? (
            <p role="alert" className="mt-2 text-body-sm text-danger">
              {errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        {submitError ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-4 text-body-sm text-fg"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden />
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !draft.available}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-sm bg-brand-500 text-label",
            "font-semibold tracking-[0.08em] text-white uppercase shadow-sm",
            "transition-[background-color,transform] duration-[120ms] ease-out",
            "hover:bg-brand-600 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Confirming
            </>
          ) : (
            <>Pay {formatIDR(total)}</>
          )}
        </button>

        {discount > 0 ? (
          <p className="text-center text-body-sm text-success">
            {formatIDR(discount)} discount applied
          </p>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-24 lg:order-2">
        <BookingSummary draft={draft} coupon={coupon} onCouponChange={setCoupon} />
      </div>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-sm border border-border bg-surface px-3 text-body text-fg " +
  "placeholder:text-fg-subtle focus:border-brand-400 focus:outline-none " +
  "aria-[invalid=true]:border-danger";

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-body-sm font-medium text-fg">{label}</span>
      {children}
      {hint && !error ? <span className="text-body-sm text-fg-muted">{hint}</span> : null}
      {error ? (
        <span role="alert" className="text-body-sm text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
