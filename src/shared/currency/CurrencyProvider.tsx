"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import {
  BASE_CURRENCY,
  formatMoney,
  formatMoneyCompact,
  isCurrencyCode,
  type CurrencyCode,
} from "./currencies";
import { FALLBACK_RATES, type FxRates } from "./rates";

const STORAGE_KEY = "lbv:currency";
const CHANGE_EVENT = "lbv:currency-change";

/**
 * The chosen currency is device-local display preference, stored the same way the wishlist is.
 * It deliberately stays out of the URL: search state is shareable (CLAUDE.md §4), and a link
 * that silently reprices itself in the sender's currency is not what either party asked for.
 */
let snapshot: CurrencyCode = BASE_CURRENCY;
let hydrated = false;

function read(): CurrencyCode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(raw) ? raw : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
}

function getSnapshot(): CurrencyCode {
  if (!hydrated) {
    hydrated = true;
    snapshot = read();
  }
  return snapshot;
}

// The server has no idea what the guest picked, so the first paint — and hydration — is
// always rupiah. Anything else is a mismatch on every price on the page.
function getServerSnapshot(): CurrencyCode {
  return BASE_CURRENCY;
}

function subscribe(onChange: () => void): () => void {
  function handler() {
    snapshot = read();
    onChange();
  }
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Multiplier from IDR to the selected currency, `null` while only IDR is in play. */
  rate: number | null;
  /** Reference-rate date, for the "indicative rate" note under a converted total. */
  ratesDate: string | null;
  format: (idr: number) => string;
  formatCompact: (idr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

async function fetchRates(): Promise<FxRates> {
  const response = await fetch("/api/fx", { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) return FALLBACK_RATES;
  return (await response.json()) as FxRates;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCurrency = useCallback((code: CurrencyCode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private mode or a full quota: the choice still applies to this session.
      snapshot = code;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const { data } = useQuery({
    queryKey: ["fx"],
    queryFn: fetchRates,
    // Nothing to convert while the guest is looking at rupiah, so nothing is requested.
    enabled: currency !== BASE_CURRENCY,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    placeholderData: FALLBACK_RATES,
  });

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = currency === BASE_CURRENCY ? null : (data?.rates[currency] ?? null);
    // Until a rate lands, prices stay in rupiah. A converted number is a claim about money,
    // and a guessed one is worse than the currency the guest did not ask for.
    const effective: CurrencyCode = rate === null ? BASE_CURRENCY : currency;
    const toDisplay = (idr: number) => (rate === null ? idr : idr * rate);

    return {
      currency,
      setCurrency,
      rate,
      ratesDate: rate === null ? null : (data?.date ?? null),
      format: (idr) => formatMoney(toDisplay(idr), effective),
      formatCompact: (idr) => formatMoneyCompact(toDisplay(idr), effective),
    };
  }, [currency, data, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return context;
}
