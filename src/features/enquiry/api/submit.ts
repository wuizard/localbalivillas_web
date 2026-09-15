import { z } from "zod";
import { apiGet, apiPost } from "@/shared/api";
import type { EnquiryKind, EnquiryReceipt, EnquiryRecord, EnquirySource } from "../types";
import { enquiryRecordSchema, receiptSchema, toEnquiryRecord } from "./schemas";

export type EnquiryPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  country?: string;
  kind: EnquiryKind;
  subjectRef?: string;
  subjectName?: string;
  eventDate?: string;
  dateFlexible?: boolean;
  guestCount?: number;
  propertyRef?: string;
  propertyName?: string;
  bookingId?: string;
  budgetBand: string;
  occasionNote?: string;
  source: EnquirySource;
  /** Honeypot. A real submission always leaves this empty. */
  website?: string;
};

/**
 * `POST /enquiry`. Never cached and never retried automatically: a replayed enquiry is
 * a second reference for one party, and whoever answers it has to work out which is
 * which. TanStack's default retry is switched off at the call site.
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryReceipt> {
  const raw = await apiPost("/enquiry", payload, receiptSchema);

  // The honeypot path answers 200 with a null reference so a bot cannot tell it was
  // caught. A real submission always comes back with one.
  if (!raw.reference || !raw.handoffUrl) {
    throw new Error("Enquiry was not accepted");
  }

  return {
    reference: raw.reference,
    handoffMessage: raw.handoffMessage ?? "",
    handoffUrl: raw.handoffUrl,
  };
}

/** Best effort. The redirect to WhatsApp must never wait on this, or fail because of it. */
export function markHandoff(reference: string, channel: "whatsapp" | "email"): void {
  void apiPost("/enquiry/handoff", { reference, channel }, z.unknown()).catch(() => {});
}

export async function lookupByToken(token: string): Promise<EnquiryRecord | null> {
  try {
    const raw = await apiGet(`/lookup/${encodeURIComponent(token)}`, enquiryRecordSchema);
    return toEnquiryRecord(raw);
  } catch {
    return null;
  }
}

export async function lookupByReference(
  reference: string,
  email: string,
): Promise<EnquiryRecord | null> {
  try {
    const raw = await apiPost("/lookup", { reference, email }, enquiryRecordSchema);
    return toEnquiryRecord(raw);
  } catch {
    // The API answers identically for an unknown reference and a wrong email so the
    // form cannot be used to test which addresses exist. Keep that indistinguishable
    // here too — one null, one message.
    return null;
  }
}
