import type { Coupon, IsoDate, NightRate } from "@/features/pricing";

export type GuestDetails = {
  title: "male" | "female";
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  arrivalTime: string;
  specialRequest: string;
};

/** Everything the summary needs, resolved on the server before the form is shown. */
export type BookingDraft = {
  propertyId: string;
  propertyKey: string;
  propertyName: string;
  propertyHref: string;
  location: string;
  image: string | null;
  roomId: string;
  roomName: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  breakdown: NightRate[];
  subtotal: number;
  available: boolean;
};

export type BookingResult = {
  paymentLink: string;
  /** True when the submit was simulated rather than sent — see `submitBooking`. */
  simulated: boolean;
};

export type AppliedCoupon = Coupon & { label: string };
