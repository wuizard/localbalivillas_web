"use client";

import { cn } from "@/shared/lib/cn";
import { MAX_BEDROOMS } from "../types";

const OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, MAX_BEDROOMS] as const;

function optionLabel(value: number): string {
  if (value === 0) return "Any";
  return value === MAX_BEDROOMS ? `${MAX_BEDROOMS}+` : String(value);
}

/**
 * Chips rather than the guest stepper: bedrooms is a one-tap choice from a short list, and a
 * stepper would make "I need five" five taps. `0` is "Any", which is also the default, so the
 * control never forces a guest to state a number they do not care about.
 */
export function BedroomPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div role="group" aria-label="Bedrooms" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={cn(
              "flex h-10 min-w-11 items-center justify-center rounded-full border px-3.5",
              "text-body-sm font-medium transition-colors duration-[120ms] ease-out",
              "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
              selected
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-border text-fg hover:border-brand-400 hover:text-brand-600",
            )}
          >
            {optionLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
