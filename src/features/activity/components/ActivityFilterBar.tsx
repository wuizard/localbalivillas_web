"use client";

import { Check, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { cn } from "@/shared/lib/cn";

export type FilterOption = { value: string; label: string };

type Props = {
  categories: FilterOption[];
  locations: string[];
  /** Several at once. Empty means every category. */
  selectedCategories: string[];
  selectedLocation: string | null;
  /** Carried through every link so changing a filter does not drop the search. */
  search?: string | null;
};

type Next = {
  categories?: string[];
  location?: string | null;
  /** Force the flat list even with nothing selected. */
  viewAll?: boolean;
};

/**
 * Category and area filters.
 *
 * Categories are additive: a pill toggles its slug in and out of the list, so "Marine
 * and Nature" is a URL (`?category=marine,nature`) rather than two separate visits.
 * Areas stay single-select - narrowing to two parts of the island at once has not come
 * up, and the button can then show which one is on.
 *
 * Two layouts, because one cannot serve both widths. A phone gets a single Filters
 * button opening a sheet holding everything: a row of pills that scrolls sideways looks
 * tidy until a second control sits beside it, and then the pills slide underneath it.
 *
 * Every choice is a link. The filter is the URL, so a filtered list stays shareable,
 * crawlable, and works before this component has hydrated.
 */
export function ActivityFilterBar({
  categories,
  locations,
  selectedCategories,
  selectedLocation,
  search = null,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const href = (next: Next) => {
    const params = new URLSearchParams();
    const nextCategories = next.categories ?? selectedCategories;
    const location = next.location === undefined ? selectedLocation : next.location;

    if (nextCategories.length) params.set("category", nextCategories.join(","));
    if (location) params.set("location", location);
    if (search) params.set("q", search);
    // Without a filter left, `view=all` is what keeps the flat list flat instead of
    // bouncing back to the category shelves mid-browse.
    if (!nextCategories.length && !location && !search && next.viewAll !== false) {
      params.set("view", "all");
    }

    const query = params.toString();
    return query ? `/activities?${query}` : "/activities";
  };

  /** A pill adds its slug if missing, removes it if present. */
  const toggled = (slug: string) =>
    selectedCategories.includes(slug)
      ? selectedCategories.filter((value) => value !== slug)
      : [...selectedCategories, slug];

  const activeCount = selectedCategories.length + (selectedLocation ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Phone: one button, everything behind it. */}
      <div className="sm:hidden">
        <FilterButton onClick={() => setSheetOpen(true)} count={activeCount} full />
      </div>

      {/* Tablet and up: pills, with the areas behind the same sheet. */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {/* "All" clears the categories - it is a state, not something to remove, so
            it carries no ✕. */}
        <FilterChip
          href={href({ categories: [] })}
          active={selectedCategories.length === 0}
          removable={false}
        >
          All
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category.value}
            href={href({ categories: toggled(category.value) })}
            active={selectedCategories.includes(category.value)}
          >
            {category.label}
          </FilterChip>
        ))}

        {locations.length > 1 ? (
          <>
            <span className="bg-border mx-1 h-6 w-px" aria-hidden />
            <FilterButton
              onClick={() => setSheetOpen(true)}
              count={selectedLocation ? 1 : 0}
              label={selectedLocation ?? "Area"}
            />
          </>
        ) : null}
      </div>

      {/* On a phone the button says how many filters are on; these say which. */}
      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 sm:hidden">
          {selectedCategories.map((slug) => (
            <ActiveFilter
              key={slug}
              label={categories.find((item) => item.value === slug)?.label ?? slug}
              href={href({ categories: toggled(slug) })}
            />
          ))}
          {selectedLocation ? (
            <ActiveFilter label={selectedLocation} href={href({ location: null })} />
          ) : null}
        </div>
      ) : null}

      {sheetOpen ? (
        <FilterSheet
          categories={categories}
          locations={locations}
          selectedCategories={selectedCategories}
          selectedLocation={selectedLocation}
          href={href}
          toggled={toggled}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}
    </div>
  );
}

