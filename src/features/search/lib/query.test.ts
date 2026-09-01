import { describe, expect, it } from "vitest";
import { criteriaFromSearchParams, criteriaToSearchParams, searchHref } from "./query";
import { DEFAULT_CRITERIA } from "../types";

const read = (query: string) => criteriaFromSearchParams(new URLSearchParams(query));

describe("criteriaFromSearchParams", () => {
  /**
   * The round trip that matters: the encoder omits anything left at its default, so the
   * decoder sees an absent param far more often than a present one. `Number(null)` is 0
   * rather than NaN, which once turned "two adults, unstated" into one adult.
   */
  it("falls back to the default party when the params say nothing", () => {
    expect(read("")).toMatchObject({ adults: DEFAULT_CRITERIA.adults, children: 0, bedrooms: 0 });
  });

  it("survives a round trip through the encoder", () => {
    const criteria = {
      query: null,
      destination: "Ubud",
      checkIn: "2026-08-26",
      checkOut: "2026-08-30",
      bedrooms: 3,
      adults: 2,
      children: 1,
    };

    expect(read(criteriaToSearchParams(criteria).toString())).toEqual(criteria);
  });

  it("reads the numbers a guest actually chose", () => {
    expect(read("adults=4&children=2&bedrooms=5")).toMatchObject({
      adults: 4,
      children: 2,
      bedrooms: 5,
    });
  });

  it("refuses a stay that is not a stay", () => {
    // Zero nights cannot be booked, and a departure before arrival is a typo or a stale link.
    expect(read("checkIn=2026-08-26&checkOut=2026-08-26").checkOut).toBeNull();
    expect(read("checkIn=2026-08-26&checkOut=2026-08-20").checkOut).toBeNull();
    expect(read("checkIn=2026-08-26&checkOut=2026-08-27").checkOut).toBe("2026-08-27");
  });

  it("clamps junk rather than propagating it", () => {
    expect(read("adults=0").adults).toBe(1);
    expect(read("adults=banana").adults).toBe(DEFAULT_CRITERIA.adults);
    expect(read("bedrooms=99").bedrooms).toBe(10);
  });
});

describe("criteriaToSearchParams", () => {
  it("writes nothing for an untouched search", () => {
    expect(searchHref(DEFAULT_CRITERIA)).toBe("/properties");
  });

  it("drops a check-out that does not follow the check-in", () => {
    const query = criteriaToSearchParams({
      ...DEFAULT_CRITERIA,
      checkIn: "2026-08-26",
      checkOut: "2026-08-26",
    });

    expect(query.get("checkIn")).toBe("2026-08-26");
    expect(query.get("checkOut")).toBeNull();
  });
});
