"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@/shared/lib/cn";
import { submitEnquiry } from "../api/submit";
import { COUNTRIES, enquirySchema, type EnquiryFormValues } from "../lib/schema";
import { BUDGET_BANDS, type EnquiryKind, type EnquiryReceipt, type EnquirySource } from "../types";
import { EnquirySuccess } from "./EnquirySuccess";

type EnquiryFormProps = {
  kind: EnquiryKind;
  source: EnquirySource;
  /** The occasion or activity being asked about, when the form sits on its page. */
  subjectRef?: string;
  subjectName?: string;
  /** Prefilled when the form is dropped on a villa page or a booking confirmation. */
  propertyRef?: string;
  propertyName?: string;
  bookingId?: string;
  heading?: string;
  intro?: string;
  /** Prefilled when the page already knows what the guest picked. */
  defaultDate?: string;
  defaultGuestCount?: number;
  defaultNote?: string;
};

export function EnquiryForm({
  kind,
  source,
  subjectRef,
  subjectName,
  propertyRef,
  propertyName,
  bookingId,
  heading = "Tell us what you have in mind",
  intro,
  defaultDate,
  defaultGuestCount,
  defaultNote,
}: EnquiryFormProps) {
  const [receipt, setReceipt] = useState<EnquiryReceipt | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      budgetBand: "not_sure",
      phoneNumber: "+62",
      country: "Indonesia",
      website: "",
      eventDate: defaultDate ?? "",
      guestCount: defaultGuestCount,
      occasionNote: defaultNote ?? "",
    },
  });

  async function onSubmit(values: EnquiryFormValues) {
    setSubmitError(null);
    try {
      const parsed = enquirySchema.parse(values);
      const result = await submitEnquiry({
        ...parsed,
        guestCount: parsed.guestCount ?? undefined,
        eventDate: parsed.eventDate || undefined,
        kind,
        source,
        subjectRef,
        subjectName,
        propertyRef,
        propertyName,
        bookingId,
      });
      setReceipt(result);
    } catch {
      setSubmitError(
        "We couldn't send that. Nothing was lost. Please try again, or message us on WhatsApp.",
      );
    }
  }

  if (receipt) {
    return <EnquirySuccess receipt={receipt} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-display-sm text-fg">{heading}</h2>
        {intro ? <p className="text-body text-fg-muted mt-2 max-w-prose">{intro}</p> : null}
      </div>

      <fieldset className="border-border bg-surface rounded-md border p-5">
        <legend className="text-label text-fg-muted px-1 uppercase">
          {kind === "activity" ? "When and how many" : "What you\u2019re planning"}
        </legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Date" hint="Roughly is fine" error={errors.eventDate?.message}>
            <input {...register("eventDate")} type="date" className={inputClass} />
          </Field>

          <Field
            label={kind === "activity" ? "How many joining" : "How many people"}
            error={errors.guestCount?.message}
          >
            <input
              {...register("guestCount")}
              type="number"
              min={1}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>

          <label className="text-body-sm text-fg flex items-center gap-2.5 sm:col-span-2">
            <input
              {...register("dateFlexible")}
              type="checkbox"
              className="accent-brand-500 size-4"
            />
            My dates are flexible
          </label>

          {/* Budget is an events question. An activity already has a published rate,
              so asking what the guest can spend is both odd and useless — the band
              stays at its "not sure" default and the field never renders. */}
          {kind === "event" ? (
            <Field
              label="Budget"
              hint="A range is enough. It helps us come back with something realistic"
              error={errors.budgetBand?.message}
              className="sm:col-span-2"
            >
              <select {...register("budgetBand")} className={inputClass}>
                {BUDGET_BANDS.map((band) => (
                  <option key={band.value} value={band.value}>
                    {band.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field
            label="Anything else"
            hint={
              kind === "activity"
                ? "Pick-up address, ages of anyone under 12, anything we should know"
                : "What the occasion is, who it's for, anything you already have in mind"
            }
            error={errors.occasionNote?.message}
            className="sm:col-span-2"
          >
            <textarea
              {...register("occasionNote")}
              rows={4}
              className={cn(inputClass, "h-auto py-2.5")}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="border-border bg-surface rounded-md border p-5">
        <legend className="text-label text-fg-muted px-1 uppercase">How we reach you</legend>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName?.message}>
            <input {...register("firstName")} autoComplete="given-name" className={inputClass} />
          </Field>

          <Field label="Last name" error={errors.lastName?.message}>
            <input {...register("lastName")} autoComplete="family-name" className={inputClass} />
          </Field>

          <Field label="Email" hint="Your reference is emailed here" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          <Field label="Phone / WhatsApp" error={errors.phoneNumber?.message}>
            <input
              {...register("phoneNumber")}
              type="tel"
              autoComplete="tel"
              className={inputClass}
            />
          </Field>

          <Field
            label="Country"
            error={errors.country?.message}
            className="sm:col-span-2 sm:max-w-64"
          >
            <select {...register("country")} className={inputClass}>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      {/* Hidden from people and from screen readers; bots fill it and get a silent 200. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {submitError ? (
        <p role="alert" className="text-body-sm text-danger flex items-start gap-2">
          <AlertCircle size={16} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden />
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 text-label hover:bg-brand-600 flex h-12 items-center gap-2 rounded-sm px-7 font-semibold tracking-[0.08em] text-white uppercase transition-colors disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
          Send enquiry
        </button>

        <p className="text-body-sm text-fg-muted">
          This is an enquiry, not a booking. Nothing is reserved and nothing is charged.
        </p>
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
      <span className="text-body-sm text-fg font-medium">{label}</span>
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
