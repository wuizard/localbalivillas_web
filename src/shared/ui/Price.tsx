import { Money } from "@/shared/currency";
import { cn } from "@/shared/lib/cn";

type PriceProps = {
  /** IDR integer. `null` means the rate is unknown — never render a guessed number. */
  amount: number | null;
  suffix?: string;
  prefixLabel?: string;
  className?: string;
};

export function Price({ amount, suffix = "/night", prefixLabel, className }: PriceProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {prefixLabel ? (
        <span className="text-fg-muted text-[11px] leading-none uppercase">{prefixLabel}</span>
      ) : null}
      {amount === null ? (
        <span className="text-body-sm text-fg-muted">Rates on request</span>
      ) : (
        <span className="flex items-baseline gap-1">
          <Money amount={amount} className="tabular text-price text-fg" />
          <span className="text-body-sm text-fg-muted">{suffix}</span>
        </span>
      )}
    </div>
  );
}