function FilterButton({
  onClick,
  count,
  label = "Filters",
  full = false,
}: {
  onClick: () => void;
  count: number;
  label?: string;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={cn(
        "text-label inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 uppercase transition-colors sm:h-9",
        full && "w-full",
        count > 0
          ? "border-brand-500 text-brand-600 dark:text-brand-300"
          : "border-border text-fg hover:border-brand-400 hover:text-brand-600",
      )}
    >
      <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden />
      {label}
      {count > 0 ? (
        <span className="bg-brand-500 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function FilterChip({
  href,
  active,
  removable = true,
  children,
}: {
  href: string;
  active: boolean;
  removable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        "text-label flex h-9 items-center gap-1.5 rounded-full border px-4 uppercase transition-colors",
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-border text-fg hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
      )}
    >
      {children}
      {active && removable ? <X size={13} strokeWidth={2.4} aria-hidden /> : null}
    </Link>
  );
}

function ActiveFilter({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="border-border text-body-sm text-fg hover:border-brand-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
    >
      {label}
      <X size={13} strokeWidth={2} aria-hidden />
      <span className="sr-only">Remove filter</span>
    </Link>
  );
}

/** Bottom sheet on a phone, centred panel from sm up. Holds every filter. */
function FilterSheet({
  categories,
  locations,
  selectedCategories,
  selectedLocation,
  href,
  toggled,
  onClose,
}: {
  categories: FilterOption[];
  locations: string[];
  selectedCategories: string[];
  selectedLocation: string | null;
  href: (next: Next) => string;
  toggled: (slug: string) => string[];
  onClose: () => void;
}) {
  useLockBodyScroll(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasFilters = selectedCategories.length > 0 || Boolean(selectedLocation);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal
        aria-label="Filter activities"
        className="bg-surface relative flex max-h-[85dvh] w-full flex-col rounded-t-xl sm:max-w-md sm:rounded-xl"
      >
        <header className="border-border flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-display text-title text-fg">Filters</h2>
            <p className="text-body-sm text-fg-subtle">Pick as many categories as you like</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-fg-muted p-1">
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Section title="Category">
            {categories.map((category) => (
              <SheetRow
                key={category.value}
                href={href({ categories: toggled(category.value) })}
                active={selectedCategories.includes(category.value)}
                // The sheet stays put: picking a second category should not mean
                // reopening it. It closes on the row that ends the job - an area.
                keepOpen
                onNavigate={onClose}
              >
                {category.label}
              </SheetRow>
            ))}
          </Section>

          {locations.length > 1 ? (
            <Section title="Area">
              <SheetRow
                href={href({ location: null })}
                active={selectedLocation === null}
                onNavigate={onClose}
              >
                All areas
              </SheetRow>
              {locations.map((location) => (
                <SheetRow
                  key={location}
                  href={href({ location })}
                  active={selectedLocation === location}
                  onNavigate={onClose}
                >
                  {location}
                </SheetRow>
              ))}
            </Section>
          ) : null}
        </div>

        <footer className="border-border flex items-center justify-between border-t px-5 py-3">
          {hasFilters ? (
            <Link
              href={href({ categories: [], location: null })}
              onClick={onClose}
              className="text-body-sm text-brand-600 dark:text-brand-300 underline"
            >
              Clear all
            </Link>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-brand-500 text-label hover:bg-brand-600 rounded-full px-5 py-2.5 text-white uppercase"
          >
            Show results
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-label text-fg-subtle bg-surface-muted px-5 py-2 uppercase">{title}</h3>
      <ul className="divide-border divide-y">{children}</ul>
    </section>
  );
}

function SheetRow({
  href,
  active,
  onNavigate,
  keepOpen = false,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: () => void;
  keepOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        onClick={keepOpen ? undefined : onNavigate}
        className={cn(
          "text-body hover:bg-surface-muted flex items-center justify-between gap-3 px-5 py-3.5",
          active ? "text-brand-600 dark:text-brand-300" : "text-fg",
        )}
      >
        {children}
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
            active ? "border-brand-500 bg-brand-500 text-white" : "border-border",
          )}
          aria-hidden
        >
          {active ? <Check size={13} strokeWidth={3} /> : null}
        </span>
      </Link>
    </li>
  );
}
