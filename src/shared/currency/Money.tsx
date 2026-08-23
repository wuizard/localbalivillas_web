"use client";

import { useCurrency } from "./CurrencyProvider";

type MoneyProps = {
  /** IDR integer. Formatting is the only place a currency other than IDR ever appears. */
  amount: number;
  compact?: boolean;
  className?: string;
};

/**
 * The one client leaf that renders money. Server components keep their IDR integers and drop
 * this in where the number is painted, so switching currency does not turn a property card
 * into a client component (CLAUDE.md §4).
 */
export function Money({ amount, compact = false, className }: MoneyProps) {
  const { format, formatCompact } = useCurrency();
  return <span className={className}>{compact ? formatCompact(amount) : format(amount)}</span>;
}
