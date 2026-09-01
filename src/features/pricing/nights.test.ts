import { describe, expect, it } from "vitest";
import { countNights, occupiedNights, stayDays, weekdayOf } from "./nights";

describe("stayDays", () => {
  it("includes both the check-in and the check-out date", () => {
    expect(stayDays("2026-08-25", "2026-08-28")).toEqual([
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
    ]);
  });

  it("crosses a month boundary", () => {
    expect(stayDays("2026-08-30", "2026-09-02")).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });

  it("crosses a leap day", () => {
    expect(stayDays("2028-02-28", "2028-03-01")).toEqual([
      "2028-02-28",
      "2028-02-29",
      "2028-03-01",
    ]);
  });

  it("returns nothing when check-out precedes check-in", () => {
    expect(stayDays("2026-08-28", "2026-08-25")).toEqual([]);
  });
});

describe("countNights", () => {
  it("is one fewer than the dates — nobody sleeps on the night they leave", () => {
    expect(countNights(stayDays("2026-08-25", "2026-08-28"))).toBe(3);
  });

  it("treats a same-day range as zero nights", () => {
    expect(countNights(stayDays("2026-08-25", "2026-08-25"))).toBe(0);
  });

  it("never goes negative on an empty range", () => {
    expect(countNights([])).toBe(0);
  });
});

describe("occupiedNights", () => {
  it("drops the checkout date", () => {
    expect(occupiedNights(stayDays("2026-08-25", "2026-08-28"))).toEqual([
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
    ]);
  });
});

describe("weekdayOf", () => {
  it("names the day the API's way", () => {
    expect(weekdayOf("2026-08-25")).toBe("Tuesday");
    expect(weekdayOf("2026-08-29")).toBe("Saturday");
  });

  it("is timezone-stable — the date string alone decides", () => {
    // Parsed as UTC; a machine in Bali (+08) or Los Angeles (-07) must agree.
    expect(weekdayOf("2026-01-01")).toBe("Thursday");
  });
});
