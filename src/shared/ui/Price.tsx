import { cn } from "@/shared/lib/cn";
import { formatIDR } from "@/shared/lib/format";

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
        <span className="text-[11px] leading-none text-fg-muted uppercase">{prefixLabel}</span>
      ) : null}
      {amount === null ? (
        <span className="text-body-sm text-fg-muted">Rates on request</span>
      ) : (
        <span className="flex items-baseline gap-1">
          <span className="tabular text-price text-fg">{formatIDR(amount)}</span>
          <span className="text-body-sm text-fg-muted">{suffix}</span>
        </span>
      )}
    </div>
  );
}
