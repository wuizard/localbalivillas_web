"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Money } from "@/shared/currency";
import { activityCancellationPolicy } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import { quoteActivityBooking, submitActivityBooking, type ActivityQuoteResult } from "../api/booking";
import type { ActivityDetail } from "../types";

const COUNTRIES = [
  "Australia", "Canada", "China", "France", "Germany", "India", "Indonesia", "Italy",
  "Japan", "Malaysia", "Netherlands", "New Zealand", "Russia", "Singapore", "South Korea",
  "Spain", "Switzerland", "United Kingdom", "United States", "Other",
] as const;

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name").max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.email("Please enter a valid email address").max(160),
  // The API rejects anything shorter, because Xendit does. Catching it here means the
  // guest is told before an unpayable order is created for them.
  phoneNumber: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 9, "Please enter a full phone number"),
  country: z.string().trim().max(80).optional(),
  pickupArea: z.string().trim().max(200).optional(),
  specialRequest: z.string().trim().max(2000).optional(),
  acceptTerms: z.literal(true, { message: "Please accept the cancellation policy" }),
});

type CheckoutValues = z.input<typeof checkoutSchema>;

export function ActivityCheckoutForm({
  activity,
  date,
  adult,
  child,
  initialQuote,
}: {
  activity: ActivityDetail;
  date: string;
  adult: number;
  child: number;
  initialQuote: ActivityQuoteResult;
}) {
  const router = useRouter();

  const [quote, setQuote] = useState<ActivityQuoteResult>(initialQuote);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { phoneNumber: "+62", country: "Indonesia" },
  });

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code) return;

    setCouponPending(true);
    setCouponError(null);
    try {
      // Re-quoting is what validates the code: the server decides whether it applies
      // to activities at all, and returns the discount it is willing to honour.
      const next = await quoteActivityBooking({
        activityKey: activity.key,
        date,
        adult,
        child,
        couponCode: code,
      });
      setQuote(next);
      setAppliedCode(code.toUpperCase());
    } catch {
      setCouponError("That code can't be used on this booking.");
    } finally {
      setCouponPending(false);
    }
  }

  async function onSubmit(values: CheckoutValues) {
    setSubmitError(null);
    try {
      const guest = checkoutSchema.parse(values);
      const { acceptTerms, ...rest } = guest;
      void acceptTerms;

      const result = await submitActivityBooking({
        activityKey: activity.key,
        date,
        adult,
        child,
        couponCode: appliedCode ?? undefined,
        guest: rest,
      });

      // A hosted payment page is an external handoff; a simulation is an internal route.
      if (result.simulated) router.push(result.paymentLink);
      else window.location.assign(result.paymentLink);
    } catch (error) {
      const message =
        error instanceof Error && /fully booked|places left|not running|passed/i.test(error.message)
          ? error.message
          : "We couldn't start your booking. Nothing has been charged. Please try again, or message us on WhatsApp.";
      setSubmitError(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      // Same shape as the villa BookingForm: fields left, summary sticky on the right.
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8"
    >
      <div className="flex flex-col gap-5 lg:order-1">
        <fieldset className="border-border bg-surface rounded-md border p-5">
          <legend className="text-label text-fg-muted px-1 uppercase">Who&rsquo;s coming</legend>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName?.message}>
              <input {...register("firstName")} autoComplete="given-name" className={inputClass} />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <input {...register("lastName")} autoComplete="family-name" className={inputClass} />
            </Field>
            <Field
              label="Email"
              hint="Your confirmation and receipt go here"
              error={errors.email?.message}
            >
              <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
            </Field>
            <Field label="Phone / WhatsApp" error={errors.phoneNumber?.message}>
              <input {...register("phoneNumber")} type="tel" autoComplete="tel" className={inputClass} />
            </Field>
            <Field label="Country" error={errors.country?.message} className="sm:col-span-2 sm:max-w-64">
              <select {...register("country")} className={inputClass}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset className="border-border bg-surface rounded-md border p-5">
          <legend className="text-label text-fg-muted px-1 uppercase">Getting you there</legend>

          <div className="mt-3 grid gap-4">
            <Field
              label="Pick-up address"
              hint={activity.meetingPoint ? `Meeting point: ${activity.meetingPoint}` : undefined}
              error={errors.pickupArea?.message}
            >
              <input {...register("pickupArea")} className={inputClass} />
            </Field>
            <Field label="Anything we should know" error={errors.specialRequest?.message}>
              <textarea
                {...register("specialRequest")}
                rows={3}
                className={cn(inputClass, "h-auto py-2.5")}
              />
            </Field>
          </div>
        </fieldset>

        <div className="border-border bg-surface-muted rounded-md border p-5">
          <h2 className="text-label text-fg uppercase">Before you pay</h2>
          <p className="text-body-sm text-fg mt-2 font-medium">
            {activityCancellationPolicy.headline}
          </p>
          <p className="text-body-sm text-fg-muted mt-2">{activityCancellationPolicy.weather}</p>
          <p className="text-body-sm text-fg-muted mt-2">
            {activityCancellationPolicy.guestCancels}
          </p>

          <label className="text-body-sm text-fg mt-4 flex items-start gap-2.5">
            <input {...register("acceptTerms")} type="checkbox" className="accent-brand-500 mt-0.5 size-4" />
            I understand the cancellation policy above.
          </label>
          {errors.acceptTerms ? (
            <span role="alert" className="text-body-sm text-danger mt-1 block">
              {errors.acceptTerms.message}
            </span>
          ) : null}
        </div>

        {submitError ? (
          <p role="alert" className="text-body-sm text-danger flex items-start gap-2">
            <AlertCircle size={16} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden />
            {submitError}
          </p>
        ) : null}
      </div>

      {/* order-2 is load-bearing: without it the aside defaults to order 0 and sorts
          ahead of the order-1 fields, putting the summary on the left. */}
      <aside className="border-border bg-surface flex flex-col gap-4 rounded-md border p-5 lg:sticky lg:top-24 lg:order-2">
        <div>
          <h2 className="font-display text-title text-fg">{activity.name}</h2>
          <p className="text-body-sm text-fg-muted mt-1">
            {new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-GB", {
              weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
            })}
          </p>
          <p className="text-body-sm text-fg-muted">
            {adult} adult{adult === 1 ? "" : "s"}
            {child > 0 ? `, ${child} child${child === 1 ? "" : "ren"}` : ""}
          </p>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-4">
          <Line
            label={`${quote.chargedAdults} × adult`}
            value={<Money amount={quote.rates.adult * quote.chargedAdults} />}
          />
          {child > 0 ? (
            <Line label={`${child} × child`} value={<Money amount={quote.rates.child * child} />} />
          ) : null}
          {quote.discount > 0 ? (
            <Line
              label={appliedCode ? `Promo ${appliedCode}` : "Promo"}
              value={<span className="text-success">−<Money amount={quote.discount} /></span>}
            />
          ) : null}
        </div>

        {quote.minimumApplied ? (
          <p className="text-body-sm text-fg-muted">
            This activity has a minimum of {activity.pricing.minPax}, so that is what you&rsquo;re
            charged, and you don&rsquo;t need to bring more people.
          </p>
        ) : null}

        <div className="border-border flex items-baseline justify-between border-t pt-4">
          <span className="text-body text-fg font-medium">Total</span>
          <Money amount={quote.totalPrice} className="tabular text-price text-fg" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body-sm text-fg-muted flex items-center gap-1.5">
            <Tag size={14} strokeWidth={1.8} aria-hidden />
            Promo code
          </label>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(event) => { setCouponCode(event.target.value); setCouponError(null); }}
              className={cn(inputClass, "uppercase")}
              placeholder="Optional"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponPending || !couponCode.trim()}
              className="border-border text-label text-fg hover:bg-surface-muted h-11 shrink-0 rounded-sm border px-4 uppercase disabled:opacity-50"
            >
              {couponPending ? "…" : "Apply"}
            </button>
          </div>
          {couponError ? (
            <span role="alert" className="text-body-sm text-danger">{couponError}</span>
          ) : null}
          {appliedCode && !couponError ? (
            <span className="text-body-sm text-success">{appliedCode} applied</span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 text-label hover:bg-brand-600 flex h-12 items-center justify-center gap-2 rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase transition-colors disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Pay and book
        </button>

        <p className="text-body-sm text-fg-subtle text-center">
          You&rsquo;ll be taken to our payment provider. Your place is held once payment
          completes.
        </p>
      </aside>
    </form>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-body-sm flex items-baseline justify-between">
      <span className="text-fg-muted">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
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
      <span className="text-body-sm text-fg font-medium">{label}</span>
      {children}
      {hint && !error ? <span className="text-body-sm text-fg-muted">{hint}</span> : null}
      {error ? (
        <span role="alert" className="text-body-sm text-danger">{error}</span>
      ) : null}
    </label>
  );
}
