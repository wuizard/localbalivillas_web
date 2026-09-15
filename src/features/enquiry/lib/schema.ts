import { z } from "zod";
import { BUDGET_BANDS } from "../types";

const BUDGET_VALUES = BUDGET_BANDS.map((band) => band.value) as [string, ...string[]];

export const COUNTRIES = [
  "Australia", "Canada", "China", "France", "Germany", "India", "Indonesia", "Italy",
  "Japan", "Malaysia", "Netherlands", "New Zealand", "Russia", "Singapore", "South Korea",
  "Spain", "Switzerland", "United Kingdom", "United States", "Other",
] as const;

/**
 * Deliberately short. Every field here is one the team would otherwise ask for in
 * chat, and nothing else — a longer form is a lower completion rate, and the
 * conversation can fill in the rest.
 */
export const enquirySchema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name").max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.email("Please enter a valid email address").max(160),
  phoneNumber: z
    .string()
    .trim()
    .min(6, "Please enter a phone number we can reach you on")
    .max(40),
  country: z.string().trim().max(80).optional(),
  eventDate: z.string().trim().optional(),
  dateFlexible: z.boolean().optional(),
  guestCount: z.coerce
    .number()
    .int()
    .min(1, "At least one guest")
    .max(500, "For parties this size, message us directly")
    .optional(),
  budgetBand: z.enum(BUDGET_VALUES),
  occasionNote: z.string().trim().max(4000).optional(),
  /** Honeypot — hidden from people, irresistible to bots. Must stay empty. */
  website: z.string().max(0).optional(),
});

export type EnquiryFormValues = z.input<typeof enquirySchema>;
export type EnquiryFormOutput = z.output<typeof enquirySchema>;
