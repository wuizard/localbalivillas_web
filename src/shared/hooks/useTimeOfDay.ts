"use client";

import { useSyncExternalStore } from "react";

export type TimeOfDay = "day" | "night";

const NIGHT_STARTS_HOUR = 18;
const NIGHT_ENDS_HOUR = 6;
const RECHECK_MS = 60_000;

function resolve(): TimeOfDay {
  const hour = new Date().getHours();
  return hour >= NIGHT_STARTS_HOUR || hour < NIGHT_ENDS_HOUR ? "night" : "day";
}

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, RECHECK_MS);
  // A device waking from sleep can cross sunset without a tick firing.
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(id);
    window.removeEventListener("focus", onChange);
  };
}

/**
 * The guest's own clock decides — a visitor in Bali at 8pm and one in London at 2pm
 * should not see the same hero. The server always renders "day" so hydration matches;
 * the swap happens after mount, which is why it is a cross-fade rather than a jump.
 */
export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(subscribe, resolve, () => "day" as const);
}
