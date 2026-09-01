function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value.replace(/\/$/, "");
}

/**
 * Read on access, not on import. A module that throws while being imported takes down every
 * file that transitively touches it — including unit tests for pure logic that never makes a
 * request. The failure is still loud, it just happens at the point of use.
 */
export const env = {
  get apiBaseUrl(): string {
    return required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL);
  },
  get siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  },

  /**
   * Is this deployment the real storefront?
   *
   * Anything else — a staging host, a preview deploy, a laptop — must not be indexed.
   * A crawlable copy of these pages competes with production for the same terms and
   * can outrank it, which is the opposite of why this rebuild exists. Keyed on the
   * site URL rather than NODE_ENV because staging and previews are production
   * *builds*; NODE_ENV would call every one of them production.
   */
  get isPublicSite(): boolean {
    return /^https:\/\/(www\.)?localbalivillas\.com$/.test(
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "",
    );
  },

  /**
   * Placeholder reviews and card ratings, for surfaces the API cannot fill yet. Opt-in, and
   * one switch for both so a deployment can never show invented ratings beside a review wall
   * that is empty — or the reverse.
   *
   * Never set on the public storefront: a made-up score or review on a booking page is a
   * consumer-protection problem, not a content gap.
   */
  get demoContent(): boolean {
    return process.env.DEMO_CONTENT === "1";
  },

  /**
   * Whether `POST /booking/submit` really fires. Off unless explicitly switched on.
   *
   * A staging API now exists at `lbv-staging-api.wuebuild.com`, so the funnel can finally
   * be exercised end to end without touching real money — but the default stays off, because
   * the flag is not what decides whether a booking is real. `NEXT_PUBLIC_API_BASE_URL` is.
   * Arm this against an environment still pointed at the production API and it creates a
   * real, non-refundable reservation. Turn it on only where you have checked both.
   *
   * Preview deployments are production *builds*, so keying it on `NODE_ENV` would arm every
   * one of them; it is set per-environment instead.
   *
   * `NEXT_PUBLIC_` because the funnel submits from the browser — a server-only variable
   * reads as `undefined` there, which would silently mean "go live".
   */
  get liveBooking(): boolean {
    return process.env.NEXT_PUBLIC_BOOKING_LIVE === "1";
  },
} as const;
