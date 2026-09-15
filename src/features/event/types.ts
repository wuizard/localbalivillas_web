export type EventPackageSummary = {
  id: string;
  key: string;
  name: string;
  summary: string;
  images: string[];
  /** IDR integers. `null` when nothing indicative has been published. */
  indicativeFrom: number | null;
  indicativeTo: number | null;
  suitableGuestsMin: number | null;
  suitableGuestsMax: number | null;
  href: string;
};

export type EventPackageDetail = EventPackageSummary & {
  description: string[];
  typicallyIncludes: string[];
};
