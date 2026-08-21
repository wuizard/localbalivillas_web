"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export const MAX_ADULTS = 20;
export const MAX_CHILDREN = 10;

export function guestSummary(adults: number, children: number): string {
  const parts = [`${adults} ${adults === 1 ? "adult" : "adults"}`];
  if (children > 0) parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  return parts.join(", ");
}

/** Headline count for the compact mobile row, where the adult/child split does not fit. */
export function guestTotal(adults: number, children: number): string {
  const total = adults + children;
  return `${total} ${total === 1 ? "Guest" : "Guests"}`;
}

type StepperProps = {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
};

export function GuestStepper({ label, hint, value, min, max, onChange }: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <span className="flex flex-col">
        <span className="text-body font-medium text-fg">{label}</span>
        <span className="text-body-sm text-fg-muted">{hint}</span>
      </span>

      <span className="flex items-center gap-3">
        <StepButton
          label={`Remove one ${label.toLowerCase()}`}
          disabled={value <= min}
          onPress={() => onChange(value - 1)}
        >
          <Minus size={16} strokeWidth={2} aria-hidden />
        </StepButton>

        <output
          aria-live="polite"
          className="tabular w-6 text-center text-body font-semibold text-fg"
        >
          {value}
        </output>

        <StepButton
          label={`Add one ${label.toLowerCase()}`}
          disabled={value >= max}
          onPress={() => onChange(value + 1)}
        >
          <Plus size={16} strokeWidth={2} aria-hidden />
        </StepButton>
      </span>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onPress}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border text-fg",
        "transition-colors duration-[120ms] ease-out hover:border-brand-400 hover:text-brand-600",
        "disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
      )}
    >
      {children}
    </button>
  );
}
