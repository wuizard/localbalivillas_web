import { describe, expect, it } from "vitest";
import { countNights, occupiedNights, stayDays } from "@/features/pricing";
import type { ActivityPricing, ActivityRule } from "../types";
import { lowestActivityRate, quoteActivity, resolveActivityRates } from "./quote";

const base: ActivityPricing = {
  basis: "per_person",
  adult: 850_000,
  child: 500_000,
  minPax: 2,
  maxPax: 12,
};

// Mirrors what the API stores: a weekend rule and a Christmas rule, no base row —
// the base lives on the activity itself.
const rules: ActivityRule[] = [
  { date: null, day: ["Saturday", "Sunday"], adultPrice: 950_000, childPrice: 550_000 },
  {
    date: ["2026-12-24", "2026-12-25", "2026-12-26"],
    day: null,
    adultPrice: 1_400_000,
    childPrice: 800_000,
  },
];

describe("resolveActivityRates", () => {
  it("falls back to the activity's own price when nothing matches", () => {
    expect(resolveActivityRates(rules, "2026-09-03", base)).toEqual({
      adult: 850_000,
      child: 500_000,
    });
  });

  it("applies a weekday rule", () => {
    expect(resolveActivityRates(rules, "2026-09-05", base)).toEqual({
      adult: 950_000,
      child: 550_000,
    });
  });

  it("lets an exact date beat a weekday it also matches", () => {
    // 26 Dec 2026 is a Saturday and is covered by both rules.
    expect(resolveActivityRates(rules, "2026-12-26", base)).toEqual({
      adult: 1_400_000,
      child: 800_000,
    });
  });
});

describe("quoteActivity", () => {
  it("charges each head at the rate for that date", () => {
    const quote = quoteActivity({
      rules,
      base,
      date: "2026-09-03",
      party: { adult: 2, child: 1 },
    });

    expect(quote.total).toBe(2 * 850_000 + 1 * 500_000);
    expect(quote.minimumApplied).toBe(false);
  });

  it("bills the minimum party size when fewer people come", () => {
    const quote = quoteActivity({
      rules,
      base,
      date: "2026-09-03",
      party: { adult: 1, child: 0 },
    });

    expect(quote.chargedAdults).toBe(2);
    expect(quote.total).toBe(2 * 850_000);
    expect(quote.minimumApplied).toBe(true);
  });

  it("counts a child towards the minimum rather than adding an adult", () => {
    const quote = quoteActivity({
      rules,
      base,
      date: "2026-09-03",
      party: { adult: 1, child: 1 },
    });

    expect(quote.chargedAdults).toBe(1);
    expect(quote.total).toBe(850_000 + 500_000);
    expect(quote.minimumApplied).toBe(false);
  });

  it("ignores head count for a per-group activity", () => {
    const transfer: ActivityPricing = {
      basis: "per_group",
      adult: 450_000,
      child: 0,
      minPax: 1,
      maxPax: 6,
    };

    const quote = quoteActivity({
      rules: [],
      base: transfer,
      date: "2026-09-03",
      party: { adult: 4, child: 2 },
    });

    expect(quote.total).toBe(450_000);
  });

  /**
   * The regression this module exists to prevent. `features/pricing` drops the
   * checkout day, so a single date is zero nights — reuse those helpers here and
   * every activity is free. Named so the next person to reach for them trips a red
   * test instead of shipping it.
   */
  it("a one-day activity is not free", () => {
    const date = "2026-09-03";

    // What the stay helpers say about a single day, for the record:
    expect(countNights(stayDays(date, date))).toBe(0);
    expect(occupiedNights(stayDays(date, date))).toEqual([]);

    const quote = quoteActivity({ rules, base, date, party: { adult: 2, child: 0 } });

    expect(quote.total).toBeGreaterThan(0);
    expect(quote.total).toBe(1_700_000);
  });
});

describe("lowestActivityRate", () => {
  it("is the cheapest adult rate across the base and every rule", () => {
    expect(lowestActivityRate(rules, base)).toBe(850_000);
  });

  it("picks a rule up when it undercuts the base", () => {
    const discounted: ActivityRule[] = [
      { date: null, day: ["Tuesday"], adultPrice: 600_000, childPrice: 400_000 },
    ];
    expect(lowestActivityRate(discounted, base)).toBe(600_000);
  });

  it("returns null when nothing is priced", () => {
    expect(
      lowestActivityRate([], { basis: "per_person", adult: null, child: null, minPax: 1, maxPax: null }),
    ).toBeNull();
  });
});
