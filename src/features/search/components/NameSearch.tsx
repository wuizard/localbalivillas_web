"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";

// Each commit is a server render, and unhurried thumb-typing on a phone leaves 300–400ms
// between keystrokes — at 300ms that is a navigation per character, which reads as no
// debounce at all.
const DEBOUNCE_MS = 500;

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
  const [seenInUrl, setSeenInUrl] = useState(committed);
  /** The last term this field put in the URL, so it can recognise its own echo. */
  const [sent, setSent] = useState(committed);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // A back/forward step, or a cleared filter elsewhere, changes the URL under us; the field
  // follows the URL rather than holding onto what was typed before the navigation. Adjusted
  // during render rather than in an effect, which would paint the stale value first.
  //
  // It must not follow the echo of its own commit: that arrives a server round trip after the
  // keystroke that caused it, and adopting it would discard every character typed in between.
  if (seenInUrl !== committed) {
    setSeenInUrl(committed);
    if (committed !== sent) {
      setSent(committed);
      setValue(committed);
    }
  }

  function commit(next: string) {
    const term = next.trim();
    if (term === sent) return;
    setSent(term);

    // Read the live URL, not this render's snapshot: a debounced commit fires up to
    // DEBOUNCE_MS after the render that scheduled it, by which time another filter may have
    // moved, and a stale snapshot would silently revert it.
    const next2 = new URLSearchParams(window.location.search);
    if (term) next2.set("q", term);
    else next2.delete("q");

    const query = next2.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  }

  // Committing is what `sent` records, so a commit from anywhere — this timer, Enter, the
  // clear button — re-runs this effect and cancels whatever else was still pending.
  useEffect(() => {
    if (value.trim() === sent) return;
    const timer = setTimeout(() => commit(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `commit` closes over the router it should read at fire time; re-created each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, sent]);

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
            that matches nothing looks identical to one that has not run yet. Phones need it
            most and have the least room, so the noun drops out and only the number stays. */}
        <span
          aria-live="polite"
          className="text-body-sm text-fg-muted border-border shrink-0 border-l pl-3"
        >
          {resultCount}
          <span className="sr-only sm:not-sr-only sm:ml-1">
            {resultCount === 1 ? "place" : "places"}
          </span>
        </span>
      </div>
    </form>
  );
}
