"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "lbv:wishlist";
const CHANGE_EVENT = "lbv:wishlist-change";

/**
 * v1 has no guest accounts (CLAUDE.md §1), so a wishlist is device-local intent.
 * It is never sent to the API and never used to price anything.
 */
let snapshot: readonly string[] = [];
let hydrated = false;

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === "string") : [];
  } catch {
    return [];
  }
}

function refresh() {
  const next = read();
  const changed =
    next.length !== snapshot.length || next.some((key, index) => key !== snapshot[index]);
  if (changed) snapshot = next;
}

function getSnapshot(): readonly string[] {
  if (!hydrated) {
    hydrated = true;
    refresh();
  }
  return snapshot;
}

const EMPTY: readonly string[] = [];
function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  function handler() {
    refresh();
    onChange();
  }
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useWishlist() {
  const keys = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((key: string) => {
    const current = read();
    const next = current.includes(key)
      ? current.filter((entry) => entry !== key)
      : [...current, key];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode or a full quota: the wishlist is expendable, the session is not.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { keys, count: keys.length, has: (key: string) => keys.includes(key), toggle };
}
