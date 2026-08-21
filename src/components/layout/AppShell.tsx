import type { ReactNode } from "react";
import { StandaloneBackButton } from "@/shared/pwa/StandaloneBackButton";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";
import { WhatsAppFab } from "./WhatsAppFab";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-sm focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <StandaloneBackButton />

      <TopNav />

      {/* Padding keeps the last row of content clear of the floating bottom nav. */}
      <main id="main" className="flex-1 pb-[calc(env(safe-area-inset-bottom,0px)+82px)] md:pb-0">
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
