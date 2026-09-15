"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  /** Kept on the query string so a search does not throw away the active filters. */
  categories: string[];
  location: string | null;
  initial: string;
};

/**
 * Search by name.
 *
 * A real `<form action="/activities">`, so it submits and works with JavaScript off;
 * the router push is an enhancement that keeps the navigation soft. The active filters
 * ride along as hidden inputs rather than being silently dropped.
 */
export function ActivitySearch({ categories, location, initial }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const hrefFor = (query: string) => {
    const params = new URLSearchParams();
    if (categories.length) params.set("category", categories.join(","));
    if (location) params.set("location", location);
    if (query.trim()) params.set("q", query.trim());
    const search = params.toString();
    return search ? `/activities?${search}` : "/activities";
  };

  return (
    <form
      action="/activities"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(hrefFor(value));
      }}
      className="relative"
      role="search"
    >
      {categories.length ? (
        <input type="hidden" name="category" value={categories.join(",")} />
      ) : null}
      {location ? <input type="hidden" name="location" value={location} /> : null}

      <Search
        size={17}
        strokeWidth={1.9}
        aria-hidden
        className="text-fg-subtle pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
      />

      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search activities"
        aria-label="Search activities by name"
        className="border-border bg-surface text-body text-fg placeholder:text-fg-subtle focus:border-brand-400 h-12 w-full rounded-full border pr-12 pl-11 outline-none"
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            router.push(hrefFor(""));
          }}
          aria-label="Clear search"
          className="text-fg-muted hover:text-fg absolute top-1/2 right-4 -translate-y-1/2"
        >
          <X size={17} strokeWidth={2} />
        </button>
      ) : null}
    </form>
  );
}
