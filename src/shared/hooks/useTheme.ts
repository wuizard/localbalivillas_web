"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  isTheme,
  type ResolvedTheme,
  type Theme,
} from "@/shared/lib/theme";

function read(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

let snapshot: Theme = "system";
let hydrated = false;

function getSnapshot(): Theme {
  if (!hydrated) {
    hydrated = true;
    snapshot = read();
  }
  return snapshot;
}

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function handler() {
    const next = read();
    if (next !== snapshot) snapshot = next;
    onChange();
  }

  window.addEventListener(THEME_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  // A `system` preference has to follow the OS switching underneath us.
  media.addEventListener("change", handler);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
    media.removeEventListener("change", handler);
  };
}

function apply(theme: Theme): void {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "system" as const);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the choice will not survive a reload, but it still applies now.
    }
    apply(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  // Server renders "system", which the blocking script has already resolved on the client,
  // so this is only read after mount by components that need the concrete value.
  const resolved: ResolvedTheme =
    typeof document === "undefined"
      ? "light"
      : document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

  return { theme, resolved, setTheme };
}
