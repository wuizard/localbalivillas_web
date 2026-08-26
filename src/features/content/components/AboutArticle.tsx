import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, whatsappHref } from "@/shared/config/site";
import { cn } from "@/shared/lib/cn";
import type { AboutBlock, AboutPage } from "../data/about-pages";

type ContactChannel = Extract<AboutBlock, { kind: "contact" }>["channel"];

const CONTACTS: Record<
  ContactChannel,
  { icon: typeof Mail; value: string; href: string | null; external?: boolean }
> = {
  email: { icon: Mail, value: site.email, href: `mailto:${site.email}` },
  phone: { icon: Phone, value: site.phoneDisplay, href: `tel:+${site.whatsapp}` },
  whatsapp: { icon: MessageCircle, value: site.phoneDisplay, href: whatsappHref, external: true },
  address: { icon: MapPin, value: site.address, href: null },
  website: { icon: Globe, value: site.website, href: `https://${site.website}`, external: true },
};

export function AboutArticle({ page }: { page: AboutPage }) {
  return (
    <article className="container-page py-8 md:py-14">
      <header className="max-w-3xl">
        <p className="text-label text-brand-600 dark:text-brand-300 uppercase">About us</p>
        <h1 className="font-display text-display-lg text-fg mt-2">{page.title}</h1>
      </header>

      <div className="mt-7 flex max-w-3xl flex-col gap-4">
        {page.blocks.map((block, index) => {
          if (block.kind === "heading") {
            return (
              <h2
                key={`${index}-${block.text}`}
                className={cn(
                  "font-display text-title text-fg",
                  // Headings after the first get room to breathe from the text above them.
                  index > 0 && "mt-4",
                )}
              >
                {block.text}
              </h2>
            );
          }

          if (block.kind === "contact") {
            return <ContactLine key={`${index}-${block.channel}`} channel={block.channel} />;
          }

          return (
            <p
              key={`${index}-${block.text}`}
              className={cn(
                "text-body text-fg-muted leading-relaxed",
                block.indented && "border-border border-l-2 pl-4",
              )}
            >
              {block.text}
            </p>
          );
        })}
      </div>
    </article>
  );
}

function ContactLine({ channel }: { channel: ContactChannel }) {
  const { icon: Icon, value, href, external } = CONTACTS[channel];

  const body = (
    <>
      <Icon size={17} strokeWidth={1.7} className="text-brand-500 shrink-0" aria-hidden />
      {value}
    </>
  );

  const className = "flex items-center gap-2.5 text-body text-fg";

  if (!href) {
    return <p className={cn(className, "text-fg-muted")}>{body}</p>;
  }

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        className,
        "w-fit rounded-sm font-medium underline-offset-4 hover:underline",
        "focus-visible:outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2",
      )}
    >
      {body}
    </a>
  );
}
