/** Where an admin-issued review link stands when the guest opens it. */
export type ReviewInviteStatus = "open" | "submitted" | "expired" | "revoked";

export type ReviewInvite = {
  propertyName: string;
  /** Absolute S3 URL, snapshotted when the link was issued. */
  propertyImage: string | null;
  guestName: string;
  /** Inclusive of the checkout day, as everywhere else in the API. */
  dates: string[];
  bookingId: string;
  status: ReviewInviteStatus;
  submitted: { rating: number; body: string; date: string | null } | null;
};

export type GuestReview = {
  id: string;
  author: string;
  country: string | null;
  /** ISO 3166-1 alpha-2, used for the flag glyph. */
  countryCode: string | null;
  rating: number;
  body: string;
  date: string | null;
  propertyName: string | null;
  propertyHref: string | null;
};
