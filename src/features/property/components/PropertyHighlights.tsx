import { Ban, Bus, CircleParking, Coffee, UtensilsCrossed, Waves } from "lucide-react";
import { ROOM_FACILITIES, type PropertyDetail, type RoomFacilityKey } from "../types";

const DETAIL: Record<RoomFacilityKey, { icon: typeof Coffee; detail: string }> = {
  breakfast: { icon: Coffee, detail: "Included with your stay" },
  airportShuttle: { icon: Bus, detail: "Complimentary airport transfer" },
  freeParking: { icon: CircleParking, detail: "Complimentary on-site parking" },
  swimmingPool: { icon: Waves, detail: "Your own private pool" },
  publicPool: { icon: Waves, detail: "Full resort pool access" },
  restaurant: { icon: UtensilsCrossed, detail: "On-site dining and curated menu" },
};

/**
 * Built from the facilities the rooms actually publish, so the list is never a boilerplate
 * promise the property does not keep. The non-refundable policy leads because it is the one
 * thing a guest most needs to know before they get attached.
 */
export function PropertyHighlights({ property }: { property: PropertyDetail }) {
  const offered = ROOM_FACILITIES.map((facility) => facility.key).filter((key) =>
    property.rooms.some((room) => room.facilities.includes(key)),
  );

  const highlights = [
    { key: "policy", label: "No refund & no modify", icon: Ban, detail: "Non-refundable reservation" },
    ...offered.map((key) => ({
      key,
      label: ROOM_FACILITIES.find((facility) => facility.key === key)?.label ?? key,
      icon: DETAIL[key].icon,
      detail: DETAIL[key].detail,
    })),
  ].slice(0, 5);

  if (highlights.length <= 1) return null;

  return (
    <section aria-labelledby="why-choose" className="container-page py-10 md:py-14">
      <h2 id="why-choose" className="font-display text-display-sm text-fg">
        Why choose {property.name}?
      </h2>
      <p className="mt-1 text-body text-fg-muted">We provide more than just a stay</p>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
        {highlights.map(({ key, label, icon: Icon, detail }) => (
          <li key={key} className="flex flex-col gap-2">
            <Icon size={24} strokeWidth={1.4} className="text-brand-500" aria-hidden />
            <span className="text-body-sm font-semibold text-fg">{label}</span>
            <span className="text-body-sm leading-snug text-fg-muted">{detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
