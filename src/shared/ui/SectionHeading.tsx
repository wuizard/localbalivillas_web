import { cn } from "@/shared/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  align?: "center" | "start";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <p className="flex items-center gap-3 text-label text-brand-600 uppercase dark:text-brand-300">
        <Rule flip />
        {eyebrow}
        <Rule />
      </p>
      <h2 className="font-display text-display-sm text-fg italic">{title}</h2>
    </div>
  );
}

function Rule({ flip = false }: { flip?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "hidden h-px w-10 bg-brand-300 sm:block",
        "after:block after:h-1.5 after:w-1.5 after:-translate-y-[3px] after:rotate-45 after:border-t after:border-r after:border-brand-300",
        flip ? "after:ml-0 after:-scale-x-100" : "after:ml-[calc(100%-6px)]",
      )}
    />
  );
}
