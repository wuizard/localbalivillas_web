import { occupiedNights } from "./nights";
import type { IsoDate, PricedRoom } from "./types";

/**
 * Nights the guest wants that the room cannot give them. The checkout date is excluded —
 * a room blocked on the day you leave is still bookable, because you are not sleeping in it.
 */
export function unavailableNights(room: PricedRoom, days: IsoDate[]): IsoDate[] {
  if (room.disabledDates.length === 0) return [];
  const blocked = new Set(room.disabledDates);
  return occupiedNights(days).filter((date) => blocked.has(date));
}

export function isRoomAvailable(room: PricedRoom, days: IsoDate[]): boolean {
  return unavailableNights(room, days).length === 0;
}
