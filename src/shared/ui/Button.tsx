import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * HeroUI covers the hard a11y primitives (calendar, dialog, combobox). A call-to-action
 * is not one of them, and re-theming HeroUI's button costs more than owning 20 lines.
 */
export type ButtonVariant = "brand" | "outline" | "ghost" | "onImage" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold uppercase " +
  "tracking-[0.08em] text-label whitespace-nowrap transition-[background-color,color,box-shadow,transform] " +
  "duration-[120ms] ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const variants: Record<ButtonVariant, string> = {
  brand: "bg-brand-500 text-white shadow-sm hover:bg-brand-600",
  outline:
    "border border-brand-500 text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5",
  ghost: "text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5",
  onImage:
    "border border-white/35 bg-brand-500/80 text-white shadow-md backdrop-blur-sm hover:bg-brand-500",
  light: "bg-white text-brand-700 shadow-sm hover:bg-brand-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-6",
  lg: "h-12 px-8",
};

export function buttonClass(
  variant: ButtonVariant = "brand",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function ButtonLink({ variant, size, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
