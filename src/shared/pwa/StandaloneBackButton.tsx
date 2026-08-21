"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari predates the display-mode media query for installed apps.
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

/**
 * Installed on iOS there is no browser chrome and no left-edge back gesture — that edge
 * belongs to the OS — so a guest who taps into a villa has no way back. Android keeps its
 * system back button, but the affordance ships everywhere for consistency
 * (DESIGN.md §9.2). This is a functional requirement, not decoration.
 */
export function StandaloneBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const standalone = useSyncExternalStore(subscribe, isStandalone, () => false);

  if (!standalone || pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Go back"
      className="glass glass-sm fixed left-3 z-50 flex size-10 items-center justify-center rounded-full text-fg"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <ChevronLeft size={20} strokeWidth={2} aria-hidden />
    </button>
  );
}
