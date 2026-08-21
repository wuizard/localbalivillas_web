"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/hooks/useTheme";
import { cn } from "@/shared/lib/cn";
import type { Theme } from "@/shared/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Three explicit states rather than a two-way switch: "system" is a real preference, and
 * collapsing it into a toggle strands anyone whose OS flips at sunset.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-muted p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors duration-[120ms]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
              selected
                ? "bg-surface text-brand-600 shadow-sm dark:text-brand-300"
                : "text-fg-muted hover:text-fg",
            )}
          >
            <Icon size={14} strokeWidth={1.9} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
