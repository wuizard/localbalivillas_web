import type { GuestReview } from "../types";

/**
 * DEMO CONTENT. NOT REAL GUEST REVIEWS.
 *
 * `GET /reviews/:propertyId` returns an empty array for every property, so these stand in
 * to make the review wall reviewable while the design is being built. They are written to
 * read naturally on purpose, since a wall of obvious lorem ipsum cannot be judged, and that
 * is exactly why they are fenced off:
 *
 *   1. `getReviewsWithFallback` refuses to return them in production builds.
 *   2. Every id carries a `demo-` prefix, so they are greppable in any dump or log.
 *   3. Real reviews always take the front of the wall and push these out one at a time.
 *
 * Delete this file the moment the reviews endpoint returns enough real data. Publishing
 * invented reviews under a guest's name is a consumer-protection problem, not a content gap.
 */
export const PLACEHOLDER_REVIEWS: Omit<GuestReview, "propertyName" | "propertyHref">[] = [
  {
    id: "demo-1",
    author: "Marieke V.",
    country: "Netherlands",
    countryCode: "NL",
    rating: 5,
    body: "Booking direct saved us nearly two million rupiah against the price we'd been quoted elsewhere, and the villa was better than the photos. The staff arranged an airport pickup at 2am without blinking. We'd stay again in a heartbeat.",
    date: "2026-07-28T09:12:00.000Z",
  },
  {
    id: "demo-2",
    author: "James O.",
    country: "Australia",
    countryCode: "AU",
    rating: 5,
    body: "Pool was spotless every morning, wifi held up well enough for me to work two days of the trip, and the team answered on WhatsApp within minutes every time. Genuinely easy from start to finish.",
    date: "2026-07-19T04:40:00.000Z",
  },
  {
    id: "demo-3",
    author: "Priya S.",
    country: "Singapore",
    countryCode: "SG",
    rating: 5,
    body: "We came for my mother's 60th and they set up the terrace with flowers and candles without us even asking twice. She cried. That's the whole review, really.",
    date: "2026-07-11T11:05:00.000Z",
  },
  {
    id: "demo-4",
    author: "Tom & Ellie",
    country: "United Kingdom",
    countryCode: "GB",
    rating: 5,
    body: "Beautiful place and a fantastic location for Canggu, walking distance to everything we wanted. The team even sorted us a scooter for the week without us having to go and find one.",
    date: "2026-06-30T15:22:00.000Z",
  },
  {
    id: "demo-5",
    author: "Lukas B.",
    country: "Germany",
    countryCode: "DE",
    rating: 5,
    body: "Third time booking through Local Bali Villas and the reason is simple: the price you're shown is the price you pay. No surprise cleaning fee at checkout, no resort charge invented on arrival.",
    date: "2026-06-21T08:58:00.000Z",
  },
  {
    id: "demo-6",
    author: "Amelia R.",
    country: "United States",
    countryCode: "US",
    rating: 5,
    body: "Waking up to the rice fields with coffee on the deck is a core memory now. The villa manager gave us a hand-drawn map of the warungs locals actually eat at, which turned out to be the best part of the trip.",
    date: "2026-06-14T22:31:00.000Z",
  },
  {
    id: "demo-7",
    author: "Kenji T.",
    country: "Japan",
    countryCode: "JP",
    rating: 5,
    body: "Very clean, very quiet, and the staff were so kind to our two young children. Having a private pool we could actually let them play in made the whole holiday easier.",
    date: "2026-05-29T06:17:00.000Z",
  },
  {
    id: "demo-8",
    author: "Camille D.",
    country: "France",
    countryCode: "FR",
    rating: 5,
    body: "Everything was handled over WhatsApp in a day: our dates, a late checkout, and a driver for the Uluwatu trip. For a first visit to Bali it took all the stress out of it.",
    date: "2026-05-16T13:44:00.000Z",
  },
  {
    id: "demo-9",
    author: "Daniel & Sofia",
    country: "Spain",
    countryCode: "ES",
    rating: 5,
    body: "We booked eleven nights and by the end the staff felt like family. They remembered how we took our coffee by day three and had it waiting on the deck every morning.",
    date: "2026-05-04T07:26:00.000Z",
  },
  {
    id: "demo-10",
    author: "Hannah W.",
    country: "New Zealand",
    countryCode: "NZ",
    rating: 5,
    body: "Sunset from the pool is exactly what you hope Bali will be. We ended up cancelling half our plans just to stay at the villa, which tells you everything.",
    date: "2026-04-22T10:03:00.000Z",
  },
  {
    id: "demo-11",
    author: "Arjun M.",
    country: "India",
    countryCode: "IN",
    rating: 5,
    body: "Travelled with my parents and worried about the stairs, so I asked ahead. They moved us to a ground floor room at no extra cost before we even arrived.",
    date: "2026-04-09T16:48:00.000Z",
  },
  {
    id: "demo-12",
    author: "Elise L.",
    country: "Canada",
    countryCode: "CA",
    rating: 5,
    body: "Rented the whole villa for a friends trip and splitting it eight ways came out cheaper than a mid range hotel each. Everyone got their own room and we had a private chef one night.",
    date: "2026-03-27T12:15:00.000Z",
  },
];
