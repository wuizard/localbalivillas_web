"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { cn } from "@/shared/lib/cn";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

type View = { scale: number; x: number; y: number };

const RESET: View = { scale: 1, x: 0, y: 0 };

type LightboxProps = {
  images: string[];
  label: string;
  startIndex: number;
  onClose: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type Point = { x: number; y: number };

function pinchPair(pointers: Map<number, Point>): { a: Point; b: Point } | null {
  if (pointers.size !== 2) return null;
  const [a, b] = [...pointers.values()];
  return a && b ? { a, b } : null;
}

/**
 * Full-screen photo viewer: swipe/arrow between images, wheel or pinch or double-tap to zoom,
 * drag to pan. Zoom is per-image and resets whenever the visible photo changes.
 */
export function Lightbox({ images, label, startIndex, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(startIndex);
  const [view, setView] = useState<View>(RESET);
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const lastTap = useRef(0);

  const zoomed = view.scale > MIN_SCALE;

  useLockBodyScroll(true);

  const zoomTo = useCallback((next: number, clientX?: number, clientY?: number) => {
    setView((current) => {
      const scale = clamp(next, MIN_SCALE, MAX_SCALE);
      const rail = railRef.current;
      if (scale === MIN_SCALE || !rail) return scale === MIN_SCALE ? RESET : { ...current, scale };

      const box = rail.getBoundingClientRect();
      const centreX = box.left + box.width / 2;
      const centreY = box.top + box.height / 2;
      const pointX = (clientX ?? centreX) - centreX;
      const pointY = (clientY ?? centreY) - centreY;

      // Keep whatever sits under the cursor pinned there as the scale changes.
      const contentX = (pointX - current.x) / current.scale;
      const contentY = (pointY - current.y) / current.scale;
      const maxX = ((scale - 1) * box.width) / 2;
      const maxY = ((scale - 1) * box.height) / 2;

      return {
        scale,
        x: clamp(pointX - contentX * scale, -maxX, maxX),
        y: clamp(pointY - contentY * scale, -maxY, maxY),
      };
    });
  }, []);

  const panBy = useCallback((x: number, y: number) => {
    setView((current) => {
      const rail = railRef.current;
      if (!rail || current.scale === MIN_SCALE) return current;
      const box = rail.getBoundingClientRect();
      const maxX = ((current.scale - 1) * box.width) / 2;
      const maxY = ((current.scale - 1) * box.height) / 2;
      return { ...current, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    });
  }, []);

  const step = useCallback((direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const rail = railRef.current;
    if (rail) rail.scrollLeft = rail.clientWidth * startIndex;
  }, [startIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return onClose();
      if (event.key === "ArrowRight" && !zoomed) return step(1);
      if (event.key === "ArrowLeft" && !zoomed) return step(-1);
      if (event.key === "+" || event.key === "=") return zoomTo(view.scale + 0.5);
      if (event.key === "-") return zoomTo(view.scale - 0.5);
      if (event.key === "0") setView(RESET);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, step, view.scale, zoomTo, zoomed]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      zoomTo(view.scale * Math.exp(-event.deltaY * 0.002), event.clientX, event.clientY);
    }
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [view.scale, zoomTo]);

  function onPointerDown(event: React.PointerEvent<HTMLUListElement>) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pair = pinchPair(pointers.current);
    if (pair) {
      pinch.current = {
        distance: Math.hypot(pair.a.x - pair.b.x, pair.a.y - pair.b.y),
        scale: view.scale,
      };
      pan.current = null;
      return;
    }

    if (zoomed) {
      event.currentTarget.setPointerCapture(event.pointerId);
      pan.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y };
      setDragging(true);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLUListElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pair = pinchPair(pointers.current);
    if (pair && pinch.current) {
      const distance = Math.hypot(pair.a.x - pair.b.x, pair.a.y - pair.b.y);
      zoomTo(
        (pinch.current.scale * distance) / pinch.current.distance,
        (pair.a.x + pair.b.x) / 2,
        (pair.a.y + pair.b.y) / 2,
      );
      return;
    }

    if (pan.current) {
      panBy(
        pan.current.ox + (event.clientX - pan.current.x),
        pan.current.oy + (event.clientY - pan.current.y),
      );
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLUListElement>) {
    const start = pointers.current.get(event.pointerId);
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;

    if (pan.current) {
      pan.current = null;
      setDragging(false);
    }

    if (event.pointerType !== "mouse" && start) {
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10;
      const now = Date.now();
      if (!moved && now - lastTap.current < DOUBLE_TAP_MS) {
        lastTap.current = 0;
        zoomTo(zoomed ? MIN_SCALE : TAP_SCALE, event.clientX, event.clientY);
        return;
      }
      if (!moved) lastTap.current = now;
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} photos`}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95"
    >
      <header
        className="flex items-center justify-between gap-2 px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <span className="tabular text-body-sm font-semibold text-white/80">
          {index + 1} / {images.length}
        </span>

        <div className="flex items-center gap-1">
          <IconButton
            label="Zoom out"
            disabled={view.scale <= MIN_SCALE}
            onPress={() => zoomTo(view.scale - 0.5)}
          >
            <Minus size={20} aria-hidden />
          </IconButton>
          <IconButton
            label="Zoom in"
            disabled={view.scale >= MAX_SCALE}
            onPress={() => zoomTo(view.scale + 0.5)}
          >
            <Plus size={20} aria-hidden />
          </IconButton>
          <IconButton ref={closeRef} label="Close photos" onPress={onClose}>
            <X size={22} aria-hidden />
          </IconButton>
        </div>
      </header>

      <ul
        ref={railRef}
        onScroll={(event) => {
          const rail = event.currentTarget;
          const next = Math.round(rail.scrollLeft / rail.clientWidth);
          if (next === index) return;
          setIndex(next);
          setView(RESET);
        }}
        onDoubleClick={(event) =>
          zoomTo(zoomed ? MIN_SCALE : TAP_SCALE, event.clientX, event.clientY)
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: zoomed ? "none" : "pan-x" }}
        className={cn(
          "no-scrollbar flex flex-1 snap-x snap-mandatory",
          zoomed ? "overflow-hidden" : "overflow-x-auto",
          zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
        )}
      >
        {images.map((src, position) => (
          <li key={src} className="relative w-full shrink-0 snap-center overflow-hidden">
            <div
              className="absolute inset-0"
              style={
                position === index
                  ? {
                      transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
                      transition: dragging ? "none" : "transform 180ms ease-out",
                    }
                  : undefined
              }
            >
              <Image
                src={src}
                alt={`${label}, photo ${position + 1}`}
                fill
                sizes="100vw"
                draggable={false}
                className="object-contain select-none"
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] text-center text-[11px] text-white/50">
        Double-tap, pinch or scroll to zoom
      </p>
    </div>
  );
}

function IconButton({
  ref,
  label,
  disabled,
  onPress,
  children,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  label: string;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onPress}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
