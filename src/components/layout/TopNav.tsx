"use client";

import { ChevronDown, Heart, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { useLockBodyScroll } from "@/shared/hooks/useLockBodyScroll";
import { useWishlist } from "@/shared/hooks/useWishlist";
import { cn } from "@/shared/lib/cn";
import { primaryNav, propertyTypes, site } from "@/shared/config/site";
import { ButtonLink, Logo } from "@/shared/ui";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  const {
    isOpen: isVillasOpen,
    setOpen: setVillasOpen,
    containerRef: villasRef,
    triggerRef: villasTriggerRef,
  } = useDismissable<HTMLDivElement>();
  const wishlist = useWishlist();

  // The route the menu was opened on. Navigating away changes `pathname`, which closes
  // the menu by derivation rather than by a setState in an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isMenuOpen = openedOn === pathname;
  const setMenuOpen = (open: boolean) => setOpenedOn(open ? pathname : null);

  useLockBodyScroll(isMenuOpen);

  return (
    <header
      className="sticky top-0 z-40 max-md:glass-bar md:border-b md:border-border md:bg-surface/95 md:backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="relative mx-auto flex h-(--top-nav-h) max-w-[1440px] items-center gap-4 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen(true)}
          className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-fg hover:bg-surface-muted lg:hidden"
        >
          <Menu size={22} strokeWidth={1.7} aria-hidden />
        </button>

        {/* Taken out of flow so it is centred on the bar itself, not on the free space left
            over between the controls — those two clusters are different widths, and `mx-auto`
            would split the difference and sit the logo off-centre. Flush left from lg. */}
        <Link
          href="/"
          aria-label="Local Bali Villas, home"
          className="absolute left-1/2 shrink-0 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          <Logo width={140} priority />
        </Link>

        {/* Not "Primary" — that label belongs to the bottom navigation (DESIGN.md §4.1),
            and two landmarks sharing a name is a screen-reader ambiguity. */}
        <nav aria-label="Main" className="mx-auto hidden items-center gap-7 lg:flex">
          <div ref={villasRef} className="relative">
            <button
              type="button"
              ref={villasTriggerRef}
              aria-expanded={isVillasOpen}
              aria-haspopup="menu"
              onClick={() => setVillasOpen(!isVillasOpen)}
              className={cn(
                "flex items-center gap-1.5 text-label uppercase transition-colors duration-[120ms]",
                pathname.startsWith("/properties") || isVillasOpen
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-fg hover:text-brand-600",
              )}
            >
              Villas
              <ChevronDown
                size={14}
                aria-hidden
                className={cn("transition-transform duration-200", isVillasOpen && "rotate-180")}
              />
            </button>

            {isVillasOpen ? (
              <ul
                role="menu"
                className="absolute top-[calc(100%+14px)] left-1/2 z-30 w-56 -translate-x-1/2 rounded-md border border-border bg-surface p-1.5 shadow-lg"
              >
                {propertyTypes.map((type) => (
                  <li key={type.value} role="none">
                    <Link
                      role="menuitem"
                      href={type.href}
                      className="block rounded-sm px-3 py-2.5 text-body text-fg transition-colors hover:bg-surface-muted hover:text-brand-600"
                    >
                      {type.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {primaryNav.slice(1).map((item) => (
            <NavLink key={item.href} href={item.href} isActive={pathname.startsWith(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ml-auto pins this right now the logo no longer occupies flow; on lg the centred
            nav does that job, so a second auto margin here would pull it off centre. */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3 lg:ml-0">
          {/* Booking by phone is the highest-intent action on mobile, so it gets the slot
              the wishlist holds on desktop. The wishlist lives in the bottom nav there. */}
          <a
            href={`tel:+${site.whatsapp}`}
            aria-label={`Call us on ${site.phoneDisplay}`}
            className="-mr-2 flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-muted hover:text-brand-600 lg:hidden"
          >
            <Phone size={20} strokeWidth={1.7} aria-hidden />
          </a>

          <ThemeToggle className="max-lg:hidden" />

          <LanguageSwitch />

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlist.count} saved`}
            className="relative hidden size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-muted hover:text-brand-600 lg:flex"
          >
            <Heart size={19} strokeWidth={1.7} aria-hidden />
            <span
              aria-hidden
              className="tabular absolute top-1 right-0.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white"
            >
              {wishlist.count}
            </span>
          </Link>

          {/* max-lg: rather than `hidden lg:…` — the variant beats the base display utility. */}
          <ButtonLink href="/properties" size="sm" className="max-lg:hidden lg:h-10 lg:px-5">
            Book now
          </ButtonLink>
        </div>
      </div>

      {isMenuOpen ? <MobileMenu onClose={() => setMenuOpen(false)} /> : null}
    </header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "text-label uppercase transition-colors duration-[120ms]",
        isActive ? "text-brand-600 dark:text-brand-300" : "text-fg hover:text-brand-600",
      )}
    >
      {children}
    </Link>
  );
}

/** English is the only locale in v1; the control exists so the nav does not shift when more land. */
function LanguageSwitch() {
  return (
    <span className="hidden items-center gap-1 rounded-sm px-2 py-1.5 text-label text-fg-muted uppercase md:flex">
      EN
      <ChevronDown size={13} aria-hidden />
    </span>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Logo width={124} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-10 items-center justify-center rounded-full text-fg-muted hover:bg-surface-muted"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="flex flex-col">
            {propertyTypes.map((type) => (
              <li key={type.value}>
                <Link
                  href={type.href}
                  className="block border-b border-border py-4 text-body text-fg"
                >
                  {type.label}
                </Link>
              </li>
            ))}
            {primaryNav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-border py-4 text-body text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="border-t border-border p-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <ButtonLink href="/properties" size="lg" className="w-full">
            Book now
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
