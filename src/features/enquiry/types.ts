export const ENQUIRY_KINDS = ["event", "activity", "custom"] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

/**
 * Bands, not a free number. "Flexible" and "as cheap as possible" route nowhere, and a
 * band is answerable by someone who genuinely does not know yet — which is why
 * "Not sure yet" stays on the list. Removing it does not create knowledge.
 */
export const BUDGET_BANDS = [
  { value: "under_25m", label: "Under IDR 25,000,000" },
  { value: "25m_50m", label: "IDR 25 – 50,000,000" },
  { value: "50m_100m", label: "IDR 50 – 100,000,000" },
  { value: "over_100m", label: "Over IDR 100,000,000" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export type BudgetBand = (typeof BUDGET_BANDS)[number]["value"];

export const BUDGET_LABEL: Record<string, string> = Object.fromEntries(
  BUDGET_BANDS.map((band) => [band.value, band.label]),
);

/** Which entry point produced the enquiry. Stored so we learn which ones are worth having. */
export type EnquirySource =
  | "events_page"
  | "event_package"
  | "villa_page"
  | "confirmation"
  | "nav"
  | "direct";

export type EnquiryReceipt = {
  reference: string;
  handoffMessage: string;
  handoffUrl: string;
};

export type EnquiryStatus =
  | "new"
  | "in_conversation"
  | "quoted"
  | "won"
  | "lost"
  | "closed";

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "Received",
  in_conversation: "We're talking it through",
  quoted: "Quote sent",
  won: "Confirmed",
  lost: "Closed",
  closed: "Closed",
};

export type EnquiryRecord = {
  reference: string;
  subjectName: string | null;
  kind: EnquiryKind;
  eventDate: string | null;
  dateFlexible: boolean;
  guestCount: number | null;
  propertyName: string | null;
  budgetBand: string | null;
  occasionNote: string | null;
  status: EnquiryStatus;
  quoteAmount: number | null;
  createdDate: string | null;
};
