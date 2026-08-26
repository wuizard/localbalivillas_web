"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";

const DEBOUNCE_MS = 300;

type NameSearchProps = {
  /** How many places the current params matched, for the live count beside the field. */
  resultCount: number;
  className?: string;
};

/**
 * Find-by-name for the results page. It writes `?q=` rather than filtering in the browser, so
 * a search stays shareable and the list is still server-rendered (CLAUDE.md §4) — the typing
 * is debounced because every commit is a navigation.
 */
export function NameSearch({ resultCount, className }: NameSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const committed = params.get("q") ?? "";
  const [value, setValue] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // A back/forward step, or a cleared filter elsewhere, changes the URL under us; the field
  // follows the URL rather than holding onto what was typed before the navigation. Adjusted
  // during render rather than in an effect, which would paint the stale value first.
  if (lastCommitted !== committed) {
    setLastCommitted(committed);
    setValue(committed);
  }

  function commit(next: string) {
    const params2 = new URLSearchParams(params.toString());
    if (next.trim()) params2.set("q", next.trim());
    else params2.delete("q");

    const query = params2.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  useEffect(() => {
    if (value === committed) return;
    const timer = setTimeout(() => commit(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `commit` closes over the params it should read at fire time; re-created each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, committed]);

  return (
    <form
      role="search"
      aria-label="Search villas by name"
      onSubmit={(event) => {
        event.preventDefault();
        commit(value);
        inputRef.current?.blur();
      }}
      className={cn("group relative", className)}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-4 py-2.5 md:px-5 md:py-3",
          "bg-surface ring-border/70 shadow-sm ring-1 transition-[box-shadow,border-color] duration-200",
          "group-focus-within:ring-brand-400 group-focus-within:shadow-lg group-focus-within:ring-2",
        )}
      >
        <Search
          size={18}
          strokeWidth={2}
          aria-hidden
          className={cn(
            "text-brand-500 shrink-0 transition-opacity duration-200",
            isPending && "opacity-50",
          )}
        />

        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by villa name…"
          autoComplete="off"
          aria-label="Villa name"
          className={cn(
            "text-body text-fg placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent",
            "outline-none [&::-webkit-search-cancel-button]:hidden",
          )}
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              commit("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className={cn(
              "text-fg-muted hover:bg-surface-muted hover:text-fg flex size-7 shrink-0",
              "items-center justify-center rounded-full transition-colors duration-[120ms]",
              "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
            )}
          >
            <X size={15} strokeWidth={2} aria-hidden />
          </button>
        ) : null}

        {/* The count is the whole feedback loop for a debounced field — without it a search
            that matches nothing looks identical to one that has not run yet. */}
        <span
          aria-live="polite"
          className="text-body-sm text-fg-muted border-border hidden shrink-0 border-l pl-3 sm:block"
        >
          {resultCount} {resultCount === 1 ? "place" : "places"}
        </span>
      </div>
    </form>
  );
}
