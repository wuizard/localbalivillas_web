import { htmlToLabelledLines } from "@/shared/lib/html";
import type { HouseRuleGroup } from "../types";

/**
 * The API returns every rule in one unstructured list. The detail page presents them as five
 * named groups, so each line is routed by what it is about.
 *
 * Classification reads the label before the colon first ("Refundable damage deposit : …") and
 * only falls back to the whole sentence when there is no label. Matching the full sentence
 * alone misfiles rules: the deposit rule mentions "upon your arrival", which a check-in
 * pattern happily claims.
 */
const GROUPS: { id: string; title: string; matches: RegExp }[] = [
  { id: "check-in", title: "Check-in & check-out", matches: /check[-\s]?(in|out)/i },
  { id: "cancellation", title: "Cancellation policy", matches: /cancel|modif|non[-\s]?refundable/i },
  { id: "deposit", title: "Damage deposit", matches: /deposit|damage/i },
  {
    id: "guests",
    title: "Guest requirements",
    matches: /photo id|passport|travel document|minimum age|age limit|age requirement|guests are required/i,
  },
];

const FALLBACK = { id: "house-rules", title: "House rules" };

function classify(label: string | null, line: string): { id: string; title: string } {
  // The label is the strongest signal; only consult the sentence when there isn't one.
  if (label) {
    const byLabel = GROUPS.find((group) => group.matches.test(label));
    if (byLabel) return byLabel;
  }

  return GROUPS.find((group) => group.matches.test(line)) ?? FALLBACK;
}

export function toHouseRuleGroups(houseRulesHtml: string | null | undefined): HouseRuleGroup[] {
  const lines = htmlToLabelledLines(houseRulesHtml);
  if (lines.length === 0) return [];

  const buckets = new Map<string, HouseRuleGroup>();

  for (const rule of lines) {
    const group = classify(rule.label, `${rule.label ?? ""} ${rule.value}`);

    const bucket = buckets.get(group.id) ?? { id: group.id, title: group.title, rules: [] };
    // Rule text is not unique — a property can publish the same line twice — so the render key
    // comes from position within the group, not from the sentence.
    bucket.rules.push({ id: `${group.id}-${bucket.rules.length}`, ...rule });
    buckets.set(group.id, bucket);
  }

  // Stable presentation order regardless of how the CMS happened to list them.
  return [...GROUPS.map((group) => group.id), FALLBACK.id]
    .map((id) => buckets.get(id))
    .filter((group): group is HouseRuleGroup => group !== undefined);
}
