import { describe, expect, it } from "vitest";
import { __testing } from "./queries";
import type { AppliedCoupon, BookingDraft, GuestDetails } from "../types";

const draft: BookingDraft = {
  propertyId: "66c36ab3bff80f7c13fcd6c3",
  propertyKey: "kaamala-resort",
  propertyName: "Kaamala Resort",
  propertyHref: "/resorts/kaamala-resort",
  location: "Ubud",
  image: null,
  roomId: "66c379d6bff80f7c13fcd857",
  roomName: "Suite Room Forest View",
  roomSnapshot: {
    propertyImage: ["https://cdn.example/room-1.jpg"],
    name: "Suite Room Forest View",
    room: 2,
    facilities: { breakfast: true, swimmingPool: true, freeParking: false },
    amenities: ["Air conditioning", "Safe"],
  },
  checkIn: "2026-08-25",
  checkOut: "2026-08-28",
  nights: 3,
  rooms: 2,
  adults: 2,
  children: 1,
  breakdown: [
    { date: "2026-08-25", price: 2_500_000 },
    { date: "2026-08-26", price: 2_500_000 },
    { date: "2026-08-27", price: 2_500_000 },
  ],
  subtotal: 15_000_000,
  available: true,
};

const guest: GuestDetails = {
  title: "male",
  firstName: "  Tom  ",
  lastName: "  Okafor ",
  email: "tom@example.com",
  phoneNumber: "+62 812 3456",
  country: "Australia",
  arrivalTime: "14:00",
  specialRequest: "Late check-in",
};

/**
 * `submitBooking` deliberately does not fire outside production — it would create a real,
 * non-refundable reservation against a live payment link, and there is no staging to point
 * at. These lock the payload shape so the one untested step is the network call itself.
 */
describe("booking submit payload", () => {
  it("carries the identifiers the backend keys a reservation on", () => {
    const payload = __testing.toPayload({
      draft,
      guest,
      coupon: null,
      subtotal: 15_000_000,
      total: 15_000_000,
    });

    expect(payload).toMatchObject({
      propertyId: draft.propertyId,
      placeId: draft.propertyId,
      roomId: draft.roomId,
      startDate: "2026-08-25",
      endDate: "2026-08-28",
      rooms: 2,
      adult: 2,
    });
  });

  /**
   * The three fields the legacy front end sends that a fresh reading of "3 nights, 2 adults,
   * 1 child" would get wrong. Each one is copied from `../lbv_fe`, which is the only
   * description of this endpoint that exists (CLAUDE.md §6).
   */
  it("counts days the way the backend does, not the way nights do", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    // 25th–28th is four dates and three nights. `totalDays` is the dates.
    expect(payload.days).toEqual(["2026-08-25", "2026-08-26", "2026-08-27", "2026-08-28"]);
    expect(payload.totalDays).toBe(4);
    expect(payload.totalDays).toBe(draft.nights + 1);
  });

  /**
   * The controller does `roomDetail.propertyImage` with no guard, so an absent or reshaped
   * `roomDetail` is not a degraded booking — it is a TypeError before anything is written.
   * These pin the five fields it reads, in the raw shapes it reads them in.
   */
  it("sends the room document the reservation is built from", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    expect(payload.roomDetail).toEqual(draft.roomSnapshot);
    expect(payload.roomDetail.propertyImage).toEqual(["https://cdn.example/room-1.jpg"]);
    expect(payload.roomDetail.name).toBe("Suite Room Forest View");
    expect(payload.roomDetail.room).toBe(2);
    expect(payload.roomDetail.amenities).toEqual(["Air conditioning", "Safe"]);
  });

  it("keeps facilities as the boolean object, not the display key list", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    // `RoomOffer.facilities` is `["breakfast", "swimmingPool"]`. Sending that shape would
    // store a room whose facilities are two array indices.
    expect(payload.roomDetail.facilities).toEqual({
      breakfast: true,
      swimmingPool: true,
      freeParking: false,
    });
    expect(Array.isArray(payload.roomDetail.facilities)).toBe(false);
  });

  it("names the child count `kids`, as the endpoint expects", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    expect(payload.kids).toBe(1);
    expect(Object.keys(payload)).not.toContain("children");
  });

  it("sends the nightly breakdown, which is nights and excludes the checkout date", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    expect(payload.priceList).toEqual(draft.breakdown);
    expect(payload.priceList).toHaveLength(3);
    expect(payload.priceList.at(-1)?.date).toBe("2026-08-27");
  });

  it("formats `value` as the pre-coupon subtotal", () => {
    const payload = __testing.toPayload({
      draft,
      guest,
      coupon: null,
      subtotal: 15_000_000,
      total: 13_500_000,
    });

    expect(payload.value).toBe("IDR 15,000,000");
  });

  it("trims the guest's name so it matches their ID at check-in", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });

    expect(payload.firstName).toBe("Tom");
    expect(payload.lastName).toBe("Okafor");
  });

  it("sends both the subtotal and the discounted total, never just one", () => {
    const payload = __testing.toPayload({
      draft,
      guest,
      coupon: null,
      subtotal: 15_000_000,
      total: 13_500_000,
    });

    expect(payload.subtotal).toBe(15_000_000);
    expect(payload.totalPrice).toBe(13_500_000);
  });

  it("describes an applied coupon the way the backend records it", () => {
    const coupon: AppliedCoupon = {
      code: "STAY10",
      type: "percentage",
      usage: "total",
      amount: 10,
      label: "10% off",
    };

    const payload = __testing.toPayload({
      draft,
      guest,
      coupon,
      subtotal: 15_000_000,
      total: 13_500_000,
    });

    expect(payload.voucherInfo).toEqual({
      voucherCode: "STAY10",
      nominal: 10,
      discountType: "percentage",
      couponUsage: "total",
    });
  });

  it("sends no voucher block when no code was used", () => {
    const payload = __testing.toPayload({ draft, guest, coupon: null, subtotal: 1, total: 1 });
    expect(payload.voucherInfo).toBeNull();
  });

  /**
   * The nav lets a guest read prices in fifteen other currencies. That is a display
   * conversion and nothing more: the reservation is priced, discounted and charged in IDR.
   * If a currency code or a converted amount ever reaches this payload, the guest is billed
   * a number nobody quoted them — so the payload is asserted to carry the rupiah integers
   * it was handed, and no currency field at all.
   */
  it("submits rupiah integers and names no currency", () => {
    const payload = __testing.toPayload({
      draft,
      guest,
      coupon: null,
      subtotal: 15_000_000,
      total: 13_500_000,
    });

    expect(payload.subtotal).toBe(draft.subtotal);
    expect(payload.totalPrice).toBe(13_500_000);
    expect(Number.isInteger(payload.totalPrice)).toBe(true);
    expect(Object.keys(payload)).not.toContain("currency");
    expect(JSON.stringify(payload)).not.toMatch(/USD|EUR|≈/);
  });
});
