import { describe, expect, it } from "vitest";
import { toHouseRuleGroups } from "./house-rules";

/** The real payload from GET /property/kaamala-resort, trimmed to the rule list. */
const REAL_RULES = `<ul>
<li>Guests are required to show a photo ID and the name on your booking must match exactly as shown on your valid travel document/ID.</li>
<li>Check-in : From 15:00 to flexible.</li>
<li>Check-out : From 07:00 to 12:00 noon.</li>
<li>Cancellation : This reservation cannot be cancelled nor modified (Non refundable).</li>
<li>Refundable damage deposit : A deposit of IDR 500,000 is required upon your arrival. The deposit will be reimbursed on your check-out day after an inspection.</li>
<li>Smoking : Smoking is not allowed.</li>
<li>Parties/events are not allowed.</li>
<li>Pets are not allowed.</li>
</ul>`;

function groupOf(groups: ReturnType<typeof toHouseRuleGroups>, needle: string) {
  return groups.find((group) => group.rules.some((rule) => rule.value.includes(needle)))?.id;
}

describe("toHouseRuleGroups", () => {
  it("files each rule under the heading it belongs to", () => {
    const groups = toHouseRuleGroups(REAL_RULES);

    expect(groupOf(groups, "From 15:00")).toBe("check-in");
    expect(groupOf(groups, "From 07:00")).toBe("check-in");
    expect(groupOf(groups, "cannot be cancelled")).toBe("cancellation");
    expect(groupOf(groups, "Smoking is not allowed")).toBe("house-rules");
    expect(groupOf(groups, "Pets are not allowed")).toBe("house-rules");
  });

  it("keeps the deposit out of check-in even though it mentions arrival and check-out", () => {
    const groups = toHouseRuleGroups(REAL_RULES);
    expect(groupOf(groups, "IDR 500,000")).toBe("deposit");
  });

  it("files the ID requirement under guest requirements", () => {
    const groups = toHouseRuleGroups(REAL_RULES);
    expect(groupOf(groups, "photo ID")).toBe("guests");
  });

  it("loses no rules", () => {
    const groups = toHouseRuleGroups(REAL_RULES);
    const total = groups.reduce((count, group) => count + group.rules.length, 0);
    expect(total).toBe(8);
  });

  it("presents groups in a stable order", () => {
    const groups = toHouseRuleGroups(REAL_RULES);
    expect(groups.map((group) => group.id)).toEqual([
      "check-in",
      "cancellation",
      "deposit",
      "guests",
      "house-rules",
    ]);
  });

  it("gives every rule a unique id even when the same line is published twice", () => {
    const duplicated = `<ul>
<li>Extra bed on request (IDR 650,000 per child, per night)</li>
<li>Extra bed on request (IDR 650,000 per child, per night)</li>
</ul>`;

    const ids = toHouseRuleGroups(duplicated).flatMap((group) =>
      group.rules.map((rule) => rule.id),
    );

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  /**
   * Villa Bangkuang publishes headed paragraphs plus one stray `<ul>`. The old reader saw the
   * list and dropped every paragraph with it, so the page showed a lone "House rules" panel
   * while check-in, check-out and the age limit sat unread in the payload.
   */
  it("keeps headed paragraphs that sit alongside a list, and labels them by their heading", () => {
    const headedParagraphs = `<p><strong><u>Check in</u></strong></p>
<p>Guests are required to show an identity card with a photo at check-in.</p>
<p><br></p>
<p><strong><u>Check out</u></strong></p>
<p>From 08.00 AM to 12.00 PM</p>
<p><strong><u>Age Limited</u></strong></p>
<p>There is no age requirement for check-in</p>
<ul><li>Child policy: maximum of 2 children for each villa</li></ul>`;

    const groups = toHouseRuleGroups(headedParagraphs);

    expect(groups.map((group) => group.id)).toEqual(["check-in", "guests", "house-rules"]);
    expect(groups[0]?.rules).toEqual([
      {
        id: "check-in-0",
        label: "Check in",
        value: "Guests are required to show an identity card with a photo at check-in.",
      },
      { id: "check-in-1", label: "Check out", value: "From 08.00 AM to 12.00 PM" },
    ]);
    expect(groups[1]?.rules[0]?.label).toBe("Age Limited");
  });

  it("returns nothing when the property has no rules", () => {
    expect(toHouseRuleGroups(null)).toEqual([]);
    expect(toHouseRuleGroups("")).toEqual([]);
  });
});
