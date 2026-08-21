import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getFeaturedProperties, PropertyCard } from "@/features/property";
import { cn } from "@/shared/lib/cn";
import { Button, ButtonLink, Price, SectionHeading } from "@/shared/ui";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/shared/ui/BrandIcons";
import { PropertyCardSkeleton, Skeleton } from "@/shared/ui/Skeleton";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Component gallery",
  robots: { index: false, follow: false },
};

const BRAND_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const SEMANTIC = [
  { name: "bg", className: "bg-bg" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-muted", className: "bg-surface-muted" },
  { name: "border", className: "bg-border" },
  { name: "fg", className: "bg-fg" },
  { name: "fg-muted", className: "bg-fg-muted" },
  { name: "fg-subtle", className: "bg-fg-subtle" },
  { name: "success", className: "bg-success" },
  { name: "danger", className: "bg-danger" },
  { name: "whatsapp", className: "bg-whatsapp" },
] as const;

const TYPE_SCALE = [
  { token: "display-lg", className: "font-display text-display-lg" },
  { token: "display-sm", className: "font-display text-display-sm" },
  { token: "title", className: "text-title" },
  { token: "body", className: "text-body" },
  { token: "body-sm", className: "text-body-sm" },
  { token: "label", className: "text-label uppercase" },
  { token: "price", className: "tabular text-price" },
] as const;

/**
 * M1's exit criterion: every primitive on one page, in both themes side by side, so a
 * token change can be reviewed without clicking through the whole funnel.
 */
export default async function UiGalleryPage() {
  const [sample] = await getFeaturedProperties(1);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-label text-brand-600 uppercase dark:text-brand-300">Internal</p>
          <h1 className="mt-1 font-display text-display-lg text-fg">Component gallery</h1>
          <p className="mt-2 max-w-lg text-body text-fg-muted">
            Every shared primitive, rendered in light and dark. Not linked from the site and
            excluded from the sitemap.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Brand ramp">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
          {BRAND_RAMP.map((step) => (
            <div key={step} className="flex flex-col gap-1">
              <div
                className={cn("h-14 rounded-sm border border-border", `bg-brand-${step}`)}
                style={{ backgroundColor: `var(--color-brand-${step})` }}
              />
              <span className="text-[11px] text-fg-muted">{step}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic colours">
        <BothThemes>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SEMANTIC.map((token) => (
              <div key={token.name} className="flex flex-col gap-1">
                <div className={cn("h-12 rounded-sm border border-border", token.className)} />
                <span className="text-[11px] text-fg-muted">{token.name}</span>
              </div>
            ))}
          </div>
        </BothThemes>
      </Section>

      <Section title="Type scale">
        <BothThemes>
          <ul className="flex flex-col gap-3">
            {TYPE_SCALE.map((entry) => (
              <li key={entry.token} className="flex flex-wrap items-baseline gap-4">
                <code className="w-28 shrink-0 text-[11px] text-fg-muted">{entry.token}</code>
                <span className={cn(entry.className, "text-fg")}>
                  Stay. Experience. Celebrate. IDR 2,200,000
                </span>
              </li>
            ))}
            <li className="flex flex-wrap items-baseline gap-4">
              <code className="w-28 shrink-0 text-[11px] text-fg-muted">script</code>
              <span className="font-script text-3xl text-brand-500">Your Private</span>
            </li>
          </ul>
        </BothThemes>
      </Section>

      <Section title="Buttons">
        <BothThemes>
          <div className="flex flex-col gap-4">
            {(["brand", "outline", "ghost", "light"] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <code className="w-20 shrink-0 text-[11px] text-fg-muted">{variant}</code>
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="md">
                  Medium
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
                <Button variant={variant} size="md" disabled>
                  Disabled
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <code className="w-20 shrink-0 text-[11px] text-fg-muted">link</code>
              <ButtonLink href="/ui-gallery" variant="outline" size="md">
                As a link
              </ButtonLink>
            </div>
          </div>
        </BothThemes>
      </Section>

      <Section title="On photography">
        <div className="relative overflow-hidden rounded-md bg-brand-800 p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="onImage" size="lg">
              Explore villas
            </Button>
            <span className="glass flex h-11 items-center rounded-full px-5 text-body-sm font-semibold text-fg">
              Glass surface
            </span>
            <span className="glass glass-sm flex size-10 items-center justify-center rounded-full text-fg">
              ←
            </span>
          </div>
        </div>
      </Section>

      <Section title="Price">
        <BothThemes>
          <div className="flex flex-wrap items-end gap-8">
            <Price amount={2_200_000} prefixLabel="From" />
            <Price amount={24_000_000} prefixLabel="From" />
            <Price amount={null} />
          </div>
        </BothThemes>
      </Section>

      <Section title="Section heading">
        <BothThemes>
          <SectionHeading eyebrow="Our handpicked villas" title="Luxury stays, unforgettable moments" />
        </BothThemes>
      </Section>

      <Section title="Skeletons">
        <BothThemes>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <PropertyCardSkeleton />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-11 w-40 rounded-sm" />
            </div>
          </div>
        </BothThemes>
      </Section>

      {sample ? (
        <Section title="Property card">
          <BothThemes>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <PropertyCard property={sample} />
              <PropertyCardSkeleton />
            </div>
          </BothThemes>
        </Section>
      ) : null}

      <Section title="Brand icons">
        <BothThemes>
          <div className="flex items-center gap-4 text-fg">
            <InstagramIcon size={22} />
            <FacebookIcon size={22} />
            <TikTokIcon size={22} />
          </div>
        </BothThemes>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-5 text-label text-fg-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

/** Renders the same children twice so a token change can be judged in both themes at once. */
function BothThemes({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-bg p-5">{children}</div>
      <div className="dark rounded-md border border-border bg-bg p-5">{children}</div>
    </div>
  );
}
