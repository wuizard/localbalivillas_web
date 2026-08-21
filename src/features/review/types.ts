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
