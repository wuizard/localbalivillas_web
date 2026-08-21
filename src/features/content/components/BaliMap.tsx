import Link from "next/link";
import { cn } from "@/shared/lib/cn";

/** Geographic bounds of the drawing, and the box the island is projected into. */
const BOUNDS = { west: 114.42, east: 115.72, north: 8.05, south: 8.88 };
const VIEW = { w: 400, h: 300 };
const ISLAND = { x: 18, y: 40, w: 364, h: 226 };

function project([lng, lat]: readonly [number, number]): [number, number] {
  const fx = (lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west);
  const fy = (lat - BOUNDS.north) / (BOUNDS.south - BOUNDS.north);
  return [ISLAND.x + fx * ISLAND.w, ISLAND.y + fy * ISLAND.h];
}

/**
 * Bali's coastline, clockwise from Gilimanuk, coarse enough to draw at 400px wide. Because
 * the pins below are projected through the same function, a dot can never drift off the
 * land it belongs to — the two share one coordinate system by construction.
 */
const COASTLINE: readonly (readonly [number, number])[] = [
  // North coast, west to east
  [114.44, 8.18],
  [114.52, 8.13],
  [114.64, 8.11],
  [114.78, 8.13],
  [114.89, 8.16],
  [114.98, 8.14],
  [115.06, 8.1],
  [115.15, 8.07],
  [115.24, 8.06],
  [115.33, 8.07],
  [115.42, 8.11],
  [115.5, 8.16],
  [115.56, 8.21],
  // East point at Amed
  [115.63, 8.28],
  [115.65, 8.36],
  [115.61, 8.43],
  [115.56, 8.51],
  // South-east coast
  [115.5, 8.57],
  [115.43, 8.61],
  [115.35, 8.63],
  [115.28, 8.66],
  [115.26, 8.7],
  // Isthmus down to the Bukit
  [115.23, 8.74],
  [115.19, 8.77],
  [115.16, 8.79],
  [115.12, 8.79],
  [115.08, 8.81],
  [115.06, 8.84],
  [115.09, 8.87],
  [115.15, 8.87],
  [115.21, 8.84],
  [115.24, 8.8],
  [115.22, 8.76],
  // West coast, south to north
  [115.18, 8.73],
  [115.15, 8.69],
  [115.11, 8.64],
  [115.06, 8.59],
  [115.0, 8.54],
  [114.93, 8.5],
  [114.85, 8.46],
  [114.77, 8.41],
  [114.68, 8.36],
  [114.6, 8.31],
  [114.52, 8.26],
  [114.46, 8.22],
];

/**
 * Straight segments between the coastline points, with rounded joins. Smoothing through
 * midpoints was tried first and rounded the east point and the Bukit isthmus away — at this
 * many points the polygon tracks the real coast far more faithfully.
 */
function closedPath(points: readonly (readonly [number, number])[]): string {
  const pts = points.map(project);
  const first = pts[0];
  if (!first) return "";

  const rest = pts
    .slice(1)
    .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  return `M${first[0].toFixed(1)} ${first[1].toFixed(1)} ${rest} Z`;
}

const BALI_PATH = closedPath(COASTLINE);

export type MappedLocation = {
  /** Must match `locationName` from `GET /region/location` exactly, or the pin is dropped. */
  name: string;
  /** Real longitude and latitude. To add a destination, drop its coordinates in here. */
  lng: number;
  lat: number;
  /** Which side of the dot the label sits on, so neighbours and the frame edge stay clear. */
  align: "left" | "right";
  /** Larger badge treatment. Keep to one or two. */
  feature?: boolean;
  /** Dot only at every size. Used where the coast is too crowded to fit another label. */
  hideLabel?: boolean;
  /** Dot only on mobile, labelled from md — the map is half a phone wide beside the copy. */
  secondary?: boolean;
};

export const MAPPED_LOCATIONS: MappedLocation[] = [
  { name: "Tabanan", lng: 115.13, lat: 8.54, align: "left", secondary: true },
  { name: "Cemagi", lng: 115.1, lat: 8.62, align: "left", hideLabel: true },
  { name: "Canggu", lng: 115.13, lat: 8.65, align: "left" },
  { name: "Kerobokan", lng: 115.17, lat: 8.67, align: "left", hideLabel: true },
  { name: "Seminyak", lng: 115.16, lat: 8.69, align: "left", secondary: true },
  { name: "Legian", lng: 115.17, lat: 8.71, align: "left", hideLabel: true },
  { name: "Ubud", lng: 115.26, lat: 8.51, align: "right", feature: true },
  { name: "Gianyar", lng: 115.32, lat: 8.55, align: "right", hideLabel: true },
  { name: "Sanur", lng: 115.26, lat: 8.69, align: "right", secondary: true },
  { name: "Jimbaran", lng: 115.17, lat: 8.78, align: "left", secondary: true },
  { name: "Uluwatu", lng: 115.09, lat: 8.83, align: "left" },
  { name: "Nusa Dua", lng: 115.23, lat: 8.8, align: "right" },
  { name: "Karangasem", lng: 115.5, lat: 8.44, align: "left", secondary: true },
  { name: "Nusa Penida", lng: 115.54, lat: 8.73, align: "right", secondary: true },
];

type BaliMapProps = {
  pins: MappedLocation[];
  className?: string;
};

export function BaliMap({ pins, className }: BaliMapProps) {
  return (
    <div className={cn("relative aspect-[400/300] w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="absolute inset-0 size-full"
        aria-hidden
        focusable="false"
      >
        <defs>
          <filter id="bali-lift" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#957c64" floodOpacity="0.22" />
          </filter>
        </defs>

        <path
          d={BALI_PATH}
          filter="url(#bali-lift)"
          className="fill-brand-100 stroke-brand-200 dark:fill-brand-800/70 dark:stroke-brand-700"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Nusa Penida, drawn separately because it is a different island. */}
        <ellipse
          cx={project([115.54, 8.73])[0]}
          cy={project([115.54, 8.73])[1]}
          rx={13}
          ry={9}
          className="fill-brand-100 stroke-brand-200 dark:fill-brand-800/70 dark:stroke-brand-700"
          strokeWidth={1.5}
        />
      </svg>

      <ul>
        {pins.map((pin) => {
          const [px, py] = project([pin.lng, pin.lat]);

          return (
            <li key={pin.name}>
              <Link
                href={`/properties?destination=${encodeURIComponent(pin.name)}`}
                aria-label={`Villas in ${pin.name}`}
                className={cn(
                  "absolute flex -translate-y-1/2 items-center gap-1",
                  "transition-transform duration-200 ease-out hover:scale-110",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                  pin.align === "left" && "-translate-x-full flex-row-reverse",
                )}
                style={{
                  left: `${(px / VIEW.w) * 100}%`,
                  top: `${(py / VIEW.h) * 100}%`,
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-brand-950",
                    pin.feature ? "size-5 md:size-6" : "size-3 md:size-3.5",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-full bg-brand-600",
                      pin.feature ? "size-2.5 md:size-3" : "size-1.5",
                    )}
                  />
                </span>

                {pin.hideLabel ? null : (
                  <span
                    className={cn(
                      "leading-none whitespace-nowrap text-fg",
                      pin.feature
                        ? "text-[9px] font-semibold md:text-[12px]"
                        : "text-[8px] font-medium md:text-[11px]",
                      pin.secondary && "max-md:hidden",
                    )}
                  >
                    {pin.name}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
