import { BedDouble, ChevronDown, Clock, ShieldCheck, UserCheck, Wallet } from "lucide-react";
import type { HouseRuleGroup } from "../types";

const ICONS: Record<string, typeof Clock> = {
  "check-in": Clock,
  cancellation: ShieldCheck,
  deposit: Wallet,
  "house-rules": BedDouble,
  guests: UserCheck,
};

/**
 * Native `<details>` rather than a JS accordion: keyboard support, screen-reader semantics
 * and in-page find all work with no client bundle. The first group opens by default because
 * check-in times are the most-asked question.
 */
export function ImportantInformation({ groups }: { groups: HouseRuleGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="important-information" className="container-page py-10 md:py-14">
      <h2
        id="important-information"
        className="font-display text-display-sm text-fg"
      >
        Important information
      </h2>

      <ul className="mt-5 flex flex-col gap-2.5">
        {groups.map((group, index) => {
          const Icon = ICONS[group.id] ?? BedDouble;

          return (
            <li key={group.id}>
              <details
                open={index === 0}
                className="group rounded-md border border-border bg-surface-muted/60 open:bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <Icon size={18} strokeWidth={1.6} className="shrink-0 text-brand-500" aria-hidden />
                  <span className="flex-1 text-body font-medium text-fg">{group.title}</span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden
                    className="shrink-0 text-fg-subtle transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>

                <div className="border-t border-border px-4 py-3.5">
                  <ul className="flex flex-col gap-2.5">
                    {group.rules.map((rule) => (
                      <li key={rule.id} className="text-body-sm text-fg-muted">
                        {rule.label ? (
                          <span className="font-semibold text-fg">{rule.label}: </span>
                        ) : null}
                        {rule.value}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
