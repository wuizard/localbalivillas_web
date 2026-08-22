import { Check, Clock, MessageCircle } from "lucide-react";
import Image from "next/image";
import { site, whatsappHref } from "@/shared/config/site";
import { ButtonLink } from "@/shared/ui";

export type ComingSoonContent = {
  eyebrow: string;
  title: string;
  lede: string;
  /** What the team already arranges by message. Every line must be something we do today. */
  availableNow: string[];
  note: string;
};

/**
 * Activities and Events have no page on localbalivillas.com — the legacy nav routes both to
 * the home page — and no CMS behind them here. Rather than dress an undefined product up as
 * a finished one, the page says plainly that it is coming, then does the one useful thing it
 * can: hand the guest to the concierge, who arranges these today.
 *
 * These pages are `noindex` and absent from the sitemap. A thin placeholder competing for
 * search terms we cannot yet serve costs more than it earns; add both back the moment there
 * is a real catalogue behind them.
 */
export function ComingSoon({
  content,
  image,
}: {
  content: ComingSoonContent;
  image: string | null;
}) {
  return (
    <div className="container-page py-10 md:py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <p className="flex items-center gap-2 text-label text-brand-600 uppercase dark:text-brand-300">
            <Clock size={14} strokeWidth={2} aria-hidden />
            {content.eyebrow} · Coming soon
          </p>

          <h1 className="mt-3 font-display text-display-lg text-fg">{content.title}</h1>

          <p className="mt-4 max-w-lg text-body text-fg-muted md:text-[1.0625rem] md:leading-7">
            {content.lede}
          </p>

          <div className="mt-7 rounded-md border border-border bg-surface-muted p-5">
            <h2 className="text-label text-fg uppercase">Available now, by message</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {content.availableNow.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-body-sm text-fg">
                  <Check
                    size={16}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-brand-500"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center gap-2 rounded-sm bg-whatsapp px-6 text-label font-semibold tracking-[0.08em] text-white uppercase shadow-sm transition-transform duration-[120ms] active:scale-[0.98]"
            >
              <MessageCircle size={16} strokeWidth={1.9} aria-hidden />
              Message the team
            </a>
            <ButtonLink href="/properties" variant="outline" size="lg">
              Browse villas
            </ButtonLink>
          </div>

          <p className="mt-5 max-w-lg text-body-sm text-fg-muted">{content.note}</p>
          <p className="mt-2 text-body-sm text-fg-subtle">Or email {site.email}.</p>
        </div>

        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-md lg:order-last">
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <span aria-hidden className="absolute inset-0 bg-brand-900/20" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
