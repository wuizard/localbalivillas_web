import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Parisienne } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";
import { themeInitScript } from "@/shared/lib/theme";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Accent only: the hero's "Your Private" line. One weight, latin subset. */
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${site.name} | Luxury Villa Rentals in Bali`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Luxury Villa Rentals in Bali`,
    description: site.tagline,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
  // robots.txt stops the crawl; this stops the indexing. Google can list a URL it was
  // never allowed to fetch if something links to it, and only a meta tag on the page
  // itself prevents that — so a staging host carries both.
  robots: env.isPublicSite
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#957c64",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${parisienne.variable}`}
    >
      <head>
        {/* Resolves the stored theme before first paint; without it the page renders light
            and snaps to dark on hydration. suppressHydrationWarning above covers the class
            this adds to <html>. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
