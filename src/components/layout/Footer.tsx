import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { footerNav, site, whatsappHref } from "@/shared/config/site";
import { Logo } from "@/shared/ui";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/shared/ui/BrandIcons";
import { NewsletterForm } from "./NewsletterForm";

const SOCIALS = [
  { href: site.social.instagram, label: "Instagram", icon: InstagramIcon },
  { href: site.social.facebook, label: "Facebook", icon: FacebookIcon },
  { href: whatsappHref, label: "WhatsApp", icon: MessageCircle },
  { href: site.social.tiktok, label: "TikTok", icon: TikTokIcon },
] as const;

export function Footer() {
  return (
    <footer className="bg-brand-950 text-white/75">
      <div className="container-page grid gap-10 py-14 md:py-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <Logo tone="light" width={150} />
          <p className="mt-5 max-w-xs text-body-sm leading-6 text-white/60">
            Your trusted partner for luxury villa stays, amazing experiences, and unforgettable
            events in Bali.
          </p>
          <ul className="mt-6 flex items-center gap-3">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-[120ms] hover:border-brand-400 hover:text-white"
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
          <FooterHeading>Newsletter</FooterHeading>
          <p className="mt-4 max-w-xs text-body-sm leading-6 text-white/60">
            Be the first to know about our latest villas, special offers, and travel inspiration.
          </p>
          <NewsletterForm />
        </div>

        <FooterLinks title="Quick links" links={footerNav.quickLinks} className="lg:col-span-2" />
        <FooterLinks title="Help" links={footerNav.help} className="lg:col-span-2" />

        <div className="lg:col-span-2">
          <FooterHeading>Contact us</FooterHeading>
          <ul className="mt-4 flex flex-col gap-3 text-body-sm text-white/60">
            <ContactRow icon={Phone} href={`tel:+${site.whatsapp}`}>
              {site.phoneDisplay}
            </ContactRow>
            <ContactRow icon={Mail} href={`mailto:${site.email}`}>
              {site.email}
            </ContactRow>
            <ContactRow icon={MapPin}>{site.address}</ContactRow>
            <ContactRow icon={Globe} href={`https://${site.website}`}>
              {site.website}
            </ContactRow>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-page py-5 text-center text-body-sm text-white/45">
          © {new Date().getFullYear()} {site.name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-label tracking-[0.1em] text-white uppercase">{children}</h2>;
}

function FooterLinks({
  title,
  links,
  className,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-body-sm text-white/60 transition-colors duration-[120ms] hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  href,
  children,
}: {
  icon: typeof Phone;
  href?: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <Icon size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-brand-400" aria-hidden />
      <span className="leading-6">{children}</span>
    </>
  );

  return (
    <li className="flex items-start gap-2.5">
      {href ? (
        <a href={href} className="flex items-start gap-2.5 transition-colors hover:text-white">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
