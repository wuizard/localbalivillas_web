import { z } from "zod";
import { ENQUIRY_KINDS, type EnquiryKind, type EnquiryRecord, type EnquiryStatus } from "../types";

export const receiptSchema = z.object({
  reference: z.string().nullable(),
  handoffMessage: z.string().nullish(),
  handoffUrl: z.string().nullish(),
});

const recordSchema = z.object({
  reference: z.string(),
  subject: z
    .object({
      kind: z.string().nullish(),
      name: z.string().nullish(),
    })
    .nullish(),
  eventDate: z.string().nullish(),
  dateFlexible: z.boolean().nullish(),
  guestCount: z.number().nullish(),
  propertyName: z.string().nullish(),
  budgetBand: z.string().nullish(),
  occasionNote: z.string().nullish(),
  lastStatus: z.string().nullish(),
  quote: z
    .object({
      amount: z.number().nullish(),
    })
    .nullish(),
  createdDate: z.string().nullish(),
});

export const enquiryRecordSchema = recordSchema;

const STATUSES: EnquiryStatus[] = ["new", "in_conversation", "quoted", "won", "lost", "closed"];

export function toEnquiryRecord(raw: z.infer<typeof recordSchema>): EnquiryRecord {
  const kind = (ENQUIRY_KINDS as readonly string[]).includes(raw.subject?.kind ?? "")
    ? (raw.subject?.kind as EnquiryKind)
    : "event";

  return {
    reference: raw.reference,
    subjectName: raw.subject?.name?.trim() || null,
    kind,
    eventDate: raw.eventDate ?? null,
    dateFlexible: raw.dateFlexible ?? false,
    guestCount: raw.guestCount ?? null,
    propertyName: raw.propertyName?.trim() || null,
    budgetBand: raw.budgetBand ?? null,
    occasionNote: raw.occasionNote?.trim() || null,
    status: STATUSES.includes(raw.lastStatus as EnquiryStatus)
      ? (raw.lastStatus as EnquiryStatus)
      : "new",
    quoteAmount: typeof raw.quote?.amount === "number" ? raw.quote.amount : null,
    createdDate: raw.createdDate ?? null,
  };
}
