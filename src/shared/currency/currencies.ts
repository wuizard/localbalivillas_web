/**
 * Display currencies. IDR is the base and the only currency anything is ever charged in —
 * everything else is an indicative conversion shown to help a guest judge the price, which is
 * why converted amounts are prefixed with `≈` and rounded to whole units.
 */
export const BASE_CURRENCY = "IDR";

export const CURRENCIES = [
  { code: "IDR", label: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
  { code: "AUD", label: "Australian Dollar", flag: "🇦🇺" },
  { code: "SGD", label: "Singapore Dollar", flag: "🇸🇬" },
  { code: "MYR", label: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "JPY", label: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", label: "Chinese Yuan", flag: "🇨🇳" },
  { code: "KRW", label: "South Korean Won", flag: "🇰🇷" },
  { code: "THB", label: "Thai Baht", flag: "🇹🇭" },
  { code: "HKD", label: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "NZD", label: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
  { code: "CAD", label: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", label: "Swiss Franc", flag: "🇨🇭" },
  { code: "AED", label: "UAE Dirham", flag: "🇦🇪" },
  { code: "VND", label: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "TWD", label: "New Taiwan Dollar", flag: "🇹🇼" },
  { code: "RUB", label: "Russian Ruble", flag: "🇷🇺" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** The symbols the currency chip in the nav shows beside the code. */
export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  IDR: "Rp",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  SGD: "S$",
  MYR: "RM",
  JPY: "¥",
  CNY: "CN¥",
  KRW: "₩",
  THB: "฿",
  HKD: "HK$",
  NZD: "NZ$",
  INR: "₹",
  CAD: "C$",
  CHF: "CHF",
  AED: "AED",
  VND: "₫",
  TWD: "NT$",
  RUB: "₽",
};

const CODES = new Set<string>(CURRENCIES.map((currency) => currency.code));

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return value !== null && value !== undefined && CODES.has(value);
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(code: CurrencyCode): Intl.NumberFormat {
  const cached = formatters.get(code);
  if (cached) return cached;

  const created = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: code,
    // `symbol`, not `narrowSymbol`: narrow renders USD, AUD, SGD, HKD, NZD, CAD *and* TWD all
    // as plain "$", and JPY and CNY both as "¥". A guest reading "$5,751" for a Taiwan-dollar
    // total as US dollars is off by a factor of thirty. `symbol` gives US$, A$, NT$, CN¥ —
    // longer, and never the wrong currency.
    currencyDisplay: "symbol",
    // Whole units only. A converted rate is indicative, and "≈ US$475.71" claims a precision
    // the mid-market rate behind it does not have.
    maximumFractionDigits: 0,
  });
  formatters.set(code, created);
  return created;
}

const IDR_DIGITS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/**
 * IDR keeps the house format ("IDR 8,400,000") rather than Intl's "Rp 8,400,000" — it is the
 * string the legacy site, the payment link and every confirmation email already use.
 */
export function formatMoney(amount: number, code: CurrencyCode): string {
  if (code === BASE_CURRENCY) return `IDR ${IDR_DIGITS.format(Math.round(amount))}`;
  return `≈ ${formatterFor(code).format(Math.round(amount))}`;
}

/** Compact form for tight surfaces such as calendar day cells: 3.2M, $476, ¥755k. */
export function formatMoneyCompact(amount: number, code: CurrencyCode): string {
  if (code === BASE_CURRENCY) {
    if (amount >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `${millions.toFixed(millions < 10 ? 1 : 0).replace(/\.0$/, "")}M`;
    }
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
    return String(Math.round(amount));
  }

  const symbol = CURRENCY_SYMBOL[code];
  // A dong or won total runs into the millions, so the compact form needs an M step of its
  // own — "₫12362k" in a calendar cell is not a price anyone can read at a glance.
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${symbol}${millions.toFixed(millions < 10 ? 1 : 0).replace(/\.0$/, "")}M`;
  }
  if (amount >= 100_000) return `${symbol}${Math.round(amount / 1_000)}k`;
  return `${symbol}${IDR_DIGITS.format(Math.round(amount))}`;
}
