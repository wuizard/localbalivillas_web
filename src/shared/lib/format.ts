const IDR = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** All money is IDR integers in the domain layer; format only at the edge. */
export function formatIDR(amount: number): string {
  return `IDR ${IDR.format(Math.round(amount))}`;
}

/** Compact form for tight surfaces such as calendar day cells: IDR 3.2M. */
export function formatIDRCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `IDR ${millions.toFixed(millions < 10 ? 1 : 0).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) return `IDR ${Math.round(amount / 1_000)}k`;
  return `IDR ${IDR.format(amount)}`;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Bare compact amount for tight surfaces such as calendar cells: "2.5M", "850k". */
export function formatAmountCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toFixed(millions < 10 ? 1 : 0).replace(/\.0$/, "")}M`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
  return String(amount);
}
