export type Destination = {
  id: string;
  name: string;
};

export type SearchCriteria = {
  destination: string | null;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
};

export const DEFAULT_CRITERIA: SearchCriteria = {
  destination: null,
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
};
