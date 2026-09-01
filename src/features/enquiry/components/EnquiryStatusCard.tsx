import { MessageCircle } from "lucide-react";
import { Money } from "@/shared/currency";
import { whatsappHref } from "@/shared/config/site";
import { BUDGET_LABEL, ENQUIRY_STATUS_LABEL, type EnquiryRecord } from "../types";

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * What the guest is allowed to see. Supplier contacts, internal notes and the source
 * attribution never come down this endpoint, so there is nothing here to filter out —
 * the API decides, and this renders what it sent.
 */
export function EnquiryStatusCard({ record }: { record: EnquiryRecord }) {
  const date = formatDate(record.eventDate);

  const rows = [
    record.subjectName ? { label: "About", value: record.subjectName } : null,
    date ? { label: "Date", value: date + (record.dateFlexible ? " (flexible)" : "") } : null,
    record.guestCount ? { label: "Guests", value: String(record.guestCount) } : null,
    record.propertyName ? { label: "Villa", value: record.propertyName } : null,
    record.budgetBand ? { label: "Budget", value: BUDGET_LABEL[record.budgetBand] ?? "-" } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <div className="border-border bg-surface flex max-w-xl flex-col gap-5 rounded-md border p-6">
      <div>
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">
          {ENQUIRY_STATUS_LABEL[record.status]}
        </p>
        <p className="tabular font-display text-display-sm text-fg mt-1 tracking-wide">
          {record.reference}
        </p>
      </div>

      <dl className="divide-border divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-body-sm text-fg-muted">{row.label}</dt>
            <dd className="text-body-sm text-fg text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      {record.quoteAmount ? (
        <div className="border-border bg-surface-muted rounded-md border p-4">
          <p className="text-label text-fg-muted uppercase">Quoted</p>
          <Money amount={record.quoteAmount} className="tabular text-price text-fg mt-1 block" />
        </div>
      ) : (
        <p className="text-body-sm text-fg-muted">
          We haven&rsquo;t sent a quote yet. Once we have, it will show here.
        </p>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="border-brand-500 text-label text-brand-600 dark:text-brand-300 flex h-11 items-center justify-center gap-2 rounded-sm border px-5 font-semibold tracking-[0.08em] uppercase"
      >
        <MessageCircle size={15} strokeWidth={1.8} aria-hidden />
        Message the team
      </a>

      <p className="text-body-sm text-fg-subtle border-border border-t pt-4">
        Nothing is reserved and no payment is due until we&rsquo;ve agreed the details with you.
      </p>
    </div>
  );
}
