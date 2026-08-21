import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui";
import { TimeAwareImage } from "@/shared/ui/TimeAwareImage";

type HomeHeroProps = {
  image: string;
  nightImage?: string | null;
  imageAlt: string;
  /** The search bar is owned by the search feature and injected by the route. */
  searchSlot: ReactNode;
};

/**
 * One component, two silhouettes. Mobile is an inset rounded card with the search stacked
 * inside it, the way the app mockup reads; from md the same markup goes full-bleed and the
 * search bar overhangs the bottom edge. No `DesktopHero`/`PhoneHero` fork (CLAUDE.md §4).
 */
export function HomeHero({ image, nightImage, imageAlt, searchSlot }: HomeHeroProps) {
  return (
    // pb reserves room for the search card, which hangs past the hero's bottom edge.
    <section className="relative pb-11 md:pb-14">
      <div className="relative mx-4 mt-4 rounded-[18px] md:mx-0 md:mt-0 md:rounded-none">
        {/* Media sits in its own clipped layer so the search bar can overhang on desktop. */}
        <div className="absolute inset-0 overflow-hidden rounded-[18px] md:rounded-none">
          <TimeAwareImage
            day={image}
            night={nightImage}
            alt={imageAlt}
            priority
            sizes="100vw"
            quality={82}
            // The mobile card is portrait, so it needs a lower crop to keep the villa in frame.
            className="object-[center_62%] md:object-[center_45%]"
          />

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 md:bg-gradient-to-r md:from-black/70 md:via-black/45 md:to-black/10"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 hidden h-48 bg-gradient-to-t from-black/55 to-transparent md:block"
          />
        </div>

        <div className="relative flex min-h-[470px] flex-col justify-end px-5 pt-16 pb-5 md:min-h-[620px] md:justify-center md:px-0 md:pt-0 md:pb-0">
          <div className="md:container-page">
            <div className="max-w-xl">
              <p className="font-script text-[1.75rem] leading-none text-brand-300 md:text-4xl">
                Your Private
              </p>

              <h1 className="mt-1 font-display text-[2.125rem] leading-[1.1] font-medium text-white md:mt-2 md:text-6xl lg:text-[4rem]">
                Escape in Bali
              </h1>

              {/* Held to ~two lines on mobile, as drawn. */}
              <p className="mt-2.5 max-w-[15rem] text-body-sm text-white/85 md:mt-5 md:max-w-md md:text-[1.0625rem] md:leading-7">
                Luxury villas. Unforgettable experiences.
              </p>

              <ButtonLink
                href="/properties"
                variant="onImage"
                size="lg"
                className="mt-8 max-md:hidden"
              >
                Explore villas
              </ButtonLink>
            </div>

            {/* Mobile: in flow, bottom-left and short of the right edge so the photograph
                still reads beside it, with the negative margin letting it sit partly outside
                the image. From md it leaves the flow entirely and straddles the hero's bottom
                edge — in flow it landed mid-image, under a vertically centred headline. */}
            <div
              className={cn(
                "relative z-10 mt-6 -mb-11 w-[76%]",
                "md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:mb-0 md:w-auto",
                "md:container-page md:translate-y-1/2",
              )}
            >
              <div className="lg:ml-auto lg:w-[72%]">{searchSlot}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
