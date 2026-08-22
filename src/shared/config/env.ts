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
} as const;
