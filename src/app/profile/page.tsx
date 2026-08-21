import { ChevronRight, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { profileMenu, site, whatsappHref } from "@/shared/config/site";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Menu",
  description: `Contact ${site.name}, browse villas, and read our booking policies.`,
  alternates: { canonical: "/profile" },
};

/**
 * The mobile counterpart of the footer. Everything the footer carries on desktop lives
 * here, reachable from the bottom navigation, so mobile never needs to scroll to a footer
 * that is deliberately hidden.
 */
export default function ProfilePage() {
  return (
    <div className="container-page py-8 md:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-label text-brand-600 uppercase dark:text-brand-300">{site.shortName}</p>
        <h1 className="font-display text-display-lg text-fg">Menu</h1>
        <p className="max-w-md text-body text-fg-muted">
          Booking direct, with people who live here. Message us any time and a real person in
          Bali will answer.
        </p>
      </header>

      <section aria-labelledby="talk-to-us" className="mt-8">
        <h2 id="talk-to-us" className="text-label text-fg-muted uppercase">
          Talk to us
        </h2>

        <div className="mt-3 flex flex-col gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md bg-whatsapp px-4 py-4 text-white shadow-sm transition-transform duration-[120ms] active:scale-[0.98]"
          >
            <MessageCircle size={22} strokeWidth={1.8} aria-hidden />
            <span className="flex flex-col">
              <span className="text-body font-semibold">Chat on WhatsApp</span>
              <span className="text-body-sm text-white/85">Usually replies within minutes</span>
            </span>
          </a>

          <ul className="overflow-hidden rounded-md border border-border bg-surface">
            <ContactRow icon={Phone} href={`tel:+${site.whatsapp}`} label="Call us">
              {site.phoneDisplay}
            </ContactRow>
            <ContactRow icon={Mail} href={`mailto:${site.email}`} label="Email">
              {site.email}
            </ContactRow>
            <ContactRow icon={Globe} href={`https://${site.website}`} label="Website">
              {site.website}
            </ContactRow>
            <ContactRow icon={MapPin} label="Office">
              {site.address}
            </ContactRow>
          </ul>
        </div>
      </section>

      <section aria-labelledby="appearance" className="mt-8">
        <h2 id="appearance" className="text-label text-fg-muted uppercase">
          Appearance
        </h2>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3.5">
          <span className="flex flex-col">
            <span className="text-body text-fg">Theme</span>
            <span className="text-body-sm text-fg-muted">Follows your device by default</span>
          </span>
          <ThemeToggle />
        </div>
      </section>

      {profileMenu.map((group) => (
        <section key={group.title} aria-labelledby={group.title} className="mt-8">
          <h2 id={group.title} className="text-label text-fg-muted uppercase">
            {group.title}
          </h2>

          <ul className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
            {group.links.map((link) => (
              <li key={link.href} className="border-b border-border last:border-b-0">
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-3 px-4 py-4 text-body text-fg transition-colors duration-[120ms] active:bg-surface-muted"
                >
                  {link.label}
                  <ChevronRight size={18} strokeWidth={1.8} className="text-fg-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-10 text-center text-body-sm text-fg-subtle">
        © {new Date().getFullYear()} {site.name}
      </p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  href,
  label,
  children,
}: {
  icon: typeof Phone;
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <Icon size={18} strokeWidth={1.6} className="shrink-0 text-brand-500" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] leading-none font-semibold tracking-[0.06em] text-fg-muted uppercase">
          {label}
        </span>
        <span className="mt-1 truncate text-body text-fg">{children}</span>
      </span>
      {href ? (
        <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-fg-subtle" aria-hidden />
      ) : null}
    </>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      {href ? (
        <a
          href={href}
          className="flex items-center gap-3 px-4 py-3.5 transition-colors duration-[120ms] active:bg-surface-muted"
        >
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5">{inner}</div>
      )}
    </li>
  );
}
