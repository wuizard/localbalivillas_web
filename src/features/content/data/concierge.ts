import type { ComingSoonContent } from "../components/ComingSoon";

/**
 * Neither page exists on localbalivillas.com — the legacy nav routes "Experiences" and
 * "Transport" straight to the home page — so there is no old copy to carry over and no
 * catalogue to list. Both are marked coming soon.
 *
 * The `availableNow` lines are the exception: each one is already published in the legacy
 * FAQ ("villa bookings, tour packages, airport transfers, and activity arrangements";
 * guides "fluent in English"; "we can arrange special requests… including celebrations and
 * surprises"). Do not extend these lists without checking with the team — the point of the
 * page is that we only claim what we already do.
 */
export const ACTIVITIES: ComingSoonContent = {
  eyebrow: "Activities",
  title: "Things to do in Bali",
  lede:
    "We're building a proper catalogue of tours and experiences you can book in a few taps. It isn't ready yet, so for now our team puts these together with you directly.",
  availableNow: [
    "Tour packages built around what you want to see",
    "Airport transfers with a driver who knows the way",
    "Activity arrangements across the island",
    "Guides and drivers who know Bali and speak fluent English",
    "Recommendations for beaches, cultural sites and places to eat",
  ],
  note:
    "Nothing is confirmed until we've checked availability and agreed the price with you, so you'll never be charged for something we can't deliver.",
};

export const EVENTS: ComingSoonContent = {
  eyebrow: "Events",
  title: "Celebrations at our villas",
  lede:
    "Packages for birthdays, anniversaries and private events are on the way. Until they land, we arrange each one by hand with the villa team.",
  availableNow: [
    "Birthday and anniversary celebrations",
    "Romantic surprises arranged before you arrive",
    "Special requests passed straight to the villa team",
    "Private villas across Seminyak, Canggu, Ubud, Jimbaran and Uluwatu",
  ],
  note:
    "Send us your dates, your numbers and roughly what you have in mind, and we'll come back with what's possible and what it costs.",
};
