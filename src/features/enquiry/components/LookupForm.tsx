"use client";

import { AlertCircle, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { lookupByReference } from "../api/submit";
import type { EnquiryRecord } from "../types";
import { EnquiryStatusCard } from "./EnquiryStatusCard";

export function LookupForm({ initialRecord }: { initialRecord?: EnquiryRecord | null }) {
  const [record, setRecord] = useState<EnquiryRecord | null>(initialRecord ?? null);
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const found = await lookupByReference(reference.trim(), email.trim());
    setPending(false);

    if (found) {
      setRecord(found);
      return;
    }

    // One message for a wrong reference and a wrong email. Telling them apart would
    // turn this form into a way to test which addresses are in the system.
    setError("We couldn't find an enquiry with those details. Check both and try again.");
  }

  if (record) {
    return <EnquiryStatusCard record={record} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm text-fg font-medium">Reference</span>
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="EV-7K2M9Q"
          autoComplete="off"
          className={`${inputClass} tabular uppercase`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm text-fg font-medium">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="the address you used"
          className={inputClass}
        />
      </label>

      {error ? (
        <p role="alert" className="text-body-sm text-danger flex items-start gap-2">
          <AlertCircle size={16} strokeWidth={1.9} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-500 text-label hover:bg-brand-600 flex h-12 items-center justify-center gap-2 rounded-sm px-6 font-semibold tracking-[0.08em] text-white uppercase transition-colors disabled:opacity-70"
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <Search size={16} strokeWidth={1.9} aria-hidden />
        )}
        Find my enquiry
      </button>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-sm border border-border bg-surface px-3 text-body text-fg " +
  "placeholder:text-fg-subtle focus:border-brand-400 focus:outline-none";
