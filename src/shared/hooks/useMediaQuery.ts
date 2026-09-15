"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Matches a CSS media query from JS, for the few places a breakpoint has to change a
 * prop rather than a class — a Tailwind variant cannot reach `visibleDuration`.
 *
 * Reach for a `lg:` class first. This is the exception, not the tool.
 *
 * The server snapshot is always `false`, so a query written mobile-first renders its
 * small-screen form on the server and settles on the real answer after hydration.
 * Writing it the other way round would ship the desktop layout to a phone for a frame.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
