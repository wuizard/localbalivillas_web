import { BASE_CURRENCY, CURRENCIES, type CurrencyCode } from "./currencies";

export type FxRates = {
  base: typeof BASE_CURRENCY;
  /** Publication date of the underlying reference rates, ISO. */
  date: string;
  /** Multipliers from 1 IDR to the keyed currency. */
  rates: Record<string, number>;
  source: "live" | "fallback";
};

/**
 * ECB reference rates via Frankfurter, snapshotted 21 Aug 2026. They exist so a currency the
 * guest picked still renders when the provider is unreachable — never as the primary source.
 * Refresh them whenever the provider is swapped.
 */
const FALLBACK: Record<string, number> = {
  USD: 0.000056628,
  EUR: 0.0000484042,
  GBP: 0.0000414678,
  AUD: 0.0000790004,
  SGD: 0.0000718221,
  MYR: 0.00022869,
  JPY: 0.00898672,
  CNY: 0.000380573,
  KRW: 0.0783862,
  THB: 0.0018503,
  HKD: 0.000443992,
  NZD: 0.0000945866,
  INR: 0.00541931,
  CAD: 0.0000778049,
  CHF: 0.0000452724,
};

export const FALLBACK_RATES: FxRates = {
  base: BASE_CURRENCY,
  date: "2026-08-21",
  rates: FALLBACK,
  source: "fallback",
};

const TARGETS = CURRENCIES.map((currency) => currency.code).filter(
  (code): code is Exclude<CurrencyCode, typeof BASE_CURRENCY> => code !== BASE_CURRENCY,
);

/**
 * One adapter, one provider. Frankfurter is keyless ECB data, which is why it is the default;
 * XE (or any other paid feed) drops in by replacing this function alone, as long as it keeps
 * returning IDR-based multipliers.
 *
 * Rates are requested against EUR rather than IDR on purpose: an IDR-based response rounds
 * 1 IDR → USD to two significant figures, which is a ~2% error on a 40 million rupiah stay.
 */
export async function fetchFxRates(): Promise<FxRates> {
  const url = new URL("https://api.frankfurter.dev/v1/latest");
  url.searchParams.set("base", "EUR");
  url.searchParams.set("symbols", ["IDR", ...TARGETS].join(","));

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 43_200, tags: ["fx"] },
    });
    if (!response.ok) return FALLBACK_RATES;

    const payload: unknown = await response.json();
    return toIdrBase(payload) ?? FALLBACK_RATES;
  } catch {
    return FALLBACK_RATES;
  }
}

function toIdrBase(payload: unknown): FxRates | null {
  if (typeof payload !== "object" || payload === null) return null;

  const { date, rates } = payload as { date?: unknown; rates?: unknown };
  if (typeof rates !== "object" || rates === null) return null;

  const perEur = rates as Record<string, unknown>;
  const idrPerEur = perEur.IDR;
  if (typeof idrPerEur !== "number" || idrPerEur <= 0) return null;

  const converted: Record<string, number> = {};
  for (const code of TARGETS) {
    const value = code === "EUR" ? 1 : perEur[code];
    if (typeof value === "number" && value > 0) converted[code] = value / idrPerEur;
  }

  // A response that lost most of its currencies is worse than the snapshot we shipped with.
  if (Object.keys(converted).length < TARGETS.length / 2) return null;

  return {
    base: BASE_CURRENCY,
    date: typeof date === "string" ? date : new Date().toISOString().slice(0, 10),
    rates: converted,
    source: "live",
  };
}
