/**
 * The room document as `POST /booking/submit` records it. The endpoint reads five fields off
 * the `roomDetail` it is sent and copies them onto the reservation, so this is the room as it
 * was at the moment of booking — not a view model.
 *
 * It lives in `shared/` rather than on `RoomOffer` because two features need it and neither
 * may import the other (CLAUDE.md §3): `features/property` builds it at the API boundary,
 * `features/booking` posts it back untouched.
 *
 * The field names are the backend's, not ours, and the shapes are the raw ones. That is the
 * whole point — `RoomOffer` flattens `facilities` to a list of the keys that are true and
 * drops `propertyImage` and `room` altogether, so none of the display fields can stand in.
 */
export type RoomSnapshot = {
  propertyImage: string[];
  name: string;
  /** Bedroom count. `null` where the room document has never had one set. */
  room: number | null;
  facilities: Record<string, boolean>;
  amenities: string[];
};
