import { BadgePercent, Headphones, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * `title` carries an explicit line break because the mobile strip is a fixed two-line
 * label; desktop ignores it and lets the text wrap naturally.
 *
 * Every claim here has to be one we actually keep. "Flexible cancellation" is deliberately
 * absent: every booking is non-refundable (CLAUDE.md §1), so promising it on the home page
 * would be a false claim, not a style choice.
 */
const PROMISES = [
  {
    icon: BadgePercent,
    title: "Best Price\nGuarantee",
    description: "Get the best rate when you book direct",
  },
  {
    icon: Headphones,
    title: "24/7 Concierge\nService",
    description: "Our team is always ready to assist",
  },
  {
    icon: ShieldCheck,
    title: "Secure\nBooking",
    description: "Payment through a protected checkout",
  },
  {
    icon: MapPin,
    title: "Local\nExperts",
    description: "We know Bali and we're here to help",
  },
  {
    icon: Sparkles,
    title: "Flexible\nOptions",
    description: "Custom requests? We've got you covered",
  },
] as const;

export function TrustStrip() {
  return (
    <section
      aria-label="Why book with us"
      className="mt-5 md:mt-0 md:bg-brand-50 dark:md:bg-surface-muted"
    >
      {/* Four across on a phone with no horizontal scroll, so the whole promise is readable
          at a glance. Four is what fits: at 390px each column is ~90px, and a fifth would
          push the labels below a legible size, so the last promise waits for md. */}
      <ul
        className="grid grid-cols-4 px-4
                   md:container-page md:grid-cols-3 md:gap-y-10 md:py-14
                   lg:grid-cols-5 lg:gap-0"
      >
        {PROMISES.map(({ icon: Icon, title, description }, index) => (
          <li
            key={title}
            className={cn(
              "flex flex-col items-center gap-1.5 px-1 py-2 text-center",
              "md:gap-3 md:px-4 md:py-0",
              index === PROMISES.length - 1 && "max-md:hidden",
              index > 0 && "border-l border-border md:border-0",
              index > 0 && "lg:border-l lg:border-brand-200 dark:lg:border-border",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-300 text-brand-600 md:size-12 dark:border-brand-400 dark:text-brand-300">
              <Icon size={15} strokeWidth={1.5} aria-hidden className="md:hidden" />
              <Icon size={20} strokeWidth={1.5} aria-hidden className="max-md:hidden" />
            </span>

            <span className="flex flex-col md:contents">
              <span className="text-[9.5px] leading-[1.3] font-semibold whitespace-pre-line text-fg md:text-label md:whitespace-normal md:uppercase">
                {title}
              </span>
              <span className="max-w-[14rem] text-body-sm text-fg-muted max-md:hidden">
                {description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
