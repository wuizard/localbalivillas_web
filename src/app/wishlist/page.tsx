import type { Metadata } from "next";
import { WishlistGrid, getProperties } from "@/features/property";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The villas you have saved on this device.",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  const properties = await getProperties();

  return (
    <div className="container-page py-8 md:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-label text-brand-600 uppercase dark:text-brand-300">Saved</p>
        <h1 className="font-display text-display-lg text-fg">Your wishlist</h1>
      </header>

      <WishlistGrid properties={properties} />
    </div>
  );
}
