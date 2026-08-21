import { BadgeCheck, Lock, Receipt } from "lucide-react";

const STEPS = [
  { title: "Choose dates", detail: "Pick your arrival and departure" },
  { title: "Select villa", detail: "Compare rooms and rates" },
  { title: "Guest details & confirm", detail: "Pay securely and you're booked" },
] as const;

const ASSURANCES = [
  { icon: BadgeCheck, title: "Best price guarantee", detail: "The best rate when you book direct" },
  { icon: Receipt, title: "No hidden fees", detail: "The price you see is the price you pay" },
  { icon: Lock, title: "Secure payment", detail: "Handled by a protected checkout" },
] as const;

export function BookingSteps() {
  return (
    <section aria-labelledby="booking-steps" className="container-page py-10 md:py-14">
      <div className="rounded-md border border-border bg-surface p-5 shadow-sm md:p-8">
        <h2 id="booking-steps" className="font-display text-title text-fg md:text-display-sm">
          Easy booking in 3 steps
        </h2>

        <ol className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:gap-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-1 items-start gap-3">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[12px] font-semibold text-white"
              >
                {index + 1}
              </span>
              <span className="flex flex-col">
                <span className="text-body font-semibold text-fg">{step.title}</span>
                <span className="text-body-sm text-fg-muted">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <ul className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          {ASSURANCES.map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand-500" aria-hidden />
              <span className="flex flex-col">
                <span className="text-body-sm font-semibold text-fg">{title}</span>
                <span className="text-body-sm text-fg-muted">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
