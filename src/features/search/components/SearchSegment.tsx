"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SearchSegmentProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
};

/** The visual shell every segment of the search bar shares: icon, label, value. */
export function SearchSegment({ icon: Icon, label, children, className }: SearchSegmentProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 px-4 py-1.5", className)}>
      <Icon size={19} strokeWidth={1.6} className="shrink-0 text-brand-500" aria-hidden />
      <span className="flex min-w-0 flex-col gap-0.5">
        {/* Sentence case, not caps — the desktop bar reads as a question the guest answers,
            and "WHERE ARE YOU GOING?" set in caps shouts over the value beneath it. */}
        <span className="truncate text-[13px] leading-tight font-semibold whitespace-nowrap text-fg">
          {label}
        </span>
        {children}
      </span>
    </div>
  );
}

export function SegmentValue({ value, placeholder }: { value: string | null; placeholder: string }) {
  return (
    <span
      className={cn(
        "truncate text-left text-[13px] leading-tight",
        value ? "font-medium text-fg" : "text-fg-subtle",
      )}
    >
      {value ?? placeholder}
    </span>
  );
}
