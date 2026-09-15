import type { ReactNode } from "react";
import { categoriesWithActivities, getActivities, getCategories } from "@/features/activity";
import { StandaloneBackButton } from "@/shared/pwa/StandaloneBackButton";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { WhatsAppFab } from "./WhatsAppFab";

/**
 * The dropdown is the CMS taxonomy, narrowed to the categories the catalogue can
 * actually fill: one offering "Wellness" that lands on an empty list is worse than the
 * plain link it replaced. Both lists are cached - categories for an hour, activities
 * for 300s - so this is a cache hit on all but the first request in the window. On a
 * failure it returns empty and Activities falls back to a plain link.
 */
async function availableActivityCategories() {
  try {
    const [categories, activities] = await Promise.all([getCategories(), getActivities()]);
    const present = new Set(categoriesWithActivities(activities));

    return categories
      .filter((category) => present.has(category.slug))
      .map((category) => ({
        label: category.name,
        value: category.slug,
        href: `/activities?category=${category.slug}`,
      }));
  } catch {
    return [];
  }
}

export async function AppShell({ children }: { children: ReactNode }) {
  const menu = await availableActivityCategories();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="focus:bg-brand-500 sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-sm focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <StandaloneBackButton />

      <TopNav activityCategories={[...menu]} />

      {/* Clearance for the floating bottom nav is a spacer inside `BottomNav`, so it comes
          and goes with the bar rather than leaving a gap on the pages that hide it. */}
      <main id="main" className="flex-1">
        {children}
      </main>

      {/* Mobile behaves like an app: no footer, and everything it carried lives on /profile.
          It stays in the DOM below md so its internal links remain crawlable. */}
      <div className="max-md:hidden">
        <Footer />
      </div>

      <BottomNav />
      <WhatsAppFab />
    </div>
  );
}
