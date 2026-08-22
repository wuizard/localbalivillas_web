import type { Metadata } from "next";
import { ACTIVITIES, ComingSoon } from "@/features/content";
import { getPropertiesByKey } from "@/features/property";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Activities in Bali",
  description:
    "A catalogue of tours and experiences is on the way. Until then our team arranges them with you directly.",
  alternates: { canonical: "/activities" },
  // Thin until there is a catalogue behind it; nothing here should compete in search yet.
  robots: { index: false, follow: true },
};

export default async function ActivitiesPage() {
  const [property] = await getPropertiesByKey(["amala-ubud"]);
  return <ComingSoon content={ACTIVITIES} image={property?.images[0] ?? null} />;
}
