import { matchDateRule } from "@/features/pricing";
import type { ActivityPricing, ActivityRule } from "../types";

export type ActivityRates = {
  adult: number;
  child: number;
};

export type ActivityParty = {
  adult: number;
  child: number;
};

export type ActivityQuote = {
  date: string;
  rates: ActivityRates;
  party: ActivityParty;
  /** Heads actually charged, after the minimum is applied. */
  chargedAdults: number;
  /** IDR integer. */
  total: number;
  /** True when the party is below `minPax` and the minimum is what's being charged. */
  minimumApplied: boolean;
};

/**
 * The rate on a date: exact-date rule, then weekday rule, then the activity's base.
 * Only the *matching* is shared with nightly rates — see `matchDateRule`.
 */
export function resolveActivityRates(
  rules: ActivityRule[],
  date: string,
  base: ActivityPricing,
): ActivityRates {
  const rule = matchDateRule(rules, date);
  return {
    adult: rule ? rule.adultPrice : (base.adult ?? 0),
    child: rule ? rule.childPrice : (base.child ?? 0),
  };
}

/**
 * What a party pays on one date.
 *
 * The rule that matters, and the reason this does not live in `features/pricing`:
 * **an activity is charged for the day it happens.** A stay is charged per night and
 * drops the checkout date, so `countNights` on a single day returns zero. Run an
 * activity through it and the total is zero rupiah. Never import the nights helpers
 * here — the regression test is named for exactly this.
 *
 * `per_group` ignores the head count: the rate is for the car, the boat or the
 * booking, and multiplying it by four people is a quote nobody would honour.
 */
export function quoteActivity({
  rules,
  base,
  date,
  party,
}: {
  rules: ActivityRule[];
  base: ActivityPricing;
  date: string;
  party: ActivityParty;
}): ActivityQuote {
  const rates = resolveActivityRates(rules, date, base);

  const adults = Math.max(0, Math.floor(party.adult));
  const children = Math.max(0, Math.floor(party.child));

  if (base.basis === "per_group") {
    return {
      date,
      rates,
      party: { adult: adults, child: children },
      chargedAdults: adults,
      total: Math.round(rates.adult),
      minimumApplied: false,
    };
  }

  // A minimum of two on a party of one bills two adult seats, which is what the
  // supplier charges us. It is stated on the page rather than hidden in the total.
  const minimum = Math.max(1, base.minPax ?? 1);
  const heads = adults + children;
  const shortfall = Math.max(0, minimum - heads);
  const chargedAdults = adults + shortfall;

  const total = Math.round(chargedAdults * rates.adult + children * rates.child);

  return {
    date,
    rates,
    party: { adult: adults, child: children },
    chargedAdults,
    total,
    minimumApplied: shortfall > 0,
  };
}

/** The lowest adult rate the activity ever charges — the "from" price on cards. */
export function lowestActivityRate(rules: ActivityRule[], base: ActivityPricing): number | null {
  const candidates = [base.adult ?? 0, ...rules.map((rule) => rule.adultPrice)].filter(
    (value) => value > 0,
  );
  return candidates.length > 0 ? Math.min(...candidates) : null;
}
