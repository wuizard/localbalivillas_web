"use client";

import { BedDouble, CalendarHeart, Compass, Menu, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/shared/lib/cn";
import { showsBottomNav } from "./routes";

const ITEMS = [
  { href: "/", label: "Explore", icon: Compass },
  { href: "/properties", label: "Stays", icon: BedDouble },
  { href: "/activities", label: "Activities", icon: Ticket },
  { href: "/events", label: "Events", icon: CalendarHeart },
  { href: "/profile", label: "Menu", icon: Menu },
] as const;

/** Past this the gesture is a drag, not a tap, and the tap's click gets suppressed. */
const DRAG_THRESHOLD_PX = 6;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const listRef = useRef<HTMLUListElement>(null);

  const [pill, setPill] = useState({ x: 0, w: 0 });
  const [drag, setDrag] = useState<{ x: number; index: number } | null>(null);

  const startX = useRef(0);
  const didDrag = useRef(false);
  const dragIndex = useRef(0);
  const suppressClick = useRef(false);

  const activeIndex = ITEMS.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );

  useLayoutEffect(() => {
    // Queried by index rather than child position — the pill itself is a sibling <li>.
    const el = listRef.current?.querySelector(`[data-nav-index="${activeIndex}"]`);
    if (!(el instanceof HTMLElement)) {
      setPill({ x: 0, w: 0 });
      return;
    }
    setPill({ x: el.offsetLeft, w: el.offsetWidth });
  }, [activeIndex, pathname]);

  function itemAt(clientX: number): { index: number; el: HTMLElement } | null {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-nav-index]");
    if (!items) return null;

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        return { index: Number(el.dataset.navIndex), el };
      }
    }
    return null;
  }

  function onPointerDown(event: ReactPointerEvent<HTMLUListElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    didDrag.current = false;
  }

  function onPointerMove(event: ReactPointerEvent<HTMLUListElement>) {
    if (event.buttons === 0 && event.pointerType === "mouse") return;
    if (!didDrag.current && Math.abs(event.clientX - startX.current) < DRAG_THRESHOLD_PX) return;

    const list = listRef.current;
    if (!list) return;

    if (!didDrag.current) {
      didDrag.current = true;
      // Throws if the pointer was already released mid-gesture; the drag still works without it.
      try {
        list.setPointerCapture(event.pointerId);
      } catch {}
    }

    const target = itemAt(event.clientX);
    if (!target) return;

    dragIndex.current = target.index;
    // The pill centres on the finger but stays inside the track.
    const listRect = list.getBoundingClientRect();
    const width = target.el.offsetWidth;
    const min = list.querySelector<HTMLElement>('[data-nav-index="0"]')?.offsetLeft ?? 0;
    const max = listRect.width - min - width;
    const raw = event.clientX - listRect.left - width / 2;

    setDrag({ x: Math.min(Math.max(raw, min), max), index: target.index });
  }

  function endDrag(event: ReactPointerEvent<HTMLUListElement>) {
    if (!didDrag.current) {
      setDrag(null);
      return;
    }

    didDrag.current = false;
    suppressClick.current = true;
    setDrag(null);
    try {
      listRef.current?.releasePointerCapture(event.pointerId);
    } catch {}

    const destination = ITEMS[dragIndex.current];
    if (destination && dragIndex.current !== activeIndex) router.push(destination.href);
  }

  // The click that follows a drag would navigate a second time, to whichever link the
  // finger happened to lift over.
  function onClickCapture(event: React.MouseEvent) {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  if (!showsBottomNav(pathname)) return null;

  const highlightIndex = drag?.index ?? activeIndex;

  return (
    <>
      {/* In flow, so the last row of content clears the floating bar — and so it disappears
          along with it rather than leaving 82px of dead space on the pages that hide it. */}
      <div
        aria-hidden
        className="md:hidden"
        style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 82px)" }}
      />

      <nav
        aria-label="Primary"
        className="fixed inset-x-3 z-50 md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
      >
        <ul
          ref={listRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          // Vertical gestures still scroll the page; horizontal ones are ours.
          className="glass relative flex h-[62px] touch-pan-y items-stretch rounded-[22px] px-1.5"
        >
          {pill.w > 0 ? (
            <li
              aria-hidden
              className={cn(
                // A white capsule vanishes on the near-white glass over light content, so the
                // active state carries a brand tint and a rim rather than just extra brightness.
                // `left-0` matters: without it the pill's static position is the bar's padding
                // edge, so translateX(offsetLeft) would add that padding a second time.
                "bg-brand-500/16 ring-brand-500/25 absolute inset-y-1.5 left-0 rounded-[17px] ring-1 ring-inset",
                "dark:bg-white/14 dark:ring-white/20",
                "shadow-[inset_0_1px_0_0_rgb(255_255_255/.55)]",
                // Follows the finger 1:1 while dragging, eases only when it snaps home.
                drag
                  ? "transition-none"
                  : "transition-[transform,width] duration-[420ms] ease-[var(--ease-glass)] motion-reduce:transition-none",
              )}
              style={{
                transform: `translateX(${drag?.x ?? pill.x}px)`,
                width: pill.w,
                willChange: "transform",
              }}
            />
          ) : null}

          {ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isHighlighted = index === highlightIndex;

            return (
              <li key={href} data-nav-index={index} className="flex-1">
                <Link
                  href={href}
                  draggable={false}
                  aria-current={index === activeIndex ? "page" : undefined}
                  className={cn(
                    "relative flex h-full flex-col items-center justify-center gap-1 rounded-[17px]",
                    "text-fg-muted transition-colors duration-[120ms] select-none",
                    !drag && "active:scale-[0.97]",
                    "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:-outline-offset-2",
                    isHighlighted && "text-brand-700 dark:text-brand-300",
                  )}
                >
                  <Icon size={21} strokeWidth={isHighlighted ? 2.2 : 1.8} aria-hidden />
                  <span className="text-[11px] leading-none font-semibold whitespace-nowrap">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
