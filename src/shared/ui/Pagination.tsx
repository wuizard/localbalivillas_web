import Link from "next/link";
import { cn } from "@/shared/lib/cn";

type PaginationProps = {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
};

/**
 * Server-rendered links, not buttons: a page of results is a distinct URL (CLAUDE.md §4), so
 * every page stays shareable and every one is a crawlable path into the catalogue.
 */
export function Pagination({ page, pageCount, hrefFor, label = "Pagination" }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className="mt-10 flex items-center justify-center gap-1.5">
      <Step href={page > 1 ? hrefFor(page - 1) : null} label="Previous page">
        ‹
      </Step>

      <ul className="flex items-center gap-1.5">
        {pageRange(page, pageCount).map((entry, index) =>
          entry === null ? (
            <li
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-body-sm text-fg-muted select-none"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <Link
                href={hrefFor(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  "tabular flex size-9 items-center justify-center rounded-sm text-body-sm",
                  "transition-colors duration-[120ms] ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                  entry === page
                    ? "bg-brand-500 font-semibold text-white shadow-sm"
                    : "border border-border text-fg hover:bg-surface-muted",
                )}
              >
                {entry}
              </Link>
            </li>
          ),
        )}
      </ul>

      <Step href={page < pageCount ? hrefFor(page + 1) : null} label="Next page">
        ›
      </Step>
    </nav>
  );
}

function Step({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  const shape =
    "flex size-9 items-center justify-center rounded-sm border border-border text-body text-fg";

  if (href === null) {
    return (
      <span aria-hidden className={cn(shape, "opacity-40")}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        shape,
        "transition-colors duration-[120ms] ease-out hover:bg-surface-muted",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
      )}
    >
      {children}
    </Link>
  );
}

/** First, last, and the current page with a neighbour each side; `null` renders an ellipsis. */
function pageRange(page: number, pageCount: number): (number | null)[] {
  const shown = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...shown].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);

  return pages.flatMap((value, index) => {
    const previous = pages[index - 1];
    return previous !== undefined && value - previous > 1 ? [null, value] : [value];
  });
}
