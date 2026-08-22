import type { Metadata } from "next";
import { ComingSoon, EVENTS } from "@/features/content";
import { getPropertiesByKey } from "@/features/property";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events & celebrations in Bali",
  description:
    "Event packages are on the way. Until then we arrange each celebration by hand with the villa team.",
  alternates: { canonical: "/events" },
  // Thin until there are real packages behind it; nothing here should compete in search yet.
  robots: { index: false, follow: true },
};

export default async function EventsPage() {
  const [property] = await getPropertiesByKey(["majapahit-villa"]);
  return <ComingSoon content={EVENTS} image={property?.images[0] ?? null} />;
}
