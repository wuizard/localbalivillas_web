import { z } from "zod";

/**
 * Replaces the legacy `joiForm` booleans. Every message is what the guest reads, so they are
 * written as instructions rather than as validation jargon.
 */
export const guestSchema = z.object({
  title: z.enum(["male", "female"]),
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name")
    .max(60, "That's longer than we can store"),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name")
    .max(60, "That's longer than we can store"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email — your confirmation goes here")
    .email("That doesn't look like an email address"),
  phoneNumber: z
    .string()
    .trim()
    .min(6, "Enter a phone number we can reach you on")
    .regex(/^\+?[\d\s-]+$/, "Use digits, spaces and an optional +"),
  country: z.string().trim().min(1, "Choose your country"),
  arrivalTime: z.string().min(1, "Choose roughly when you'll arrive"),
  specialRequest: z.string().trim().max(500, "Keep requests under 500 characters").default(""),
  acceptTerms: z.literal(true, {
    message: "You need to accept the terms before booking",
  }),
});

export type GuestFormValues = z.input<typeof guestSchema>;
export type GuestFormOutput = z.output<typeof guestSchema>;

export const ARRIVAL_TIMES = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "After 22:00",
] as const;

export const TITLES = [
  { value: "male", label: "Mr" },
  { value: "female", label: "Mrs/Ms" },
] as const;
