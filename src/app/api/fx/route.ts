import { fetchFxRates } from "@/shared/currency/rates";

/**
 * Rates are proxied rather than fetched from the browser so the provider is called once per
 * 12h per deployment instead of once per visitor, and so swapping in a keyed feed (XE) never
 * puts a credential in the client bundle.
 */
export const revalidate = 43_200;

export async function GET() {
  const rates = await fetchFxRates();

  return Response.json(rates, {
    headers: {
      "Cache-Control": "public, max-age=1800, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
