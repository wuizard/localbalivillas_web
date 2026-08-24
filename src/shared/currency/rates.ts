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
 * Snapshotted 24 Aug 2026. The last resort only — a currency the guest picked still renders
 * when the provider is unreachable. Refresh it whenever the provider is swapped.
 */
const FALLBACK: Record<string, number> = {
  USD: 0.0000565168,
  EUR: 0.0000483885,
  GBP: 0.0000414237,
  AUD: 0.0000788515,
  SGD: 0.0000717503,
  MYR: 0.000228376,
  JPY: 0.00898087,
  CNY: 0.000380308,
  KRW: 0.0783028,
  THB: 0.00184583,
  HKD: 0.00044308,
  NZD: 0.0000946103,
  INR: 0.00541395,
  CAD: 0.0000779093,
  CHF: 0.0000452613,
  AED: 0.000207558,
  VND: 1.47242,
  TWD: 0.00179713,
  RUB: 0.00467975,
};

export const FALLBACK_RATES: FxRates = {
  base: BASE_CURRENCY,
  date: "2026-08-24",
  rates: FALLBACK,
  source: "fallback",
};

const TARGETS = CURRENCIES.map((currency) => currency.code).filter(
  (code): code is Exclude<CurrencyCode, typeof BASE_CURRENCY> => code !== BASE_CURRENCY,
);

/**
 * One adapter, one provider — swapping feeds means replacing this function and nothing else,
 * as long as the replacement keeps returning IDR-based multipliers.
 *
 * `open.er-api.com` rather than ECB data: the ECB reference set has never carried AED, TWD or
 * VND and dropped RUB in 2022, so half the currencies the site offers simply are not in it.
 * This one is keyless, covers all of them, and publishes daily.
 *
 * Rates are requested against USD rather than IDR on purpose: an IDR-based response rounds
 * 1 IDR → USD to two significant figures, a ~2% error on a forty-million-rupiah stay.
 */
export async function fetchFxRates(): Promise<FxRates> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
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

  const { rates, time_last_update_utc: updated } = payload as {
    rates?: unknown;
    time_last_update_utc?: unknown;
  };
  if (typeof rates !== "object" || rates === null) return null;

  const perUsd = rates as Record<string, unknown>;
  const idrPerUsd = perUsd.IDR;
  if (typeof idrPerUsd !== "number" || idrPerUsd <= 0) return null;

  const converted: Record<string, number> = {};
  for (const code of TARGETS) {
    const value = perUsd[code];
    if (typeof value === "number" && value > 0) converted[code] = value / idrPerUsd;
  }

  // A response that lost most of its currencies is worse than the snapshot we shipped with.
  if (Object.keys(converted).length < TARGETS.length) return null;

  const published = typeof updated === "string" ? new Date(updated) : null;

  return {
    base: BASE_CURRENCY,
    date: (published && !Number.isNaN(published.getTime()) ? published : new Date())
      .toISOString()
      .slice(0, 10),
    rates: converted,
    source: "live",
  };
}
