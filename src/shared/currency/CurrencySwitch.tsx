"use client";

import { Check, ChevronDown } from "lucide-react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { cn } from "@/shared/lib/cn";
import { useCurrency } from "./CurrencyProvider";
import { BASE_CURRENCY, CURRENCIES, CURRENCY_SYMBOL } from "./currencies";

export function CurrencySwitch({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const { isOpen, setOpen, containerRef, triggerRef } = useDismissable<HTMLDivElement>();

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        ref={triggerRef}
        aria-label={`Currency, ${currency}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "text-label flex h-9 items-center gap-1 rounded-sm px-2 uppercase",
          "transition-colors duration-[120ms]",
          isOpen ? "bg-surface-muted text-brand-600" : "text-fg-muted hover:text-brand-600",
        )}
      >
        {/* AED and CHF have no distinct glyph, so their "symbol" is the code — printing both
            gives "AED AED". */}
        {CURRENCY_SYMBOL[currency] === currency ? null : (
          <span aria-hidden className="font-semibold">
            {CURRENCY_SYMBOL[currency]}
          </span>
        )}
        {currency}
        <ChevronDown
          size={13}
          aria-hidden
          className={cn("transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Currency"
          className={cn(
            "absolute top-[calc(100%+10px)] right-0 z-50 max-h-80 w-60 overflow-y-auto",
            "border-border bg-surface rounded-md border p-1.5 shadow-lg",
          )}
        >
          {CURRENCIES.map((item) => {
            const selected = item.code === currency;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setCurrency(item.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "text-body-sm flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left",
                    "hover:bg-surface-muted transition-colors",
                    selected ? "text-brand-600 dark:text-brand-300" : "text-fg",
                  )}
                >
                  <span aria-hidden className="w-6 shrink-0 text-base leading-none">
                    {item.flag}
                  </span>
                  <span className="tabular w-10 shrink-0 font-semibold">{item.code}</span>
                  <span className="text-fg-muted min-w-0 flex-1 truncate">{item.label}</span>
                  {selected ? <Check size={15} aria-hidden className="shrink-0" /> : null}
                </button>
              </li>
            );
          })}

          {/* Said once, here, rather than beside every price on the page. */}
          <li className="border-border text-fg-muted border-t px-2.5 pt-2 pb-1 text-[11px] leading-snug">
            Rates are indicative. Every booking is charged in {BASE_CURRENCY}.
          </li>
        </ul>
      ) : null}
    </div>
  );
}
